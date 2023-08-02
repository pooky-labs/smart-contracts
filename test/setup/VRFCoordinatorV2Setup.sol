// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { VRFCoordinatorV2Interface } from "chainlink/interfaces/VRFCoordinatorV2Interface.sol";
import { VRFCoordinatorV2Mock } from "chainlink/mocks/VRFCoordinatorV2Mock.sol";
import { BaseTest } from "@test/BaseTest.sol";

abstract contract VRFCoordinatorV2Setup is BaseTest {
  VRFCoordinatorV2Interface public vrf;

  constructor() {
    vrf = new VRFCoordinatorV2Mock(0, 0);
  }
}
