// SPDX-License-Identifier: MIT
// Pooky Game Contracts (interfaces/IStickers.sol)
pragma solidity ^0.8.20;

import { IERC721A } from "ERC721A/IERC721A.sol";
import { IERC721ABurnable } from "ERC721A/interfaces/IERC721ABurnable.sol";
import { IERC721AQueryable } from "ERC721A/interfaces/IERC721AQueryable.sol";

enum StickerRarity {
  COMMON,
  RARE,
  EPIC,
  LEGENDARY,
  MYTHIC
}

struct StickerMint {
  address recipient;
  StickerRarity rarity;
}

struct StickerMetadata {
  uint256 seed;
  uint128 level;
  StickerRarity rarity;
}

/**
 * @title IStickers
 * @author Mathieu Bour
 * @notice
 */
interface IStickers is IERC721A, IERC721ABurnable, IERC721AQueryable {
  /// Fired when the seed of a Pookyball token is set by the VRFCoordinator,
  event SeedSet(uint256 indexed tokenId, uint256 seed);
  /// Fired when the level of a Pookyball token is changed,
  event LevelChanged(uint256 indexed tokenId, uint256 level);
  /// Fired when the PXP of a Pookyball token is changed,
  event PXPChanged(uint256 indexed tokenId, uint256 amount);

  /// Thrown when the token {tokenId} does not exist.
  error NonExistentToken(uint256 tokenId);

  /**
   * @notice PookyballMetadata of the token {tokenId}.
   * @dev Requirements:
   * - Pookyball {tokenId} should exist (minted and not burned).
   */
  function metadata(uint256 tokenId) external view returns (StickerMetadata memory);

  function mint(StickerMint[] memory requests) external returns (uint256);
}
