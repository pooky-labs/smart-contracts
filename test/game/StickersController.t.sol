// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Test } from "forge-std/Test.sol";
import { StickersController } from "../../src/game/StickersController.sol";
import { IStickers } from "../../src/interfaces/IStickers.sol";
import { StickersSetup } from "../setup/StickersSetup.sol";
import { PookyballSetup } from "../setup/PookyballSetup.sol";

contract StickersStorageTest is Test, StickersSetup, PookyballSetup {
  address admin = makeAddr("admin");
  address linker = makeAddr("linker");
  address user = makeAddr("user");

  StickersController controller;

  event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

  function setUp() public {
    controller = new StickersController(pookyball, stickers, admin);

    vm.startPrank(admin);
    stickers.grantRoles(address(controller), stickers.OPERATOR());
    controller.grantRoles(address(linker), controller.LINKER());
    vm.stopPrank();
  }

  function test_attach(uint256 stickerRaritySeed, uint256 pookyballRaritySeed) public {
    uint256 stickerId = mintSticker(user, randomStickerRarity(stickerRaritySeed));
    uint256 pookyballId = mintPookyball(user, randomPookyballRarity(pookyballRaritySeed));

    assertEq(controller.slots(pookyballId), new uint[](0));

    vm.prank(linker);

    vm.expectEmit(true, true, true, true, address(stickers));
    emit Transfer(user, address(controller), stickerId);
    controller.attach(stickerId, pookyballId);

    assertEq(stickers.ownerOf(stickerId), address(controller));
    uint256[] memory slots = new uint[](1);
    slots[0] = stickerId;
    assertEq(controller.slots(pookyballId), slots);
  }
}
