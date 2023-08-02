// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { IBaseERC721A } from "@/interfaces/IBaseERC721A.sol";

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
  uint248 level;
  StickerRarity rarity;
}

/// @title IStickers
/// @author Mathieu Bour for Pooky Labs Ltd.
interface IStickers is IBaseERC721A {
  /// Fired when the level of a Pookyball token is changed,
  event LevelChanged(uint256 indexed tokenId, uint256 level);

  /// @notice StickerMetadata of the token {tokenId}.
  /// @dev Requirements:
  /// - Sticker {tokenId} should exist (minted and not burned).
  function metadata(uint256 tokenId) external view returns (StickerMetadata memory);

  /// @notice Change the level of a Sticker token.
  /// @dev Requirements:
  /// - Sticker {tokenId} should exist (minted and not burned).
  function setLevel(uint256 tokenId, uint248 newLevel) external;

  /// @notice Mint multiple Stickers at once.
  /// @param recipient The mint recipient.
  /// @param rarities The Sticker rarities.
  function mint(address recipient, StickerRarity[] memory rarities) external;
}
