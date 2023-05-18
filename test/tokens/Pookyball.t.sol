// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Test } from "forge-std/Test.sol";
import { Strings } from "openzeppelin/utils/Strings.sol";
import { IPookyball } from "../../src/interfaces/IPookyball.sol";
import { Pookyball } from "../../src/tokens/Pookyball.sol";
import { PookyballRarity } from "../../src/types/PookyballRarity.sol";
import { PookyballMetadata } from "../../src/types/PookyballMetadata.sol";
import { PookyballSetup } from "../setup/PookyballSetup.sol";
import { AccessControlAssertions } from "../utils/AccessControlAssertions.sol";

contract PookyballTest is Test, AccessControlAssertions, PookyballSetup {
  using Strings for uint256;

  address public admin = makeAddr("admin");
  address public minter = makeAddr("minter");
  address public user1 = makeAddr("user1");
  address public user2 = makeAddr("user2");

  function test_setContractURI_revertMissingRole(string memory newURI) public {
    expectRevertMissingRole(user1, pookyball.DEFAULT_ADMIN_ROLE());
    vm.prank(user1);
    pookyball.setContractURI(newURI);
  }

  function test_setContractURI_pass(string memory newURI) public {
    vm.prank(admin);
    pookyball.setContractURI(newURI);
    assertEq(bytes(pookyball.contractURI()), bytes(newURI));
  }

  function test_setBaseURI_revertMissingRole(string memory newURI) public {
    expectRevertMissingRole(user1, pookyball.DEFAULT_ADMIN_ROLE());
    vm.prank(user1);
    pookyball.setBaseURI(newURI);
  }

  function test_setBaseURI_pass(string memory newURI) public {
    vm.prank(admin);
    pookyball.setBaseURI(newURI);
    assertEq(bytes(pookyball.baseURI()), bytes(newURI));
  }

  function test_tokenURI_pass() public {
    uint256 tokenId = mintPookyball(user1);

    assertEq(
      bytes(pookyball.tokenURI(tokenId)), abi.encodePacked("https://metadata.pooky.gg/pookyballs/", tokenId.toString())
    );
  }

  function test_setERC2981Receiver_revertMissingRole(address newReceiver) public {
    expectRevertMissingRole(user1, pookyball.DEFAULT_ADMIN_ROLE());
    vm.prank(user1);
    pookyball.setERC2981Receiver(newReceiver);
  }

  function test_setERC2981Receiver_pass(address newReceiver) public {
    vm.assume(newReceiver != address(0));
    uint256 tokenId = mintPookyball(user1);

    vm.prank(admin);
    pookyball.setERC2981Receiver(newReceiver);
    (address receiver,) = pookyball.royaltyInfo(tokenId, 1 ether);
    assertEq(receiver, newReceiver);
  }

  function test_metadata_pass(uint256 raritySeed) public {
    PookyballRarity rarity = randomPookyballRarity(raritySeed);
    uint256 tokenId = mintPookyball(user1, rarity);
    PookyballMetadata memory metadata = pookyball.metadata(tokenId);

    assertEq(uint8(metadata.rarity), uint8(rarity));
    assertEq(metadata.level, 0);
    assertEq(metadata.pxp, 0);
  }

  function test_mint_revertMissingRole(uint256 raritySeed) public {
    address[] memory addresses = new address[](1);
    addresses[0] = user1;
    PookyballRarity[] memory rarities = new PookyballRarity[](1);
    rarities[0] = randomPookyballRarity(raritySeed);

    expectRevertMissingRole(user1, pookyball.MINTER());
    vm.prank(user1);
    pookyball.mint(addresses, rarities);
  }

  function test_mint_revertArgumentSizeMismatch(uint256 raritySeed) public {
    address[] memory addresses = new address[](2);
    addresses[0] = user1;
    addresses[1] = user2;
    PookyballRarity[] memory rarities = new PookyballRarity[](1);
    rarities[0] = randomPookyballRarity(raritySeed);

    vm.expectRevert(abi.encodeWithSelector(IPookyball.ArgumentSizeMismatch.selector, 2, 1));
    vm.prank(minter);
    pookyball.mint(addresses, rarities);
  }

  function test_mint_pass(uint256 raritySeed) public {
    uint256 tokenId = mintPookyball(user1, randomPookyballRarity(raritySeed));

    assertEq(pookyball.ownerOf(tokenId), user1);
  }
}
