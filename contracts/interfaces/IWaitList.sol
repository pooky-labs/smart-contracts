// SPDX-License-Identifier: MIT
// Pooky Game Contracts (interfaces/IWaitList.sol)
pragma solidity ^0.8.17;

interface IWaitList {
  /**
   * @notice Check if an account is eligible.
   * @param account The account address to lookup.
   * @return If the account is eligible.
   */
  function isEligible(address account) external view returns (bool);
}
