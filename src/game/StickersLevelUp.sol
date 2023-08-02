// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { BaseLevelUp } from "@/base/BaseLevelUp.sol";
import { IPOK } from "@/interfaces/IPOK.sol";
import { IStickers, StickerMetadata, StickerRarity } from "@/interfaces/IStickers.sol";

/// @title StickersLevelUp
/// @author Mathieu Bour for Pooky Labs Ltd.
///
/// @notice Allow to level up Pooky Stickers tokens.
contract StickersLevelUp is BaseLevelUp {
  /// The Stickers contract.
  IStickers stickers;

  constructor(IStickers _stickers, IPOK _pok, address admin, address _signer, address _treasury)
    BaseLevelUp(_pok, admin, _signer, _treasury, 20e18, 120)
  {
    stickers = _stickers;
  }

  /// @notice Get the levelling parameters for a given token.
  /// @param tokenId The token id.
  /// @return currentLevel The current token level.
  /// @return maxLevel The maximum allowed level.
  function getParams(uint256 tokenId) public view override returns (uint256, uint256 maxLevel) {
    StickerMetadata memory metadata = stickers.metadata(tokenId);

    if (metadata.rarity == StickerRarity.COMMON) {
      maxLevel = 40;
    } else if (metadata.rarity == StickerRarity.RARE) {
      maxLevel = 60;
    } else if (metadata.rarity == StickerRarity.EPIC) {
      maxLevel = 80;
    } else if (metadata.rarity == StickerRarity.LEGENDARY) {
      maxLevel = 100;
    } else if (metadata.rarity == StickerRarity.MYTHIC) {
      maxLevel = 120;
    }

    return (uint256(metadata.level), maxLevel);
  }

  function _apply(uint256 tokenId, uint256 newLevel, uint256) internal virtual override {
    stickers.setLevel(tokenId, uint248(newLevel)); // Safe cast, restricted by maxLevel above
  }
}
