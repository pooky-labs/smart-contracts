// SPDX-License-Identifier: MIT
// Pooky Game Contracts (mocks/InvalidReceiver.sol)

pragma solidity ^0.8.9;

/**
 * This contract always revert when receiving tokens. This allow to tests scenarii
 */
contract InvalidReceiver {
  receive() external payable {
    revert();
  }
}
