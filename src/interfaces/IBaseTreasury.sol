// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title IBaseTreasury
/// @author Mathieu Bour for Pooky Labs Ltd.
interface IBaseTreasury {
  /// Thrown when the msg.value of the mint function does not cover the mint cost.
  error InsufficientValue(uint256 expected, uint256 actual);
  /// Thrown when the native transfer has failed.
  error TransferFailed(address recipient, uint256 amount);

  /// Change the native currency destination address.
  /// @param _treasury The new treasury address.
  function changeTreasury(address _treasury) external;
}
