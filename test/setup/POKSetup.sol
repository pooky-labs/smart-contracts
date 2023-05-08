// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Test } from "forge-std/Test.sol";
import { POK } from "../../src/tokens/POK.sol";

abstract contract POKSetup is Test {
  POK pok;

  function setUp() public virtual {
    pok = new POK();
  }
}
