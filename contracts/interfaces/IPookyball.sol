// SPDX-License-Identifier: MIT
// Pooky Game Contracts (interfaces/IPookyball.sol)
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "../types/PookyballMetadata.sol";

/**
 * @title IPookyball
 * Minimal Pookyball interface.
 */
interface IPookyball is IERC721 {
  function metadata(uint256 tokenId) external view returns (PookyballMetadata memory);

  function mint(address recipient, PookyballRarity rarity, uint256 luxury) external returns (uint256);

  function setLevel(uint256 tokenId, uint256 newLevel) external;

  function setPXP(uint256 tokenId, uint256 newPXP) external;
}
