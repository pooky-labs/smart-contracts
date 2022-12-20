// SPDX-License-Identifier: MIT
// Pooky Game Contracts (interfaces/IPookyball.sol)
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/IAccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "../types/PookyballMetadata.sol";

/**
 * @title IPookyball
 * Minimal Pookyball interface.
 */
interface IPookyball is IAccessControl, IERC2981, IERC721 {
  /**
   * @notice PookyballMetadata of the token {tokenId}.
   * @dev Requirements:
   * - Pookyball {tokenId} should exist (minted and not burned).
   */
  function metadata(uint256 tokenId) external view returns (PookyballMetadata memory);

  /**
   * @notice Mint a new Pookyball token with a given rarity and luxury.
   */
  function mint(address recipient, PookyballRarity rarity, uint256 luxury) external returns (uint256);

  /**
   * @notice Change the level of a Pookyball token.
   * @dev Requirements:
   * - Pookyball {tokenId} should exist (minted and not burned).
   */
  function setLevel(uint256 tokenId, uint256 newLevel) external;

  /**
   * @notice Change the PXP of a Pookyball token.
   * @dev Requirements:
   * - Pookyball {tokenId} should exist (minted and not burned).
   */
  function setPXP(uint256 tokenId, uint256 newPXP) external;
}
