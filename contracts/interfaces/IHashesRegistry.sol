// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/IAccessControl.sol";

/**
 * @title IHashesRegistry
 * @author Mathieu Bour
 * @notice Minimal HashesRegistry interface.
 */
interface IHashesRegistry is IAccessControl {
  /**
   * @notice Get the value of a given hash.
   */
  function has(bytes32 hash) external view returns (bool);

  /**
   * @notice Set the value of a given hash.
   */
  function set(bytes32 hash, bool value) external;

  /**
   * @notice Set the value of a multiple hashes.
   */
  function setBatch(bytes32[] memory hashes, bool[] memory values) external;
}
