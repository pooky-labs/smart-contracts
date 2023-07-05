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
  uint248 level;
  StickerRarity rarity;
}

/**
 * @title IStickers
 * @author Mathieu Bour
 */
interface IStickers is IERC721A, IERC721ABurnable, IERC721AQueryable {
  /// Fired when the seed of a Pookyball token is set by the VRFCoordinator,
  event SeedSet(uint256 indexed tokenId, uint256 seed);
  /// Fired when the level of a Pookyball token is changed,
  event LevelChanged(uint256 indexed tokenId, uint256 level);

  /// Thrown when the token {tokenId} does not exist.
  error NonExistentToken(uint256 tokenId);

  /**
   * @notice StickerMetadata of the token {tokenId}.
   * @dev Requirements:
   * - Sticker {tokenId} should exist (minted and not burned).
   */
  function metadata(uint256 tokenId) external view returns (StickerMetadata memory);

  /**
   * @notice Change the level of a Sticker token.
   * @dev Requirements:
   * - Sticker {tokenId} should exist (minted and not burned).
   */
  function setLevel(uint256 tokenId, uint248 newLevel) external;

  /**
   * @notice Mint multiple Stickers at once.
   * @param requests The recipient and rarities of the Stickers.
   */
  function mint(StickerMint[] memory requests) external returns (uint256);
}
