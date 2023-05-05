// SPDX-License-Identifier: MIT
// Pooky Game Contracts (mocks/InvalidReceiver.sol)

pragma solidity ^0.8.9;

/**
 * @title InvalidReceiver
 * This contract always revert when receiving tokens. This allow to test scenario where a native transfer fails.
 */
contract InvalidReceiver {
    receive() external payable {
        revert();
    }
}
