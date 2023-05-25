// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { BaseTest } from "../BaseTest.sol";
import { StickersManager } from "../../src/game/StickersManager.sol";
import { PookyballRarity } from "../../src/interfaces/IPookyball.sol";
import { StickersControllerSetup } from "../setup/StickersControllerSetup.t.sol";

struct SlotsTest {
  PookyballRarity rarity;
  uint256 level;
  uint256 total;
  uint256 unlocked;
  uint256 free;
}

contract StickersManagerTest is BaseTest, StickersControllerSetup {
  address public admin = makeAddr("admin");
  address public game = makeAddr("game");
  address public user = makeAddr("user");

  StickersManager public manager;

  function setUp() public {
    manager = new StickersManager(controller);
    vm.startPrank(admin);
    controller.grantRoles(address(manager), controller.LINKER() | controller.REPLACER());
    vm.stopPrank();
  }

  /**
   * Ensure that the unlocked/free slots increase with Pookyball level.
   */
  function test_slots_increaseWithLevel() public {
    address user1 = makeAddr("user1");
    SlotsTest[45] memory dataset = [
      // Common
      SlotsTest(PookyballRarity.COMMON, 0, 4, 0, 0),
      SlotsTest(PookyballRarity.COMMON, 9, 4, 1, 1),
      SlotsTest(PookyballRarity.COMMON, 19, 4, 2, 2),
      SlotsTest(PookyballRarity.COMMON, 29, 4, 3, 3),
      SlotsTest(PookyballRarity.COMMON, 39, 4, 4, 4),
      // Rare
      SlotsTest(PookyballRarity.RARE, 0, 6, 0, 0),
      SlotsTest(PookyballRarity.RARE, 9, 6, 1, 1),
      SlotsTest(PookyballRarity.RARE, 19, 6, 2, 2),
      SlotsTest(PookyballRarity.RARE, 29, 6, 3, 3),
      SlotsTest(PookyballRarity.RARE, 39, 6, 4, 4),
      SlotsTest(PookyballRarity.RARE, 49, 6, 5, 5),
      SlotsTest(PookyballRarity.RARE, 59, 6, 6, 6),
      // Epic
      SlotsTest(PookyballRarity.EPIC, 0, 8, 0, 0),
      SlotsTest(PookyballRarity.EPIC, 9, 8, 1, 1),
      SlotsTest(PookyballRarity.EPIC, 19, 8, 2, 2),
      SlotsTest(PookyballRarity.EPIC, 29, 8, 3, 3),
      SlotsTest(PookyballRarity.EPIC, 39, 8, 4, 4),
      SlotsTest(PookyballRarity.EPIC, 49, 8, 5, 5),
      SlotsTest(PookyballRarity.EPIC, 59, 8, 6, 6),
      SlotsTest(PookyballRarity.EPIC, 69, 8, 7, 7),
      SlotsTest(PookyballRarity.EPIC, 79, 8, 8, 8),
      // Legendary
      SlotsTest(PookyballRarity.LEGENDARY, 0, 10, 0, 0),
      SlotsTest(PookyballRarity.LEGENDARY, 9, 10, 1, 1),
      SlotsTest(PookyballRarity.LEGENDARY, 19, 10, 2, 2),
      SlotsTest(PookyballRarity.LEGENDARY, 29, 10, 3, 3),
      SlotsTest(PookyballRarity.LEGENDARY, 39, 10, 4, 4),
      SlotsTest(PookyballRarity.LEGENDARY, 49, 10, 5, 5),
      SlotsTest(PookyballRarity.LEGENDARY, 59, 10, 6, 6),
      SlotsTest(PookyballRarity.LEGENDARY, 69, 10, 7, 7),
      SlotsTest(PookyballRarity.LEGENDARY, 79, 10, 8, 8),
      SlotsTest(PookyballRarity.LEGENDARY, 89, 10, 9, 9),
      SlotsTest(PookyballRarity.LEGENDARY, 99, 10, 10, 10),
      // Mythic
      SlotsTest(PookyballRarity.MYTHIC, 0, 12, 0, 0),
      SlotsTest(PookyballRarity.MYTHIC, 9, 12, 1, 1),
      SlotsTest(PookyballRarity.MYTHIC, 19, 12, 2, 2),
      SlotsTest(PookyballRarity.MYTHIC, 29, 12, 3, 3),
      SlotsTest(PookyballRarity.MYTHIC, 39, 12, 4, 4),
      SlotsTest(PookyballRarity.MYTHIC, 49, 12, 5, 5),
      SlotsTest(PookyballRarity.MYTHIC, 59, 12, 6, 6),
      SlotsTest(PookyballRarity.MYTHIC, 69, 12, 7, 7),
      SlotsTest(PookyballRarity.MYTHIC, 79, 12, 8, 8),
      SlotsTest(PookyballRarity.MYTHIC, 89, 12, 9, 9),
      SlotsTest(PookyballRarity.MYTHIC, 99, 12, 10, 10),
      SlotsTest(PookyballRarity.MYTHIC, 109, 12, 11, 11),
      SlotsTest(PookyballRarity.MYTHIC, 119, 12, 12, 12)
    ];

    for (uint256 i = 0; i < dataset.length; i++) {
      uint256 pookyballId = mintPookyball(user1, dataset[i].rarity);
      vm.prank(game);
      pookyball.setLevel(pookyballId, dataset[i].level);

      (uint256 total, uint256 unlocked, uint256 free) = manager.slots(pookyballId);
      assertEq(total, dataset[i].total);
      assertEq(unlocked, dataset[i].unlocked);
      assertEq(free, dataset[i].free);
    }
  }

  function testFuzz_slots_increaseUnlockedGteUsed(address user1) public {
    vm.assume(user1 != address(0));

    uint256 pookyballId = mintPookyball(user1);
    uint256 stickerId1 = mintSticker(user1);
    uint256 stickerId2 = mintSticker(user1);

    vm.startPrank(linker);
    controller.attach(stickerId1, pookyballId);
    controller.attach(stickerId2, pookyballId);
    vm.stopPrank();

    // Pookyball is still level zero
    (uint256 total, uint256 unlocked, uint256 free) = manager.slots(pookyballId);
    assertEq(total, 4);
    assertEq(unlocked, 2); // should be 0 at level 0 but this Pookyball has 2 slots taken by stickerId1 and stickersId2
    assertEq(free, 0);
  }

  function testFuzz_attach_revertInsufficientFreeSlot(address user1, uint256 level) public {
    vm.assume(user1 != address(0));
    level = bound(level, 0, 120);
    uint256 pookyballId = mintPookyball(user1);

    vm.prank(game);
    pookyball.setLevel(pookyballId, level);

    (,, uint256 free) = manager.slots(pookyballId);
    for (uint256 i = 0; i < free; i++) {
      uint256 sid = mintSticker(user1);

      vm.prank(user1);
      manager.attach(sid, pookyballId);
    }

    uint256 stickerId = mintSticker(user1);
    vm.expectRevert(
      abi.encodeWithSelector(StickersManager.InsufficientFreeSlot.selector, pookyballId)
    );
    vm.prank(user1);
    manager.attach(stickerId, pookyballId);
  }

  function testFuzz_replace_pass(address user1) public {
    vm.assume(user1 != address(0));

    uint256 pookyballId = mintPookyball(user1);

    vm.prank(game);
    pookyball.setLevel(pookyballId, 10);

    uint256 stickerId1 = mintSticker(user1);
    uint256 stickerId2 = mintSticker(user1);

    vm.startPrank(user1);
    manager.attach(stickerId1, pookyballId);
    manager.replace(stickerId2, stickerId1, pookyballId);
    vm.stopPrank();
  }
}
