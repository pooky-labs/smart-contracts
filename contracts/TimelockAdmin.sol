// SPDX-License-Identifier: MIT
// Pooky Game Contracts (TimelockAdmin.sol)

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/governance/TimelockController.sol";

/**
 * @title TimelockAdmin
 * @author Pooky Engineering Team
 *
 * @notice This contract will be used as ProxyAdmin on proxy contracts 
 * and as DEFAULT_ADMIN_ROLE in implementation contracts.
 * It's standard OpenZepellin implementation of Timelock contract in which 
 * each action needs to be proposed and waited for `minDelay` time until exectued.
 *
 * `proposers` will be set to Pooky Tech Team multisig wallet and Pooky Executives Team multisig.
 * `executors` will be only Pooky Executives Team multisig.
 */
contract TimelockAdmin is TimelockController {

  constructor(
        uint256 minDelay,
        address[] memory proposers,
        address[] memory executors
  ) TimelockController(minDelay, proposers, executors) {

  }
}