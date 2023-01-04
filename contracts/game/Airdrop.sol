// SPDX-License-Identifier: MIT
// Pooky Game Contracts (game/Airdrop.sol)
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title Airdrop
 * @author Mathieu Bour
 * @notice Allow the Pooky Game to airdrop some native token to cover the gas fees of our users.
 */
contract Airdrop is AccessControl {
  uint256 public constant AMOUNT = 0.1 ether;

  // Roles
  bytes32 public constant OPERATOR = keccak256("OPERATOR");

  mapping(address => bool) accounts;
  mapping(bytes32 => bool) users;

  /// Thrown when an account has already been airdropped.
  error NotEligible(address recipient, bytes32 user);
  /// Thrown when the reward contract does not own enough native currency.
  error InsufficientBalance(uint256 expected, uint256 actual);
  /// Thrown when the native transfer has failed.
  error TransferFailed(address recipient, uint256 amount);

  constructor(address admin, address[] memory operators) {
    // Set up the roles
    _grantRole(DEFAULT_ADMIN_ROLE, admin);
    for (uint256 i = 0; i < operators.length; i++) {
      _grantRole(OPERATOR, operators[i]);
    }
  }

  /**
   * @notice Receive funds that will be used for airdrop.
   */
  receive() external payable {}

  /**
   * @notice Recover all the funds on the contract.
   */
  function withdraw() external onlyRole(DEFAULT_ADMIN_ROLE) {
    selfdestruct(payable(msg.sender));
  }

  /**
   * @notice Check if this combination of address and user is eligible to the airdrop.
   */
  function isEligible(address recipient, bytes32 user) public view returns (bool) {
    return !accounts[recipient] && !users[user];
  }

  /**
   * @notice Airdrop to the recipient.
   * @dev We do not pass the user id in plain text for privacy.
   * @param recipient The recipient address.
   * @param user The keccak256 hash of the user id.
   */
  function airdrop(address recipient, bytes32 user) external onlyRole(OPERATOR) {
    if (!isEligible(recipient, user)) {
      revert NotEligible(recipient, user);
    }
    accounts[recipient] = users[user] = true;

    if (address(this).balance < AMOUNT) {
      revert InsufficientBalance(AMOUNT, address(this).balance);
    }

    (bool sent, ) = address(recipient).call{ value: AMOUNT }("");
    if (!sent) {
      revert TransferFailed(recipient, AMOUNT);
    }
  }
}
