// SPDX-License-Identifier: UNLICENSED
// Pooky Game Contracts (mocks/PookyBallMock.sol)

pragma solidity ^0.8.9;

import "../PookyBall.sol";
import { BallInfo } from "../types/DataTypes.sol";

/**
 * @notice PookyBallMock is used for testing: everybody is allowed mint new Pooky Balls  tokens.
 */
contract PookyBallMock is PookyBall {
    function mock_mintBall(address to, BallInfo memory ballInfo) external returns (uint256) {
        return _mintBall(to, ballInfo);
    }

    function mock_setBallInfo(uint256 tokenId, BallInfo memory ballInfo) external {
        _requireMinted(tokenId);
        balls[tokenId] = ballInfo;
    }
}
