// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { VRFConsumerBaseV2 } from "chainlink/vrf/VRFConsumerBaseV2.sol";
import { Strings } from "openzeppelin/utils/Strings.sol";
import { Ownable } from "solady/auth/Ownable.sol";
import { StickerMetadata, StickerMint, StickerRarity } from "@/stickers/IStickers.sol";
import { BaseTest } from "@test/BaseTest.sol";
import { StickersSetup } from "@test/setup/StickersSetup.sol";

contract StickersTest is BaseTest, StickersSetup {
  using Strings for uint256;

  address public admin;
  address public minter = makeAddr("minter");
  address public game = makeAddr("game");
  address public user1 = makeAddr("user1");
  address public user2 = makeAddr("user2");

  function setUp() public {
    admin = stickers.owner();
  }

  function testFuzz_setContractURI_revertUnauthorized(string memory newURI) public {
    vm.expectRevert(Ownable.Unauthorized.selector);
    vm.prank(user1);
    stickers.setContractURI(newURI);
  }

  function testFuzz_setContractURI_pass(string memory newURI) public {
    vm.prank(admin);
    stickers.setContractURI(newURI);
    assertEq(bytes(stickers.contractURI()), bytes(newURI));
  }

  function testFuzz_setBaseURI_revertUnauthorized(string memory newURI) public {
    vm.expectRevert(Ownable.Unauthorized.selector);
    vm.prank(user1);
    stickers.setBaseURI(newURI);
  }

  function testFuzz_setBaseURI_pass(string memory newURI) public {
    vm.prank(admin);
    stickers.setBaseURI(newURI);
    assertEq(bytes(stickers.baseURI()), bytes(newURI));
  }

  function test_tokenURI_pass() public {
    uint256 tokenId = mintSticker(user1);

    assertEq(
      bytes(stickers.tokenURI(tokenId)),
      abi.encodePacked("https://metadata.pooky.gg/stickers/", tokenId.toString())
    );
  }

  function testFuzz_setDefaultRoyalty_revertUnauthorized(address newReceiver) public {
    vm.expectRevert(Ownable.Unauthorized.selector);
    vm.prank(user1);
    stickers.setDefaultRoyalty(newReceiver, 700);
  }

  function testFuzz_setDefaultRoyalty_pass(address newReceiver) public {
    vm.assume(newReceiver != address(0));
    uint256 tokenId = mintSticker(user1);

    vm.prank(admin);
    stickers.setDefaultRoyalty(newReceiver, 700);
    (address receiver,) = stickers.royaltyInfo(tokenId, 1 ether);
    assertEq(receiver, newReceiver);
  }

  function testFuzz_metadata_pass(uint256 raritySeed) public {
    StickerRarity rarity = randomStickerRarity(raritySeed);
    uint256 tokenId = mintSticker(user1, rarity);
    StickerMetadata memory metadata = stickers.metadata(tokenId);

    assertEq(uint8(metadata.rarity), uint8(rarity));
    assertEq(metadata.level, 0);
  }

  function test_mint_oneCommon() public {
    vm.prank(minter);
    StickerRarity[] memory rarities = new StickerRarity[](1);
    rarities[0] = StickerRarity.COMMON;
    stickers.mint(user1, rarities);
  }

  function test_setLevel_pass(uint248 newLevel) public {
    uint256 tokenId = mintSticker(user1);

    vm.prank(game);
    stickers.setLevel(tokenId, newLevel);

    assertEq(stickers.metadata(tokenId).level, newLevel);
  }

  function testFuzz_fullfillRandomWords_revertOnlyCoordinatorCanFulfill(uint256 seed) public {
    uint256 tokenId = mintSticker(user1);

    uint256[] memory words = new uint[](1);
    words[0] = seed;

    vm.expectRevert(
      abi.encodeWithSelector(
        VRFConsumerBaseV2.OnlyCoordinatorCanFulfill.selector, user1, address(vrf)
      )
    );
    vm.prank(address(user1));
    stickers.rawFulfillRandomWords(1, words);

    assertEq(stickers.seeds(tokenId), 0);
  }

  function testFuzz_fullfillRandomWords_passSingle(uint256 seed) public {
    uint256 tokenId = mintSticker(user1);

    uint256[] memory words = new uint[](1);
    words[0] = seed;

    vm.prank(address(vrf));
    stickers.rawFulfillRandomWords(1, words);

    assertEq(stickers.seeds(tokenId), seed);
  }

  function testFuzz_fullfillRandomWords_passMulti(uint256 seed1, uint256 seed2) public {
    StickerRarity[] memory rarities = new StickerRarity[](2);
    rarities[0] = randomStickerRarity(seed1);
    rarities[1] = randomStickerRarity(seed2);

    vm.prank(minter);
    stickers.mint(user1, rarities);
    uint256 tokenId2 = stickers.nextTokenId() - 1;
    uint256 tokenId1 = tokenId2 - 1;

    // seeds are assigned in the reverse order
    uint256[] memory words = new uint[](2);
    words[0] = seed2;
    words[1] = seed1;

    vm.prank(address(vrf));
    stickers.rawFulfillRandomWords(1, words);

    assertEq(stickers.seeds(tokenId1), seed1);
    assertEq(stickers.seeds(tokenId2), seed2);
  }

  function test_setApprovalForAll_pass() public {
    vm.prank(user1);
    stickers.setApprovalForAll(user2, true);
    assertTrue(stickers.isApprovedForAll(user1, user2));
  }

  function test_approve_pass() public {
    uint256 tokenId = mintSticker(user1);
    vm.prank(user1);
    stickers.approve(user2, tokenId);
  }

  function test_transferFrom_pass() public {
    uint256 tokenId = mintSticker(user1);
    vm.prank(user1);
    stickers.transferFrom(user1, user2, tokenId);
  }

  function test_safeTransferFrom_pass() public {
    uint256 tokenId = mintSticker(user1);
    vm.prank(user1);
    stickers.safeTransferFrom(user1, user2, tokenId);
  }

  function testFuzz_safeTransferFrom_pass(bytes memory data) public {
    uint256 tokenId = mintSticker(user1);
    vm.prank(user1);
    stickers.safeTransferFrom(user1, user2, tokenId, data);
  }

  function test_supportsInterface() public {
    assertTrue(stickers.supportsInterface(0x01ffc9a7)); // IERC165
    assertTrue(stickers.supportsInterface(0x80ac58cd)); // IERC721
    assertTrue(stickers.supportsInterface(0x5b5e139f)); // IERC721Metadata
    assertTrue(stickers.supportsInterface(0x2a55205a)); // IERC2981
  }
}
