// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { VRFConsumerBaseV2 } from "chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import { Test } from "forge-std/Test.sol";
import { Strings } from "openzeppelin/utils/Strings.sol";
import { Ownable } from "solady/auth/Ownable.sol";
import { StickerMetadata, StickerMint, StickerRarity } from "../../src/interfaces/IStickers.sol";
import { StickersSetup } from "../setup/StickersSetup.sol";

contract StickersTest is Test, StickersSetup {
  using Strings for uint256;

  address public admin;
  address public minter = makeAddr("minter");
  address public game = makeAddr("game");
  address public operator = makeAddr("operator");
  address public user1 = makeAddr("user1");
  address public user2 = makeAddr("user2");

  function setUp() public {
    admin = stickers.owner();
  }

  function test_setContractURI_revertUnauthorized(string memory newURI) public {
    vm.expectRevert(Ownable.Unauthorized.selector);
    vm.prank(user1);
    stickers.setContractURI(newURI);
  }

  function test_setContractURI_pass(string memory newURI) public {
    vm.prank(admin);
    stickers.setContractURI(newURI);
    assertEq(bytes(stickers.contractURI()), bytes(newURI));
  }

  function test_setBaseURI_revertUnauthorized(string memory newURI) public {
    vm.expectRevert(Ownable.Unauthorized.selector);
    vm.prank(user1);
    stickers.setBaseURI(newURI);
  }

  function test_setBaseURI_pass(string memory newURI) public {
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

  function test_setERC2981Receiver_revertUnauthorized(address newReceiver) public {
    vm.expectRevert(Ownable.Unauthorized.selector);
    vm.prank(user1);
    stickers.setERC2981Receiver(newReceiver);
  }

  function test_setERC2981Receiver_pass(address newReceiver) public {
    vm.assume(newReceiver != address(0));
    uint256 tokenId = mintSticker(user1);

    vm.prank(admin);
    stickers.setERC2981Receiver(newReceiver);
    (address receiver,) = stickers.royaltyInfo(tokenId, 1 ether);
    assertEq(receiver, newReceiver);
  }

  function test_metadata_pass(uint256 raritySeed) public {
    StickerRarity rarity = randomStickerRarity(raritySeed);
    uint256 tokenId = mintSticker(user1, rarity);
    StickerMetadata memory metadata = stickers.metadata(tokenId);

    assertEq(uint8(metadata.rarity), uint8(rarity));
    assertEq(metadata.level, 0);
  }

  function test_mint_oneCommon() public {
    vm.prank(minter);
    StickerMint[] memory requests = new StickerMint[](1);
    requests[0] = StickerMint(user1, StickerRarity.COMMON);
    stickers.mint(requests);
  }

  function test_setLevel_pass(uint128 newLevel) public {
    uint256 tokenId = mintSticker(user1);

    vm.prank(game);
    stickers.setLevel(tokenId, newLevel);

    assertEq(stickers.metadata(tokenId).level, newLevel);
  }

  function test_fullfillRandomWords_revertOnlyCoordinatorCanFulfill(uint256 seed) public {
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

    assertEq(stickers.metadata(tokenId).seed, 0);
  }

  function test_fullfillRandomWords_passSingle(uint256 seed) public {
    uint256 tokenId = mintSticker(user1);

    uint256[] memory words = new uint[](1);
    words[0] = seed;

    vm.prank(address(vrf));
    stickers.rawFulfillRandomWords(1, words);

    assertEq(stickers.metadata(tokenId).seed, seed);
  }

  function test_fullfillRandomWords_passMulti(uint256 seed1, uint256 seed2) public {
    StickerMint[] memory requests = new StickerMint[](2);
    requests[0] = StickerMint(user1, randomStickerRarity(seed1));
    requests[1] = StickerMint(user1, randomStickerRarity(seed2));

    vm.prank(minter);
    uint256 tokenId2 = stickers.mint(requests);
    uint256 tokenId1 = tokenId2 - 1;

    // seeds are assigned in the reverse order
    uint256[] memory words = new uint[](2);
    words[0] = seed2;
    words[1] = seed1;

    vm.prank(address(vrf));
    stickers.rawFulfillRandomWords(1, words);

    assertEq(stickers.metadata(tokenId1).seed, seed1);
    assertEq(stickers.metadata(tokenId2).seed, seed2);
  }

  function test_isApprovedForAll_operator() public {
    assertTrue(stickers.isApprovedForAll(user1, operator));
    assertTrue(stickers.isApprovedForAll(user2, operator));
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

  function test_safeTransferFrom_pass(bytes memory data) public {
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
