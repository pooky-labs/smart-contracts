// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Test } from "forge-std/Test.sol";
import { Level } from "../../src/game/Level.sol";
import { POK } from "../../src/tokens/POK.sol";
import { Pookyball } from "../../src/tokens/Pookyball.sol";
import { PookyballRarity } from "../../src/types/PookyballRarity.sol";
import { POKSetup } from "../setup/POKSetup.sol";
import { PookyballSetup } from "../setup/PookyballSetup.sol";

contract LevelTest is Test, POKSetup, PookyballSetup {
  address public user = makeAddr("user");
  PookyballRarity[] public rarities = [
    PookyballRarity.COMMON,
    PookyballRarity.RARE,
    PookyballRarity.EPIC,
    PookyballRarity.LEGENDARY,
    PookyballRarity.MYTHIC
  ];

  Level public level;

  function setUp() public {
    level = new Level(pok, pookyball);
  }

  function test_levelPXP() public {
    uint256 maxDelta = 1e18; // 1 PXP delta is acceptable
    assertApproxEqAbs(level.levelPXP(0), 0, maxDelta);
    assertApproxEqAbs(level.levelPXP(1), 60e18, maxDelta);
    assertApproxEqAbs(level.levelPXP(2), 65e18, maxDelta);
    assertApproxEqAbs(level.levelPXP(10), 115e18, maxDelta);
    assertApproxEqAbs(level.levelPXP(20), 237e18, maxDelta);
  }

  function test_levelPOK() public {
    uint256 maxDelta = 0.1e18; // 0.1 POK delta is acceptable
    assertApproxEqAbs(level.levelPOK(0), 0, maxDelta);
    assertApproxEqAbs(level.levelPOK(1), 4.8e18, maxDelta);
    assertApproxEqAbs(level.levelPOK(2), 5.2e18, maxDelta);
    assertApproxEqAbs(level.levelPOK(10), 9.2e18, maxDelta);
    assertApproxEqAbs(level.levelPOK(20), 19e18, maxDelta);
  }

  function test_levelPOKCost_equalToLevelPOKIfPookyballHasEnoughPXP(
    uint256 nextLevel,
    uint256 rarity256
  ) public {
    PookyballRarity rarity = randomPookyballRarity(rarity256);
    nextLevel = bound(nextLevel, 1, level.maxLevels(rarity));
    uint256 tokenId = mintPookyball(user, PookyballRarity.COMMON);

    vm.startPrank(makeAddr("game"));
    pookyball.setLevel(tokenId, nextLevel - 1);
    pookyball.setPXP(tokenId, level.levelPXP(nextLevel) * 10);
    vm.stopPrank();

    assertEq(level.levelPOKCost(tokenId, 1), level.levelPOK(nextLevel));
  }

  function test_levelPOKCost_greaterThanLevelPOKIfPookyballHasNotEnoughPXP(
    uint256 nextLevel,
    uint256 rarity256
  ) public {
    PookyballRarity rarity = randomPookyballRarity(rarity256);
    nextLevel = bound(nextLevel, 1, level.maxLevels(rarity));
    uint256 tokenId = mintPookyball(user, PookyballRarity.COMMON);

    vm.startPrank(makeAddr("game"));
    pookyball.setLevel(tokenId, nextLevel - 1);
    pookyball.setPXP(tokenId, level.levelPXP(nextLevel) / 2);
    vm.stopPrank();

    assertGt(level.levelPOKCost(tokenId, 1), level.levelPOK(nextLevel));
  }

  function test_levelUp_revertsIfPookyballHasReachedMaximumLevel(uint256 rarity256) public {
    PookyballRarity rarity = randomPookyballRarity(rarity256);
    uint256 tokenId = mintPookyball(user, rarity);
    uint256 maxLevel = level.maxLevels(rarity);

    vm.prank(makeAddr("game"));
    pookyball.setLevel(tokenId, maxLevel);
    mintPOK(user, level.levelPOKCost(tokenId, 1));

    vm.expectRevert(abi.encodeWithSelector(Level.MaximumLevelReached.selector, tokenId, maxLevel));
    vm.prank(user);
    level.levelUp(tokenId, 1);

    uint256 currentLevel = pookyball.metadata(tokenId).level;
    assertEq(currentLevel, maxLevel);
  }

  function test_levelUp_revertsIfInsufficientPOK(uint256 currentLevel, uint256 rarity256) public {
    PookyballRarity rarity = randomPookyballRarity(rarity256);
    currentLevel = bound(currentLevel, 0, 39);

    uint256 tokenId = mintPookyball(user, rarity);

    vm.prank(makeAddr("game"));
    pookyball.setLevel(tokenId, currentLevel);

    uint256 pokCost = level.levelPOKCost(tokenId, 1);
    mintPOK(user, pokCost / 2); // Not enough POK to cover the full level PXP

    vm.expectRevert(
      abi.encodeWithSelector(Level.InsufficientPOKBalance.selector, pokCost, pokCost / 2)
    );
    vm.prank(user);
    level.levelUp(tokenId, 1);
  }

  function test_levelUp_revertIfMultipleLevelsWouldExceedMaximumLevel(uint256 rarity256) public {
    PookyballRarity rarity = randomPookyballRarity(rarity256);
    uint256 maxLevel = level.maxLevels(rarity);
    uint256 tokenId = mintPookyball(user, rarity);

    vm.prank(makeAddr("game"));
    pookyball.setLevel(tokenId, maxLevel - 2);

    mintPOK(user, level.levelPOKCost(tokenId, 3));

    vm.expectRevert(abi.encodeWithSelector(Level.MaximumLevelReached.selector, tokenId, maxLevel));
    vm.prank(user);
    level.levelUp(tokenId, 3);
  }
}
