// SPDX-License-Identifier: MIT
// Pooky Game Contracts (interfaces/IWaitList.sol)
pragma solidity ^0.8.17;

import "openzeppelin/access/IAccessControl.sol";

/**
 * @title IWaitList
 * @author Mathieu Bour
 * @notice Minimal tiered waitlist implementation.
 */
interface IWaitList is IAccessControl {
    /// Emitted when the tier of an address is set.
    event TierSet(address indexed account, uint256 tier);

    /// Thrown when the length of two parameters mismatch. Used in batched functions.
    error ArgumentSizeMismatch(uint256 x, uint256 y);

    /**
     * Change the minimum required tier to be considered as "eligible".
     * @param newRequiredTier The new required tier.
     */
    function setRequiredTier(uint256 newRequiredTier) external;

    /**
     * @notice Set the tier of multiple accounts at the same time.
     * @param accounts The account addresses.
     * @param tiers The associated tiers.
     */
    function setBatch(address[] memory accounts, uint256[] memory tiers) external;

    /**
     * @notice Check if an account is eligible.
     * @param account The account address to lookup.
     * @return If the account is eligible.
     */
    function isEligible(address account) external view returns (bool);
}
