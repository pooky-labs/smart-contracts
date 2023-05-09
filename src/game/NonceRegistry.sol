// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "openzeppelin/access/AccessControl.sol";
import "../interfaces/INonceRegistry.sol";

/**
 * @title NonceRegistry
 * @author Mathieu Bour
 * @notice A nonce registry is just a mapping shared between multiple contracts.
 * @dev Only OPERATOR role can set the nonces.
 */
contract NonceRegistry is INonceRegistry, AccessControl {
  /// The internal nonces mapping
  mapping(bytes32 => bool) private nonces;

  // Roles
  bytes32 public constant OPERATOR = keccak256("OPERATOR");

  /// Thrown when the length of two parameters mismatch. Used in batched functions.
  error ArgumentSizeMismatch(uint256 x, uint256 y);

  constructor(address[] memory admins, address[] memory operators) {
    for (uint256 i = 0; i < admins.length; i++) {
      _grantRole(DEFAULT_ADMIN_ROLE, admins[i]);
    }

    for (uint256 i = 0; i < operators.length; i++) {
      _grantRole(OPERATOR, operators[i]);
    }
  }

  /**
   * @notice Get the value of a given nonce.
   */
  function has(bytes32 nonce) external view returns (bool) {
    return nonces[nonce];
  }

  /**
   * @notice Set the value of a given nonce.
   */
  function set(bytes32 nonce, bool value) public onlyRole(OPERATOR) {
    nonces[nonce] = value;
  }

  /**
   * @notice Set the value of a multiple nonces.
   */
  function setBatch(bytes32[] memory _nonces, bool[] memory values) external onlyRole(OPERATOR) {
    if (_nonces.length != values.length) {
      revert ArgumentSizeMismatch(_nonces.length, values.length);
    }

    for (uint256 i = 0; i < _nonces.length; i++) {
      set(_nonces[i], values[i]);
    }
  }
}
