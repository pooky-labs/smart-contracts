// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { Ascension } from "@/common/Ascension.sol";
import { ITreasury } from "@/common/ITreasury.sol";
import { PookyballRarity } from "@/pookyball/IPookyball.sol";
import { PookyballAscension } from "@/pookyball/PookyballAscension.sol";
import { BaseTest } from "@test/BaseTest.sol";
import { AscensionSetup } from "@test/setup/AscensionSetup.sol";
import { PookyballSetup } from "@test/setup/PookyballSetup.sol";

contract PookyballAscensionTest is BaseTest, PookyballSetup, AscensionSetup {
  address public admin = makeAddr("admin");
  address public treasury = makeAddr("treasury");
  address public user = makeAddr("user");

  PookyballAscension ascension;

  function setUp() public {
    ascension = new PookyballAscension(pookyball, admin, signer, treasury);

    vm.startPrank(admin);
    pookyball.grantRole(pookyball.MINTER(), address(ascension));
    vm.stopPrank();
  }

  struct AscendableLevelInsufficientLevel {
    PookyballRarity rarity;
    uint256 level;
  }

  function test_ascendable_revertIneligible_insufficientLevel() public {
    AscendableLevelInsufficientLevel[3] memory data = [
      AscendableLevelInsufficientLevel(PookyballRarity.COMMON, 39),
      AscendableLevelInsufficientLevel(PookyballRarity.RARE, 59),
      AscendableLevelInsufficientLevel(PookyballRarity.EPIC, 79)
    ];

    for (uint256 i; i < data.length; i++) {
      uint256 tokenId = mintPookyball(user, data[i].rarity);
      setPookyballLevel(tokenId, data[i].level);

      vm.expectRevert(abi.encodeWithSelector(Ascension.Ineligible.selector, tokenId));
      ascension.ascendable(user, tokenId);
    }
  }

  function test_ascendable_revertLegendary() public {
    uint256 tokenId = mintPookyball(user, PookyballRarity.LEGENDARY);
    setPookyballLevel(tokenId, 100);

    vm.expectRevert(abi.encodeWithSelector(Ascension.Ineligible.selector, tokenId));
    ascension.ascendable(user, tokenId);
  }

  struct AscendablePass {
    PookyballRarity input;
    PookyballRarity output;
    uint256 level;
  }

  function test_ascendable_pass() public {
    AscendablePass[3] memory data = [
      AscendablePass(PookyballRarity.COMMON, PookyballRarity.RARE, 40),
      AscendablePass(PookyballRarity.RARE, PookyballRarity.EPIC, 60),
      AscendablePass(PookyballRarity.EPIC, PookyballRarity.LEGENDARY, 80)
    ];

    for (uint256 i; i < data.length; i++) {
      uint256 tokenId = mintPookyball(user, data[i].input);
      setPookyballLevel(tokenId, data[i].level);
      assertEq(ascension.ascendable(user, tokenId), uint8(data[i].output));
    }
  }

  /// Assert the ascend fails if one of the Pookyballs is not owned by the user
  function test_ascend_revertIneligible_nonOwner() public {
    uint256 left = mintPookyball(user, PookyballRarity.COMMON);
    uint256 right = mintPookyball(admin, PookyballRarity.COMMON);

    uint256 priceNAT = 10 ether;
    setPookyballLevel(left, 40);
    setPookyballLevel(right, 40);

    startHoax(user, priceNAT);
    pookyball.setApprovalForAll(address(ascension), true);
    bytes memory signature = sign(left, right, priceNAT);

    vm.expectRevert(abi.encodeWithSelector(Ascension.Ineligible.selector, right));
    ascension.ascend{ value: priceNAT }(left, right, priceNAT, signature);
    vm.stopPrank();

    assertEq(pookyball.ownerOf(left), user);
    assertEq(pookyball.ownerOf(right), admin);
  }

  /// Assert the ascend fails if one of the Pookyballs is not at the maximum level
  function test_ascend_revertIneligible_notMaxLevel() public {
    uint256 left = mintPookyball(user, PookyballRarity.COMMON);
    uint256 right = mintPookyball(user, PookyballRarity.COMMON);

    uint256 priceNAT = 10 ether;
    setPookyballLevel(left, 40);
    setPookyballLevel(right, 30);

    startHoax(user, priceNAT);
    pookyball.setApprovalForAll(address(ascension), true);
    bytes memory signature = sign(left, right, priceNAT);

    vm.expectRevert(abi.encodeWithSelector(Ascension.Ineligible.selector, right));
    ascension.ascend{ value: priceNAT }(left, right, priceNAT, signature);
    vm.stopPrank();

    assertEq(pookyball.ownerOf(left), user);
    assertEq(pookyball.ownerOf(right), user);
  }

  /// Assert the ascend fails if used Pookyballs are both Legendary rarity
  function test_ascend_revertIneligible_maximumRarity() public {
    uint256 left = mintPookyball(user, PookyballRarity.LEGENDARY);
    uint256 right = mintPookyball(user, PookyballRarity.LEGENDARY);

    uint256 priceNAT = 10 ether;
    setPookyballLevel(left, 120);
    setPookyballLevel(right, 120);

    startHoax(user, priceNAT);
    pookyball.setApprovalForAll(address(ascension), true);
    bytes memory signature = sign(left, right, priceNAT);

    vm.expectRevert(abi.encodeWithSelector(Ascension.Ineligible.selector, left));
    ascension.ascend{ value: priceNAT }(left, right, priceNAT, signature);
    vm.stopPrank();

    assertEq(pookyball.ownerOf(left), user);
    assertEq(pookyball.ownerOf(right), user);
  }

  /// Assert the ascend fails if used Pookyball rarities mismatch
  function test_ascend_revertRarityMismatch() public {
    uint256 left = mintPookyball(user, PookyballRarity.COMMON);
    uint256 right = mintPookyball(user, PookyballRarity.RARE);

    uint256 priceNAT = 10 ether;
    setPookyballLevel(left, 40);
    setPookyballLevel(right, 60);

    startHoax(user, priceNAT);
    pookyball.setApprovalForAll(address(ascension), true);
    bytes memory signature = sign(left, right, priceNAT);

    vm.expectRevert(
      abi.encodeWithSelector(
        Ascension.RarityMismatch.selector, PookyballRarity.RARE, PookyballRarity.EPIC
      )
    );
    ascension.ascend{ value: priceNAT }(left, right, priceNAT, signature);
    vm.stopPrank();

    assertEq(pookyball.ownerOf(left), user);
    assertEq(pookyball.ownerOf(right), user);
  }

  function test_ascend_revertInsufficientValue() public {
    uint256 left = mintPookyball(user, PookyballRarity.COMMON);
    uint256 right = mintPookyball(user, PookyballRarity.COMMON);

    uint256 priceNAT = 10 ether;
    setPookyballLevel(left, 40);
    setPookyballLevel(right, 40);

    startHoax(user, priceNAT);
    pookyball.setApprovalForAll(address(ascension), true);
    bytes memory signature = sign(left, right, priceNAT);

    vm.expectRevert(
      abi.encodeWithSelector(ITreasury.InsufficientValue.selector, priceNAT, priceNAT - 1)
    );
    ascension.ascend{ value: priceNAT - 1 }(left, right, priceNAT, signature);
    vm.stopPrank();

    assertEq(pookyball.ownerOf(left), user);
    assertEq(pookyball.ownerOf(right), user);
  }

  struct AscendPass {
    PookyballRarity input;
    PookyballRarity output;
    uint256 level;
    uint256 priceNAT;
  }

  function test_ascend_pass() public {
    AscendPass[3] memory data = [
      AscendPass(PookyballRarity.COMMON, PookyballRarity.RARE, 40, 10 ether),
      AscendPass(PookyballRarity.RARE, PookyballRarity.EPIC, 60, 40 ether),
      AscendPass(PookyballRarity.EPIC, PookyballRarity.LEGENDARY, 80, 160 ether)
    ];

    for (uint256 i; i < data.length; i++) {
      uint256 left = mintPookyball(user, data[i].input);
      uint256 right = mintPookyball(user, data[i].input);

      uint256 priceNAT = data[i].priceNAT;
      setPookyballLevel(left, data[i].level);
      setPookyballLevel(right, data[i].level);

      startHoax(user, priceNAT);
      pookyball.setApprovalForAll(address(ascension), true);
      bytes memory signature = sign(left, right, priceNAT);

      uint256 ascendedId = ascension.ascend{ value: priceNAT }(left, right, priceNAT, signature);
      vm.stopPrank();

      assertEq(pookyball.ownerOf(left), ascension.dead());
      assertEq(pookyball.ownerOf(right), ascension.dead());
      assertEq(pookyball.ownerOf(ascendedId), user);
      assertTrue(pookyball.metadata(ascendedId).rarity == data[i].output);
    }
  }
}
