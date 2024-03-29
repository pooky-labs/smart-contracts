// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { IAccessControl } from "openzeppelin/access/IAccessControl.sol";

/// @title INoncesRegistry
/// @author Mathieu Bour for Pooky Labs Ltd.
///
/// @notice Minimal NoncesRegistry interface.
interface INonceRegistry is IAccessControl {
  /// @notice Get the value of a given nonce.
  function has(bytes32 nonce) external view returns (bool);

  /// @notice Set the value of a given nonce.
  function set(bytes32 nonce, bool value) external;

  /// @notice Set the value of a multiple nonces.
  function setBatch(bytes32[] memory nonces, bool[] memory values) external;
}
