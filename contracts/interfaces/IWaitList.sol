// SPDX-License-Identifier: MIT
// Pooky Game Contracts (interfaces/IWaitList.sol)
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/IAccessControl.sol";

interface IWaitList is IAccessControl {
  /// Thrown when the length of two parameters mismatch. Used in batched functions.
  error ArgumentSizeMismatch(uint256 x, uint256 y);

  function tier(address account) external returns (uint256);

  function setBatch(address[] memory accounts, uint256[] memory tiers) external;
}
