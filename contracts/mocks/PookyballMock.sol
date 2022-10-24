// SPDX-License-Identifier: MIT
// Pooky Game Contracts (mocks/PookyballMock.sol)

pragma solidity ^0.8.9;

import "../Pookyball.sol";
import { BallInfo } from "../types/DataTypes.sol";

/**
 * @notice PookyballMock is used for testing: everybody is allowed mint new Pookyballs  tokens.
 */
contract PookyballMock is Pookyball {
  function mock_mintBall(address to, BallInfo memory ballInfo) external returns (uint256) {
    return _mintBall(to, ballInfo);
  }

  function mock_setBallInfo(uint256 tokenId, BallInfo memory ballInfo) external {
    _requireMinted(tokenId);
    balls[tokenId] = ballInfo;
  }
}
