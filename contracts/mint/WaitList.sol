// SPDX-License-Identifier: MIT
// Pooky Game Contracts (WaitList.sol)
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "../interfaces/IWaitList.sol";

/**
 * @title WaitList
 * @author Mathieu Bour
 * @notice Basic wait list implementation. The greater the tier is, the higher the privileges should be.
 * @dev Implemented roles:
 * - `OPERATOR`:
 *   - change the `requiredTier` fto be eligible via the `isEligible` function.
 *   - add account addresses and their associated tiers to the wait list.
 */
contract WaitList is IWaitList, AccessControl {
  // Roles
  bytes32 public constant OPERATOR = keccak256("OPERATOR");

  /// The account addresses tier mapping
  mapping(address => uint256) public tiers;
  /// The minimum required tier to be considered as "eligible".
  uint public requiredTier;

  /**
   * @param initialTier The initial required tier. Should be the all-time high tier.
   */
  constructor(uint256 initialTier) {
    requiredTier = initialTier;
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
  }

  /**
   * Change the minimum required tier to be considered as "eligible".
   * @param newRequiredTier The new required tier.
   */
  function setRequiredTier(uint256 newRequiredTier) external onlyRole(OPERATOR) {
    requiredTier = newRequiredTier;
  }

  /**
   * @notice Set the tier of multiple accounts at the same time.
   * @dev Requirements:
   * - msg.sender is the owner of the contract.
   * - accounts and tiers_ parameters have the same length.
   * @param accounts The account addresses.
   * @param tiers_ The associated tiers.
   */
  function setBatch(address[] memory accounts, uint256[] memory tiers_) external onlyRole(OPERATOR) {
    if (accounts.length != tiers_.length) {
      revert ArgumentSizeMismatch(accounts.length, tiers_.length);
    }

    for (uint256 i = 0; i < accounts.length; i++) {
      tiers[accounts[i]] = tiers_[i];
      emit TierSet(accounts[i], tiers_[i]);
    }
  }

  /**
   * @notice Check if an account is eligible.
   * @param account The account address to lookup.
   * @return If the account is eligible.
   */
  function isEligible(address account) external view returns (bool) {
    return tiers[account] >= requiredTier;
  }
}
