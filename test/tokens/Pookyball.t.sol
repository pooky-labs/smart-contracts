// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { VRFConsumerBaseV2 } from "chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import { BaseTest } from "../BaseTest.sol";
import { Strings } from "openzeppelin/utils/Strings.sol";
import { IPookyball } from "../../src/interfaces/IPookyball.sol";
import { Pookyball } from "../../src/tokens/Pookyball.sol";
import { PookyballMetadata, PookyballRarity } from "../../src/interfaces/IPookyball.sol";
import { PookyballSetup } from "../setup/PookyballSetup.sol";
import { AccessControlAssertions } from "../utils/AccessControlAssertions.sol";

contract PookyballTest is BaseTest, AccessControlAssertions, PookyballSetup {
  using Strings for uint256;

  address public admin = makeAddr("admin");
  address public minter = makeAddr("minter");
  address public game = makeAddr("game");
  address public user1 = makeAddr("user1");
  address public user2 = makeAddr("user2");

  function testFuzz_setContractURI_revertMissingRole(string memory newURI) public {
    expectRevertMissingRole(user1, pookyball.DEFAULT_ADMIN_ROLE());
    vm.prank(user1);
    pookyball.setContractURI(newURI);
  }

  function testFuzz_setContractURI_pass(string memory newURI) public {
    vm.prank(admin);
    pookyball.setContractURI(newURI);
    assertEq(bytes(pookyball.contractURI()), bytes(newURI));
  }

  function testFuzz_setBaseURI_revertMissingRole(string memory newURI) public {
    expectRevertMissingRole(user1, pookyball.DEFAULT_ADMIN_ROLE());
    vm.prank(user1);
    pookyball.setBaseURI(newURI);
  }

  function testFuzz_setBaseURI_pass(string memory newURI) public {
    vm.prank(admin);
    pookyball.setBaseURI(newURI);
    assertEq(bytes(pookyball.baseURI()), bytes(newURI));
  }

  function test_tokenURI_pass() public {
    uint256 tokenId = mintPookyball(user1);

    assertEq(
      bytes(pookyball.tokenURI(tokenId)),
      abi.encodePacked("https://metadata.pooky.gg/pookyballs/", tokenId.toString())
    );
  }

  function testFuzz_setERC2981Receiver_revertMissingRole(address newReceiver) public {
    expectRevertMissingRole(user1, pookyball.DEFAULT_ADMIN_ROLE());
    vm.prank(user1);
    pookyball.setERC2981Receiver(newReceiver);
  }

  function testFuzz_setERC2981Receiver_pass(address newReceiver) public {
    vm.assume(newReceiver != address(0));
    uint256 tokenId = mintPookyball(user1);

    vm.prank(admin);
    pookyball.setERC2981Receiver(newReceiver);
    (address receiver,) = pookyball.royaltyInfo(tokenId, 1 ether);
    assertEq(receiver, newReceiver);
  }

  function testFuzz_metadata_pass(uint8 raritySeed) public {
    PookyballRarity rarity = randomPookyballRarity(raritySeed);
    uint256 tokenId = mintPookyball(user1, rarity);
    PookyballMetadata memory metadata = pookyball.metadata(tokenId);

    assertEq(uint8(metadata.rarity), uint8(rarity));
    assertEq(metadata.level, 0);
    assertEq(metadata.pxp, 0);
  }

  function testFuzz_mint_revertMissingRole(uint8 raritySeed) public {
    address[] memory addresses = new address[](1);
    addresses[0] = user1;
    PookyballRarity[] memory rarities = new PookyballRarity[](1);
    rarities[0] = randomPookyballRarity(raritySeed);

    expectRevertMissingRole(user1, pookyball.MINTER());
    vm.prank(user1);
    pookyball.mint(addresses, rarities);
  }

  function testFuzz_mint_revertArgumentSizeMismatch(uint8 raritySeed) public {
    address[] memory addresses = new address[](2);
    addresses[0] = user1;
    addresses[1] = user2;
    PookyballRarity[] memory rarities = new PookyballRarity[](1);
    rarities[0] = randomPookyballRarity(raritySeed);

    vm.expectRevert(abi.encodeWithSelector(IPookyball.ArgumentSizeMismatch.selector, 2, 1));
    vm.prank(minter);
    pookyball.mint(addresses, rarities);
  }

  function testFuzz_mint_pass(uint8 raritySeed) public {
    uint256 tokenId = mintPookyball(user1, randomPookyballRarity(raritySeed));

    assertEq(pookyball.ownerOf(tokenId), user1);
  }

  function testFuzz_setLevel_revertMissingRole(uint256 newLevel) public {
    uint256 tokenId = mintPookyball(user1);

    expectRevertMissingRole(user1, pookyball.GAME());
    vm.prank(user1);
    pookyball.setLevel(tokenId, newLevel);
  }

  function testFuzz_setLevel_pass(uint256 newLevel) public {
    uint256 tokenId = mintPookyball(user1);

    vm.prank(game);
    pookyball.setLevel(tokenId, newLevel);
    assertEq(pookyball.metadata(tokenId).level, newLevel);
  }

  function testFuzz_setPXP_revertMissingRole(uint256 newPXP) public {
    uint256 tokenId = mintPookyball(user1);

    expectRevertMissingRole(user1, pookyball.GAME());
    vm.prank(user1);
    pookyball.setPXP(tokenId, newPXP);
  }

  function testFuzz_setPXP_pass(uint256 newPXP) public {
    uint256 tokenId = mintPookyball(user1);

    vm.prank(game);
    pookyball.setPXP(tokenId, newPXP);
    assertEq(pookyball.metadata(tokenId).pxp, newPXP);
  }

  function testFuzz_fullfillRandomWords_revertOnlyCoordinatorCanFulfill(uint256 seed) public {
    uint256 tokenId = mintPookyball(user1);

    uint256[] memory words = new uint[](1);
    words[0] = seed;

    vm.expectRevert(
      abi.encodeWithSelector(
        VRFConsumerBaseV2.OnlyCoordinatorCanFulfill.selector, user1, address(vrf)
      )
    );
    vm.prank(address(user1));
    pookyball.rawFulfillRandomWords(1, words);

    assertEq(pookyball.metadata(tokenId).seed, 0);
  }

  function testFuzz_fullfillRandomWords_passSingle(uint256 seed) public {
    uint256 tokenId = mintPookyball(user1);

    uint256[] memory words = new uint[](1);
    words[0] = seed;

    vm.prank(address(vrf));
    pookyball.rawFulfillRandomWords(1, words);

    assertEq(pookyball.metadata(tokenId).seed, seed);
  }

  function testFuzz_fullfillRandomWords_passMulti(uint8 seed1, uint8 seed2) public {
    address[] memory addresses = new address[](2);
    addresses[0] = user1;
    addresses[1] = user1;

    PookyballRarity[] memory rarities = new PookyballRarity[](2);
    rarities[0] = randomPookyballRarity(seed1);
    rarities[1] = randomPookyballRarity(seed2);

    vm.prank(minter);
    uint256 tokenId2 = pookyball.mint(addresses, rarities);
    uint256 tokenId1 = tokenId2 - 1;

    // seeds are assigned in the reverse order
    uint256[] memory words = new uint[](2);
    words[0] = seed2;
    words[1] = seed1;

    vm.prank(address(vrf));
    pookyball.rawFulfillRandomWords(1, words);

    assertEq(pookyball.metadata(tokenId1).seed, seed1);
    assertEq(pookyball.metadata(tokenId2).seed, seed2);
  }

  function test_setApprovalForAll_pass() public {
    vm.prank(user1);
    pookyball.setApprovalForAll(user2, true);
    assertTrue(pookyball.isApprovedForAll(user1, user2));
  }

  function test_approve_pass() public {
    uint256 tokenId = mintPookyball(user1);
    vm.prank(user1);
    pookyball.approve(user2, tokenId);
  }

  function test_transferFrom_pass() public {
    uint256 tokenId = mintPookyball(user1);
    vm.prank(user1);
    pookyball.transferFrom(user1, user2, tokenId);
  }

  function test_safeTransferFrom_pass() public {
    uint256 tokenId = mintPookyball(user1);
    vm.prank(user1);
    pookyball.safeTransferFrom(user1, user2, tokenId);
  }

  function testFuzz_safeTransferFrom_pass(bytes memory data) public {
    uint256 tokenId = mintPookyball(user1);
    vm.prank(user1);
    pookyball.safeTransferFrom(user1, user2, tokenId, data);
  }

  function test_supportsInterface() public {
    assertTrue(pookyball.supportsInterface(0x01ffc9a7)); // IERC165
    assertTrue(pookyball.supportsInterface(0x80ac58cd)); // IERC721
    assertTrue(pookyball.supportsInterface(0x5b5e139f)); // IERC721Metadata
    assertTrue(pookyball.supportsInterface(0x2a55205a)); // IERC2981
  }
}
