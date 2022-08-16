// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "../PookyBall.sol";
import {BallInfo} from "../types/DataTypes.sol";

contract MockPookyBall is PookyBall {
    function mock_mintBall(address to, BallInfo memory ballInfo) external returns(uint256) {
        return _mintBall(to, ballInfo);
    }
    function mock_setBallInfo(uint256 ballId, BallInfo memory ballInfo) external {
        balls[ballId] = ballInfo;
    }
}