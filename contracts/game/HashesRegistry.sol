// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "../interfaces/IHashesRegistry.sol";

/**
 * @title HashesRegistry
 * @author Mathieu Bour
 * @notice A hash registry is just a mapping shared between multiple contracts.
 * @dev Only OPERATOR role can set the hashes.
 */
contract HashesRegistry is IHashesRegistry, AccessControl {
  /// The internal hashes mapping
  mapping(bytes32 => bool) private hashes;

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
   * @notice Get the value of a given hash.
   */
  function has(bytes32 hash) external view returns (bool) {
    return hashes[hash];
  }

  /**
   * @notice Set the value of a given hash.
   */
  function set(bytes32 hash, bool value) public onlyRole(OPERATOR) {
    hashes[hash] = value;
  }

  /**
   * @notice Set the value of a multiple hashes.
   */
  function setBatch(bytes32[] memory _hashes, bool[] memory values) external onlyRole(OPERATOR) {
    if (_hashes.length != values.length) {
      revert ArgumentSizeMismatch(_hashes.length, values.length);
    }

    for (uint256 i = 0; i < _hashes.length; i++) {
      set(_hashes[i], values[i]);
    }
  }
}
