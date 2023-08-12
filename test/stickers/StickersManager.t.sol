// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { PookyballRarity } from "@/pookyball/IPookyball.sol";
import { BaseTest } from "@test/BaseTest.sol";
import { StickersManager } from "@/stickers/StickersManager.sol";
import { StickersControllerSetup } from "@test/setup/StickersControllerSetup.sol";

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

  /// Ensure that the unlocked/free slots increase with Pookyball level.
  function test_slots_increaseWithLevel() public {
    address user1 = makeAddr("user1");
    SlotsTest[85] memory dataset = [
      // Common
      SlotsTest(PookyballRarity.COMMON, 0, 4, 0, 0),
      SlotsTest(PookyballRarity.COMMON, 4, 4, 0, 0),
      SlotsTest(PookyballRarity.COMMON, 5, 4, 1, 1),
      SlotsTest(PookyballRarity.COMMON, 14, 4, 1, 1),
      SlotsTest(PookyballRarity.COMMON, 15, 4, 2, 2),
      SlotsTest(PookyballRarity.COMMON, 24, 4, 2, 2),
      SlotsTest(PookyballRarity.COMMON, 25, 4, 3, 3),
      SlotsTest(PookyballRarity.COMMON, 34, 4, 3, 3),
      SlotsTest(PookyballRarity.COMMON, 35, 4, 4, 4),
      // Rare
      SlotsTest(PookyballRarity.RARE, 0, 6, 0, 0),
      SlotsTest(PookyballRarity.RARE, 4, 6, 0, 0),
      SlotsTest(PookyballRarity.RARE, 5, 6, 1, 1),
      SlotsTest(PookyballRarity.RARE, 14, 6, 1, 1),
      SlotsTest(PookyballRarity.RARE, 15, 6, 2, 2),
      SlotsTest(PookyballRarity.RARE, 24, 6, 2, 2),
      SlotsTest(PookyballRarity.RARE, 25, 6, 3, 3),
      SlotsTest(PookyballRarity.RARE, 34, 6, 3, 3),
      SlotsTest(PookyballRarity.RARE, 35, 6, 4, 4),
      SlotsTest(PookyballRarity.RARE, 44, 6, 4, 4),
      SlotsTest(PookyballRarity.RARE, 45, 6, 5, 5),
      SlotsTest(PookyballRarity.RARE, 54, 6, 5, 5),
      SlotsTest(PookyballRarity.RARE, 55, 6, 6, 6),
      // Epic
      SlotsTest(PookyballRarity.EPIC, 0, 8, 0, 0),
      SlotsTest(PookyballRarity.EPIC, 4, 8, 0, 0),
      SlotsTest(PookyballRarity.EPIC, 5, 8, 1, 1),
      SlotsTest(PookyballRarity.EPIC, 14, 8, 1, 1),
      SlotsTest(PookyballRarity.EPIC, 15, 8, 2, 2),
      SlotsTest(PookyballRarity.EPIC, 24, 8, 2, 2),
      SlotsTest(PookyballRarity.EPIC, 25, 8, 3, 3),
      SlotsTest(PookyballRarity.EPIC, 34, 8, 3, 3),
      SlotsTest(PookyballRarity.EPIC, 35, 8, 4, 4),
      SlotsTest(PookyballRarity.EPIC, 44, 8, 4, 4),
      SlotsTest(PookyballRarity.EPIC, 45, 8, 5, 5),
      SlotsTest(PookyballRarity.EPIC, 54, 8, 5, 5),
      SlotsTest(PookyballRarity.EPIC, 55, 8, 6, 6),
      SlotsTest(PookyballRarity.EPIC, 64, 8, 6, 6),
      SlotsTest(PookyballRarity.EPIC, 65, 8, 7, 7),
      SlotsTest(PookyballRarity.EPIC, 74, 8, 7, 7),
      SlotsTest(PookyballRarity.EPIC, 75, 8, 8, 8),
      // Legendary
      SlotsTest(PookyballRarity.LEGENDARY, 0, 10, 0, 0),
      SlotsTest(PookyballRarity.LEGENDARY, 4, 10, 0, 0),
      SlotsTest(PookyballRarity.LEGENDARY, 5, 10, 1, 1),
      SlotsTest(PookyballRarity.LEGENDARY, 14, 10, 1, 1),
      SlotsTest(PookyballRarity.LEGENDARY, 15, 10, 2, 2),
      SlotsTest(PookyballRarity.LEGENDARY, 24, 10, 2, 2),
      SlotsTest(PookyballRarity.LEGENDARY, 25, 10, 3, 3),
      SlotsTest(PookyballRarity.LEGENDARY, 34, 10, 3, 3),
      SlotsTest(PookyballRarity.LEGENDARY, 35, 10, 4, 4),
      SlotsTest(PookyballRarity.LEGENDARY, 44, 10, 4, 4),
      SlotsTest(PookyballRarity.LEGENDARY, 45, 10, 5, 5),
      SlotsTest(PookyballRarity.LEGENDARY, 54, 10, 5, 5),
      SlotsTest(PookyballRarity.LEGENDARY, 55, 10, 6, 6),
      SlotsTest(PookyballRarity.LEGENDARY, 64, 10, 6, 6),
      SlotsTest(PookyballRarity.LEGENDARY, 65, 10, 7, 7),
      SlotsTest(PookyballRarity.LEGENDARY, 74, 10, 7, 7),
      SlotsTest(PookyballRarity.LEGENDARY, 75, 10, 8, 8),
      SlotsTest(PookyballRarity.LEGENDARY, 84, 10, 8, 8),
      SlotsTest(PookyballRarity.LEGENDARY, 85, 10, 9, 9),
      SlotsTest(PookyballRarity.LEGENDARY, 94, 10, 9, 9),
      SlotsTest(PookyballRarity.LEGENDARY, 95, 10, 10, 10),
      // Mythic
      SlotsTest(PookyballRarity.MYTHIC, 0, 12, 0, 0),
      SlotsTest(PookyballRarity.MYTHIC, 4, 12, 0, 0),
      SlotsTest(PookyballRarity.MYTHIC, 5, 12, 1, 1),
      SlotsTest(PookyballRarity.MYTHIC, 14, 12, 1, 1),
      SlotsTest(PookyballRarity.MYTHIC, 15, 12, 2, 2),
      SlotsTest(PookyballRarity.MYTHIC, 24, 12, 2, 2),
      SlotsTest(PookyballRarity.MYTHIC, 25, 12, 3, 3),
      SlotsTest(PookyballRarity.MYTHIC, 34, 12, 3, 3),
      SlotsTest(PookyballRarity.MYTHIC, 35, 12, 4, 4),
      SlotsTest(PookyballRarity.MYTHIC, 44, 12, 4, 4),
      SlotsTest(PookyballRarity.MYTHIC, 45, 12, 5, 5),
      SlotsTest(PookyballRarity.MYTHIC, 54, 12, 5, 5),
      SlotsTest(PookyballRarity.MYTHIC, 55, 12, 6, 6),
      SlotsTest(PookyballRarity.MYTHIC, 64, 12, 6, 6),
      SlotsTest(PookyballRarity.MYTHIC, 65, 12, 7, 7),
      SlotsTest(PookyballRarity.MYTHIC, 74, 12, 7, 7),
      SlotsTest(PookyballRarity.MYTHIC, 75, 12, 8, 8),
      SlotsTest(PookyballRarity.MYTHIC, 84, 12, 8, 8),
      SlotsTest(PookyballRarity.MYTHIC, 85, 12, 9, 9),
      SlotsTest(PookyballRarity.MYTHIC, 94, 12, 9, 9),
      SlotsTest(PookyballRarity.MYTHIC, 95, 12, 10, 10),
      SlotsTest(PookyballRarity.MYTHIC, 104, 12, 10, 10),
      SlotsTest(PookyballRarity.MYTHIC, 105, 12, 11, 11),
      SlotsTest(PookyballRarity.MYTHIC, 114, 12, 11, 11),
      SlotsTest(PookyballRarity.MYTHIC, 115, 12, 12, 12)
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

    vm.prank(user1);
    stickers.setApprovalForAll(address(controller), true);

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

    vm.prank(user1);
    stickers.setApprovalForAll(address(controller), true);

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

    vm.prank(user1);
    stickers.setApprovalForAll(address(controller), true);

    vm.startPrank(user1);
    manager.attach(stickerId1, pookyballId);
    manager.replace(stickerId2, stickerId1, pookyballId);
    vm.stopPrank();
  }
}
