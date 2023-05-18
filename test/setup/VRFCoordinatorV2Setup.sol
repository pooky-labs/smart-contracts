// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Test } from "forge-std/Test.sol";
import { VRFCoordinatorV2Interface } from
  "chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import { VRFCoordinatorV2Mock } from "chainlink/contracts/src/v0.8/mocks/VRFCoordinatorV2Mock.sol";

abstract contract VRFCoordinatorV2Setup is Test {
  VRFCoordinatorV2Interface public vrf;

  constructor() {
    vrf = new VRFCoordinatorV2Mock(0, 0);
  }
}
