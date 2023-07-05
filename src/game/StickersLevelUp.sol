// SPDX-License-Identifier: MIT
// Pooky Game Contracts (game/StickersLevelUp.sol)
pragma solidity ^0.8.20;

import { IStickers, StickerMetadata, StickerRarity } from "../interfaces/IStickers.sol";
import { IPOK } from "../interfaces/IPOK.sol";
import { BaseLevelUp } from "./BaseLevelUp.sol";

/**
 * @title StickersLevelUp
 * @author Mathieu Bour
 * @notice Allow to level up Pooky Stickers tokens.
 */
contract StickersLevelUp is BaseLevelUp {
  /// The Stickers contract.
  IStickers stickers;

  constructor(IStickers _stickers, IPOK _pok, address admin, address _treasury)
    BaseLevelUp(_pok, admin, _treasury, 20e18, 120)
  {
    stickers = _stickers;
  }

  function _getLevel(uint256 tokenId) internal virtual override returns (uint256, uint256 maxLevel) {
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
