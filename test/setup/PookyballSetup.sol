// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Test } from "forge-std/Test.sol";
import { Pookyball } from "../../src/tokens/Pookyball.sol";
import { VRFCoordinatorV2Setup } from "./VRFCoordinatorV2Setup.sol";

abstract contract PookyballSetup is Test, VRFCoordinatorV2Setup {
  Pookyball pookyball;

  function setUp() public virtual override {
    pookyball = new Pookyball(
      "https://metadata.pooky.gg/pookyballs",
      "https://metadata.pooky.gg/contracts/Pookyball",
      makeAddr("treasury"),
      address(vrf),
      keccak256("foobar"),
      vrf.createSubscription(),
      10,
      2500000
    );
  }
}
