// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { Ownable } from "solady/auth/Ownable.sol";
import { ITreasury } from "@/common/ITreasury.sol";

/// @title Treasury
/// @author Mathieu Bour for Pooky Labs Ltd.
///
/// @notice Base class for contracts that are made to receive native currency.
/// The destination address is controller by the contract owner.
abstract contract Treasury is Ownable, ITreasury {
  /// The native currency destination address.
  address public treasury;

  constructor(address _treasury) {
    treasury = _treasury;
  }

  /// @notice Forward the funds to the treasury wallet at the end of the transaction.
  /// Since `treasury` is a trusted address, this modifier should not lead to any re-entrancy issue.
  modifier forwarder() {
    _;

    uint256 value = address(this).balance;
    (bool sent,) = treasury.call{ value: value }("");
    if (!sent) {
      revert TransferFailed(treasury, value);
    }
  }

  /// Change the native currency destination address.
  /// @param _treasury The new treasury address.
  function changeTreasury(address _treasury) external onlyOwner {
    treasury = _treasury;
  }
}
