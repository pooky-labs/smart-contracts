// SPDX-License-Identifier: MIT
// Pooky Game Contracts (interfaces/IVRFConsumerBaseV2.sol)

pragma solidity ^0.8.0;

/**
 * @title IVRFConsumerBaseV2
 * @author Pooky Engineering Team
 * @dev Interface exposing the `rawFulfillRandomWords` function
 * as described in Chainlink's `VRFConsumerBaseV2` contract.
 */
interface IVRFConsumerBaseV2 {
  function rawFulfillRandomWords(uint256 requestId, uint256[] memory randomWords) external;
}
