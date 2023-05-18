// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Test } from "forge-std/Test.sol";
import { POK } from "../../src/tokens/POK.sol";

abstract contract POKSetup is Test {
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
