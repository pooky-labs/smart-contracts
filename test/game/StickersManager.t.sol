// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Test } from "forge-std/Test.sol";
import { StickersManager } from "../../src/game/StickersManager.sol";
import { PookyballRarity } from "../../src/types/PookyballRarity.sol";
import { StickersControllerSetup } from "../setup/StickersControllerSetup.t.sol";

contract StickersManagerTest is Test, StickersControllerSetup {
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

  function test_slots_increaseWithLevels() public {
    uint256 pookyballId = mintPookyball(user, PookyballRarity.LEGENDARY);

    // level 0
    (uint256 total, uint256 unlocked, uint256 free) = manager.slots(pookyballId);
    assertEq(total, 10);
    assertEq(unlocked, 0);
    assertEq(free, 0);

    // level 9
    vm.prank(game);
    pookyball.setLevel(pookyballId, 9);
    (total, unlocked, free) = manager.slots(pookyballId);
    assertEq(total, 10);
    assertEq(unlocked, 1);
    assertEq(free, 1);

    // level 10
    vm.prank(game);
    pookyball.setLevel(pookyballId, 10);
    (total, unlocked, free) = manager.slots(pookyballId);
    assertEq(total, 10);
    assertEq(unlocked, 1);
    assertEq(free, 1);

    // level 19
    vm.prank(game);
    pookyball.setLevel(pookyballId, 19);
    (total, unlocked, free) = manager.slots(pookyballId);
    assertEq(total, 10);
    assertEq(unlocked, 2);
    assertEq(free, 2);
  }

  function test_attach_revertInsufficientFreeSlot(address user1, uint256 level) public {
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

  function test_replace_pass(address user1) public {
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
