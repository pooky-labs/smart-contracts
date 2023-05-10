// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Test } from "forge-std/Test.sol";
import { StickersController } from "../../src/game/StickersController.sol";
import { IStickers } from "../../src/interfaces/IStickers.sol";
import { IERC721A } from "ERC721A/IERC721A.sol";
import { StickersSetup } from "../setup/StickersSetup.sol";
import { PookyballSetup } from "../setup/PookyballSetup.sol";

abstract contract StickersControllerSetup is Test, StickersSetup, PookyballSetup {
  address linker = makeAddr("linker");
  address remover = makeAddr("remover");

  StickersController controller;

  constructor() {
    address admin = makeAddr("admin");
    controller = new StickersController(pookyball, stickers, admin);

    vm.startPrank(admin);
    stickers.grantRoles(address(controller), stickers.OPERATOR());
    controller.grantRoles(address(linker), controller.LINKER());
    controller.grantRoles(address(remover), controller.REMOVER());
    vm.stopPrank();
  }
}
