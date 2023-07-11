// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IBaseTreasury {
  /**
   * Change the native currency destination address.
   * @param _treasury The new treasury address.
   */
  function changeTreasury(address _treasury) external;
}
