// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { BaseTest } from "../BaseTest.sol";
import { POK } from "../../src/tokens/POK.sol";

abstract contract POKSetup is BaseTest {
  POK public pok;

  constructor() {
    vm.startPrank(makeAddr("admin"));
    pok = new POK();
    pok.grantRole(pok.MINTER(), makeAddr("minter"));
    vm.stopPrank();
  }

  function mintPOK(address recipient, uint256 amount) public {
    vm.prank(makeAddr("minter"));
    pok.mint(recipient, amount);
  }
}
