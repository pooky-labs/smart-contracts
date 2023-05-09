// SPDX-License-Identifier: MIT
// Pooky Game Contracts (types/PookyballRarity.sol)
pragma solidity ^0.8.19;

import { StickerRarity } from "./StickerRarity.sol";

struct StickerMetadata {
  uint256 seed;
  uint128 level;
  StickerRarity rarity;
}
