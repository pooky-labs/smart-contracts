// SPDX-License-Identifier: MIT
// Pooky Game Contracts (TimelockAdmin.sol)

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/governance/TimelockController.sol";

/**
 * @title TimelockAdmin
 * @author Pooky Engineering Team
 *
 */
contract TimelockAdmin is TimelockController {

  constructor(
        uint256 minDelay,
        address[] memory proposers,
        address[] memory executors
  ) TimelockController(minDelay, proposers, executors) {

  }
}