// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Test } from "forge-std/Test.sol";
import { Level } from "../../src/game/Level.sol";
import { POK } from "../../src/tokens/POK.sol";
import { Pookyball } from "../../src/tokens/Pookyball.sol";
import { POKSetup } from "../setup/POKSetup.sol";
import { PookyballSetup } from "../setup/PookyballSetup.sol";

contract LevelTest is Test, POKSetup, PookyballSetup {
  address user = makeAddr("user");

  Level level;

  function setUp() public override(POKSetup, PookyballSetup) {
    level = new Level(pok, pookyball);
  }
}
