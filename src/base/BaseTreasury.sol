// SPDX-License-Identifier: MIT
// Pooky Game Contracts (utils/Treasury.sol)
pragma solidity ^0.8.20;

import { Ownable } from "solady/auth/Ownable.sol";
import { IBaseTreasury } from "../interfaces/IBaseTreasury.sol";

/**
 * @title BaseTreasury
 * @author Mathieu Bour
 * @notice Base class for contracts that are made to receive native currency.
 * The destination address is controller by the contract owner.
 */
abstract contract BaseTreasury is Ownable, IBaseTreasury {
  /// The native currency destination address.
  address public treasury;

  constructor(address _treasury) {
    treasury = _treasury;
  }

  /**
   * @notice Forward the funds to the treasury wallet at the end of the transaction.
   * Since `treasury` is a trusted address, this modifier should not lead to any re-entrancy issue.
   */
  modifier forwarder() {
    _;

    uint256 value = address(this).balance;
    (bool sent,) = treasury.call{ value: value }("");
    if (!sent) {
      revert TransferFailed(treasury, value);
    }
  }

  /**
   * Change the native currency destination address.
   * @param _treasury The new treasury address.
   */
  function changeTreasury(address _treasury) external onlyOwner {
    treasury = _treasury;
  }
}
