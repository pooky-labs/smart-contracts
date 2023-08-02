// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { VRFCoordinatorV2Interface } from "chainlink/interfaces/VRFCoordinatorV2Interface.sol";

struct VRFConfig {
  VRFCoordinatorV2Interface coordinator;
  bytes32 keyHash;
  uint64 subcriptionId;
  uint16 minimumRequestConfirmations;
  uint32 callbackGasLimit;
}
