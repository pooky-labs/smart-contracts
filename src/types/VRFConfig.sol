// SPDX-License-Identifier: MIT
// Pooky Game Contracts (types/VRFConfig.sol)
pragma solidity ^0.8.19;

import { VRFCoordinatorV2Interface } from "chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";

struct VRFConfig {
  VRFCoordinatorV2Interface coordinator;
  bytes32 keyHash;
  uint64 subcriptionId;
  uint16 minimumRequestConfirmations;
  uint32 callbackGasLimit;
}
