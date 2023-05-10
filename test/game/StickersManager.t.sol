// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Test } from "forge-std/Test.sol";
import { StickersManager } from "../../src/game/StickersManager.sol";
import { PookyballRarity } from "../../src/types/PookyballRarity.sol";
import { StickersControllerSetup } from "../setup/StickersControllerSetup.t.sol";

contract StickersManagerTest is Test, StickersControllerSetup {
  address admin = makeAddr("admin");
  address game = makeAddr("game");
  address user = makeAddr("user");

  StickersManager manager;

  function setUp() public {
    manager = new StickersManager(controller);
    vm.startPrank(admin);
    controller.grantRoles(address(manager), controller.LINKER());
    vm.stopPrank();
  }

  function test_slots_increaseWithLevels() public {
    uint256 pookyballId = mintPookyball(user, PookyballRarity.LEGENDARY);
    vm.startPrank(game);

    // level 0
    (uint256 total, uint256 unlocked, uint256 free) = manager.slots(pookyballId);
    assertEq(total, 10);
    assertEq(unlocked, 0);
    assertEq(free, 0);

    // level 9
    pookyball.setLevel(pookyballId, 9);
    (total, unlocked, free) = manager.slots(pookyballId);
    assertEq(total, 10);
    assertEq(unlocked, 1);
    assertEq(free, 1);

    // level 10
    pookyball.setLevel(pookyballId, 10);
    (total, unlocked, free) = manager.slots(pookyballId);
    assertEq(total, 10);
    assertEq(unlocked, 1);
    assertEq(free, 1);

    // level 19
    pookyball.setLevel(pookyballId, 19);
    (total, unlocked, free) = manager.slots(pookyballId);
    assertEq(total, 10);
    assertEq(unlocked, 2);
    assertEq(free, 2);
  }
}
