// SPDX-License-Identifier: MIT
// Pooky Game Contracts (interfaces/IWaitList.sol)
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/IAccessControl.sol";

/**
 * @title IWaitList
 * @notice Minimal waitlist implementation.
 */
interface IWaitList is IAccessControl {
  /// Emitted when the tier of an address is set.
  event TierSet(address indexed account, uint256 tier);

  /// Thrown when the length of two parameters mismatch. Used in batched functions.
  error ArgumentSizeMismatch(uint256 x, uint256 y);

  /**
   * @notice Check if an account is eligible.
   * @param account The account address to lookup.
   * @return If the account is eligible.
   */
  function isEligible(address account) external view returns (bool);
}
