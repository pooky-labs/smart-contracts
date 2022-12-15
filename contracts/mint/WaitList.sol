// SPDX-License-Identifier: MIT
// Pooky Game Contracts (WaitList.sol)
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "../interfaces/IWaitList.sol";

contract WaitList is IWaitList, AccessControl {
  bytes32 public constant OPERATOR = keccak256("OPERATOR");

  mapping(address => uint256) tiers;

  event TierSet(address indexed account, uint256 tier);

  function tier(address account) external view returns (uint256) {
    return tiers[account];
  }

  function setBatch(address[] memory accounts, uint256[] memory tiers_) external onlyRole(OPERATOR) {
    if (accounts.length != tiers_.length) {
      revert ArgumentSizeMismatch(accounts.length, tiers_.length);
    }

    for (uint256 i = 0; i < accounts.length; i++) {
      tiers[accounts[i]] = tiers_[i];
      emit TierSet(accounts[i], tiers_[i]);
    }
  }
}
