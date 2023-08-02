// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { BaseTest } from "@test/BaseTest.sol";
import { StickersController } from "@/game/StickersController.sol";
import { IStickers } from "@/interfaces/IStickers.sol";
import { IERC721A } from "ERC721A/IERC721A.sol";
import { StickersSetup } from "@test/setup/StickersSetup.sol";
import { PookyballSetup } from "@test/setup/PookyballSetup.sol";

abstract contract StickersControllerSetup is BaseTest, StickersSetup, PookyballSetup {
  address public linker = makeAddr("linker");
  address public replacer = makeAddr("replacer");
  address public remover = makeAddr("remover");

  StickersController public controller;

  constructor() {
    address admin = makeAddr("admin");
    controller = new StickersController(pookyball, stickers, admin);

    vm.startPrank(admin);
    controller.grantRoles(linker, controller.LINKER());
    controller.grantRoles(replacer, controller.REPLACER());
    controller.grantRoles(remover, controller.REMOVER());
    vm.stopPrank();
  }
}
