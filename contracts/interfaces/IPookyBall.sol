// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import '@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol';
import { BallRarity, BallInfo } from '../types/DataTypes.sol';

interface IPookyBall is IERC721Upgradeable {
  function getBallInfo(uint256 tokenId) external view returns (BallInfo memory);

  function mint(
    address to,
    BallRarity rarity,
    uint256 revocableUntil
  ) external returns (uint256);

  function setRandomEntropy(uint256 tokenId, uint256 _randomEntropy) external;

  function addBallPXP(uint256 tokenId, uint256 addPxpAmount) external;

  function changeBallLevel(uint256 tokenId, uint256 newLevel) external;

  function revokeBall(uint256 tokenId) external;
}
