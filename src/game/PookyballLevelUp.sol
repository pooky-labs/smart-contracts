// SPDX-License-Identifier: MIT
// Pooky Game Contracts (game/PookyballLevelUp.sol)
pragma solidity ^0.8.20;

import { BaseLevelUp } from "../base/BaseLevelUp.sol";
import { IPOK } from "../interfaces/IPOK.sol";
import { IPookyball, PookyballMetadata, PookyballRarity } from "../interfaces/IPookyball.sol";

/**
 * @title PookyballLevelUp
 * @author Mathieu Bour
 * @notice Allow to level up Pooky Pookyball tokens.
 */
contract PookyballLevelUp is BaseLevelUp {
  /// The Pookyball contract.
  IPookyball pookyball;

  constructor(IPookyball _pookyball, IPOK _pok, address admin, address _signer, address _treasury)
    BaseLevelUp(_pok, admin, _signer, _treasury, 60e18, 120)
  {
    pookyball = _pookyball;
  }

  function getParams(uint256 tokenId) public view override returns (uint256, uint256 maxLevel) {
    PookyballMetadata memory metadata = pookyball.metadata(tokenId);

    if (metadata.rarity == PookyballRarity.COMMON) {
      maxLevel = 40;
    } else if (metadata.rarity == PookyballRarity.RARE) {
      maxLevel = 60;
    } else if (metadata.rarity == PookyballRarity.EPIC) {
      maxLevel = 80;
    } else if (metadata.rarity == PookyballRarity.LEGENDARY) {
      maxLevel = 100;
    } else if (metadata.rarity == PookyballRarity.MYTHIC) {
      maxLevel = 120;
    }

    return (metadata.level, maxLevel);
  }

  function _apply(uint256 tokenId, uint256 newLevel, uint256) internal virtual override {
    pookyball.setLevel(tokenId, newLevel);
  }
}
