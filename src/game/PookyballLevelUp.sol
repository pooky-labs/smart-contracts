// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { BaseLevelUp } from "@/base/BaseLevelUp.sol";
import { IPOK } from "@/interfaces/IPOK.sol";
import { IPookyball, PookyballMetadata, PookyballRarity } from "@/interfaces/IPookyball.sol";

/// @title PookyballLevelUp
/// @author Mathieu Bour for Pooky Labs Ltd.
///
/// @notice Allow to level up Pooky Pookyball tokens.
contract PookyballLevelUp is BaseLevelUp {
  /// The Pookyball contract.
  IPookyball pookyball;

  /// @param _pookyball The Pookyball ERC-721 contract.
  /// @param _pok The POK ERC-20 contract.
  /// @param admin The new admin address.
  /// @param _signer The inital signer address.
  /// @param _treasury The initial treasury address.
  constructor(IPookyball _pookyball, IPOK _pok, address admin, address _signer, address _treasury)
    BaseLevelUp(_pok, admin, _signer, _treasury, 60e18, 120)
  {
    pookyball = _pookyball;
  }

  /// @notice Get the levelling parameters for a given token.
  /// @param tokenId The token id.
  /// @return currentLevel The current token level.
  /// @return maxLevel The maximum allowed level.
  function getParams(uint256 tokenId)
    public
    view
    override
    returns (uint256 currentLevel, uint256 maxLevel)
  {
    PookyballMetadata memory metadata = pookyball.metadata(tokenId);
    currentLevel = metadata.level;

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
  }

  function _apply(uint256 tokenId, uint256 newLevel, uint256) internal virtual override {
    pookyball.setLevel(tokenId, newLevel);
  }
}
