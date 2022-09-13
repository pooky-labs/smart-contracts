// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import {BallRarity, BallInfo} from "../types/DataTypes.sol";

interface IPookyBall {
    function mintWithRarity(address to, BallRarity rarity) external returns(uint256);
    function mintWithRarityAndRevokableTimestamp(
        address to, 
        BallRarity rarity,
        uint256 revokableUntil
    ) external returns(uint256);
    function setRandomEntropy(uint256 ballId, uint256 _randomEntropy) external;
    function getBallInfo(uint256 ballId) external returns(BallInfo memory);
    function getBallPxp(uint256 ballId) external returns(uint256);
    function addBallPxp(uint256 ballId, uint256 addPxpAmount) external;
    function getBallLevel(uint256 ballId) external returns(uint256);
    function changeBallLevel(uint256 ballId, uint256 newLevel) external;
    function revokeBall(uint256 ballId) external;
}