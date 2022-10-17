// SPDX-License-Identifier: UNLICENSED
// Pooky Game Contracts (mocks/InvalidReceiver.sol)

pragma solidity ^0.8.9;

contract InvalidReceiver {
  receive() external payable {
    revert();
  }
}
