// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { BaseTest } from "../BaseTest.sol";
import { PookyballLevel, Pricing } from "../../src/game/PookyballLevel.sol";
import { PookyballRarity } from "../../src/interfaces/IPookyball.sol";
import { POKSetup } from "../setup/POKSetup.sol";
import { PookyballSetup } from "../setup/PookyballSetup.sol";

struct SlotData {
  uint256 expected;
  uint256 level;
}

struct MaxLevelData {
  PookyballRarity rarity;
  uint256 maxLevel;
}

struct LevelData {
  uint256 currentPXP;
  uint256 expectedPOK;
  uint256 increase;
  uint256 level;
  uint256 remainingPXP;
  uint256 value;
}

contract PookyballLeveltest is BaseTest, PookyballSetup, POKSetup {
  address admin = makeAddr("admin");
  address game = makeAddr("game");
  address treasury = makeAddr("treasury");

  PookyballLevel level;

  function setUp() public {
    level = new PookyballLevel(pookyball, pok, treasury);

    vm.startPrank(admin);
    pookyball.grantRole(pookyball.GAME(), address(level));
    pok.grantRole(pok.BURNER(), address(level));
    vm.stopPrank();
  }

  function test_slots() public {
    // coverage from setUp() function is not counted
    // see https://github.com/foundry-rs/foundry/issues/3453
    level.compute(2, 120);

    (SlotData[] memory dataset) = abi.decode(loadDataset("PookyballLevel_slots.json"), (SlotData[]));

    for (uint256 i; i < dataset.length; i++) {
      assertApproxEqRelDecimal(
        level.slots(dataset[i].level),
        dataset[i].expected * 10 ** (level.PXP_DECIMALS() - 3),
        1e14, // max 0.01% delta
        18
      );
    }
  }

  function test_preview() public {
    (LevelData[] memory dataset) =
      abi.decode(loadDataset("PookyballLevel_pricing.json"), (LevelData[]));

    for (uint256 i; i < dataset.length; i++) {
      address user = makeAddr(string(abi.encodePacked(i)));
      uint256 tokenId = mintPookyball(user, PookyballRarity.LEGENDARY);

      vm.startPrank(game);
      pookyball.setLevel(tokenId, dataset[i].level);
      pookyball.setPXP(tokenId, dataset[i].currentPXP);
      vm.stopPrank();

      Pricing memory pricing = level.getPricing(tokenId, dataset[i].increase, dataset[i].value);

      assertApproxEqRelDecimal(
        pricing.remainingPXP,
        dataset[i].remainingPXP,
        1e14, // max 0.01% delta
        18,
        "remainingPXP"
      );

      assertApproxEqRelDecimal(
        pricing.gapPOK + pricing.feePOK,
        dataset[i].expectedPOK,
        1e14, // max 0.01% delta
        18,
        "expectedPOK"
      );
    }
  }

  function test_levelUp_revertInsufficientPOK() public {
    (LevelData[] memory dataset) =
      abi.decode(loadDataset("PookyballLevel_pricing.json"), (LevelData[]));
    LevelData memory data;

    // find first case which has expectedPOK > 0
    for (uint256 i; i < dataset.length; i++) {
      if (dataset[i].expectedPOK > 0) {
        data = dataset[i];
        break;
      }
    }

    address user = makeAddr("user");
    uint256 tokenId = mintPookyball(user);

    vm.startPrank(game);
    pookyball.setLevel(tokenId, data.level);
    pookyball.setPXP(tokenId, data.currentPXP);
    vm.stopPrank();

    mintPOK(user, data.expectedPOK - 0.01 ether);

    Pricing memory pricing = level.getPricing(tokenId, data.increase, data.value);
    vm.expectRevert(
      abi.encodeWithSelector(
        PookyballLevel.InsufficientPOK.selector,
        pricing.feePOK + pricing.gapPOK,
        pok.balanceOf(user)
      )
    );

    hoax(user, data.value);
    level.levelUp{ value: data.value }(tokenId, data.increase);
  }

  function test_levelUp_revertMaximumLevelReach() public {
    MaxLevelData[5] memory dataset = [
      MaxLevelData(PookyballRarity.COMMON, 40),
      MaxLevelData(PookyballRarity.RARE, 60),
      MaxLevelData(PookyballRarity.EPIC, 80),
      MaxLevelData(PookyballRarity.LEGENDARY, 100),
      MaxLevelData(PookyballRarity.MYTHIC, 120)
    ];

    for (uint256 i = 0; i < dataset.length; i++) {
      address user = makeAddr(string(abi.encodePacked(i)));
      uint256 tokenId = mintPookyball(user, dataset[i].rarity);

      vm.startPrank(game);
      pookyball.setLevel(tokenId, dataset[i].maxLevel - 1);
      pookyball.setPXP(tokenId, 1e9 ether); // Enough PXP to pass any level
      vm.stopPrank();

      mintPOK(user, 1e9 ether); // Enough POK to pass any level

      vm.prank(user);
      level.levelUp(tokenId, 1); // First level up should pass => ball is now at the maximum level

      // Second level up should revert
      vm.expectRevert(
        abi.encodeWithSelector(
          PookyballLevel.MaximumLevelReached.selector, tokenId, dataset[i].maxLevel
        )
      );
      vm.prank(user);
      level.levelUp(tokenId, 1);
    }
  }

  function test_levelUp_pass() public {
    (LevelData[] memory dataset) =
      abi.decode(loadDataset("PookyballLevel_pricing.json"), (LevelData[]));

    for (uint256 i; i < dataset.length; i++) {
      address user = makeAddr(string(abi.encodePacked(i)));
      uint256 tokenId = mintPookyball(user, PookyballRarity.LEGENDARY);

      vm.startPrank(game);
      pookyball.setLevel(tokenId, dataset[i].level);
      pookyball.setPXP(tokenId, dataset[i].currentPXP);
      vm.stopPrank();

      mintPOK(user, dataset[i].expectedPOK + 0.01 ether);

      hoax(user, dataset[i].value);

      uint256 treasuryBefore = treasury.balance;
      level.levelUp{ value: dataset[i].value }(tokenId, dataset[i].increase);
      assertEq(treasury.balance, treasuryBefore + dataset[i].value);
      assertEq(pookyball.metadata(tokenId).level, dataset[i].level + dataset[i].increase);
    }
  }
}
