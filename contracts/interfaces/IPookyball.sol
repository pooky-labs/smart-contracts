// SPDX-License-Identifier: MIT
// Pooky Game Contracts (interfaces/IPookyball.sol)

pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";
import { BallRarity, BallLuxury, BallInfo } from "../DataTypes.sol";

/**
 * @title IPookyball
 * Minimal Pookyball interface.
 */
interface IPookyball is IERC721Upgradeable {
  function getBallInfo(uint256 tokenId) external view returns (BallInfo memory);

  function mint(
    address to,
    BallRarity rarity,
    BallLuxury luxury
  ) external returns (uint256);

  function setRandomEntropy(uint256 tokenId, uint256 _randomEntropy) external;

  function changePXP(uint256 tokenId, uint256 newPXP) external;

  function changeLevel(uint256 tokenId, uint256 newLevel) external;
}
