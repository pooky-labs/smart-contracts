// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title InvalidReceiver
/// @dev This contract always revert when receiving tokens. This allow to test scenario where a native transfer fails.
contract InvalidReceiver {
  receive() external payable {
    revert();
  }
}
