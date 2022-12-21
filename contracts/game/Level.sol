// SPDX-License-Identifier: MIT
// Pooky Game Contracts (game/Level.sol)
pragma solidity ^0.8.17;

import "../interfaces/IPookyball.sol";
import "../interfaces/IPOK.sol";
import "../types/PookyballRarity.sol";

/**
 * @title Level
 * @author Mathieu Bour
 * @notice Gameplay contract that allow to level up Pookyball tokens.
 * Reference: https://whitepaper.pooky.gg/pookyball-features/levelling-up
 * @dev Level contract is allowed to write the Pookyball.metadata mapping using the setLevel and setPXP functions.
 */
contract Level {
  // Gameplay constants
  uint256 public constant PXP_DECIMALS = 18;
  uint256 public constant PXP_BASE = 60 * 10 ** PXP_DECIMALS;
  uint256 public constant RATIO_DECIMALS = 3;
  uint256 public constant RATIO_PXP = 1085; // =1.085: each level costs 1.085 more than the previous one.
  uint256 public constant RATIO_POK = 90; // =0.090: 9% of PXP cost is required in $POK tokens to confirm level up.

  // Contracts
  IPookyball public immutable pookyball;
  IPOK public immutable pok;

  /// Each PookyballRarity has a maximum level
  mapping(PookyballRarity => uint256) public maxLevels;

  /// Thrown when an account tries to level up a ball that is not owned the sender.
  error OwnershipRequired(uint256 tokenId, address expected, address actual);
  /// Thrown when an account tries to level a ball above its maximum level.
  error MaximumLevelReached(uint256 tokenId, uint256 maxLevel);
  /// Thrown when an account does own enough $POK token to pay the level up fee
  error InsufficientPOKBalance(uint expected, uint actual);

  constructor(IPOK _pok, IPookyball _pookyball) {
    pok = _pok;
    pookyball = _pookyball;

    // Set the maximum levels as described in the Pooky whitepaper
    // see https://whitepaper.pooky.gg/pookyball-features/levelling-up
    maxLevels[PookyballRarity.COMMON] = 40;
    maxLevels[PookyballRarity.RARE] = 60;
    maxLevels[PookyballRarity.EPIC] = 80;
    maxLevels[PookyballRarity.LEGENDARY] = 100;
    maxLevels[PookyballRarity.MYTHIC] = 100;
  }

  /**
   * Get the PXP required to level up a ball to {level}.
   * @param level The targeted level.
   */
  function levelPXP(uint256 level) public pure returns (uint256) {
    if (level == 0) {
      return 0;
    }

    uint256 acc = PXP_BASE;
    for (uint256 i = 1; i < level; i++) {
      acc = (acc * RATIO_PXP) / 10 ** 3;
    }

    return acc;
  }

  /**
   * Get the $POK tokens required to level up a ball to {level}. This does not take the ball PXP into account.
   * @param level The targeted level.
   */
  function levelPOK(uint256 level) public pure returns (uint256) {
    return (levelPXP(level) * RATIO_POK) / 10 ** RATIO_DECIMALS;
  }

  /**
   * Get the $POK tokens required to level up the ball identified by {tokenId}.
   * This computation the ball PXP into account and add an additional POK fee if ball does not have enough PXP.
   * @param tokenId The targeted token id.
   */
  function levelPOKCost(uint256 tokenId, uint levels) public view returns (uint256) {
    PookyballMetadata memory metadata = pookyball.metadata(tokenId);
    uint256 requiredPXP = 0;
    uint256 requiredPOK = 0;

    for (uint i = 1; i <= levels; i++) {
      requiredPXP += levelPXP(metadata.level + i);
      requiredPOK += levelPOK(metadata.level + i);
    }

    if (requiredPXP <= metadata.pxp) {
      return requiredPOK;
    } else {
      // If the ball has not enough PXP, missing PXP can be covered with $POK tokens at {POK_FACTOR} ratio
      return requiredPOK + ((requiredPXP - metadata.pxp) * RATIO_POK) / 10 ** RATIO_DECIMALS;
    }
  }

  /**
   * @notice Level up a Pookyball in exchange of a certain amount of $POK token.
   * @dev Requirements
   * - msg.sender must be the owner of Pookyball tokenId.
   * - msg.sender must own enough $POK tokens to pay the level up fee.
   * - Pookyball level should be strictly less than the maximum allowed level for its rarity.
   */
  function levelUp(uint256 tokenId, uint levels) external {
    PookyballMetadata memory metadata = pookyball.metadata(tokenId);
    uint256 nextLevel = metadata.level + levels;
    uint256 remainingPXP = 0;
    uint256 requiredPXP = 0;

    for (uint i = 1; i <= levels; i++) {
      requiredPXP += levelPXP(metadata.level + i);
    }

    if (pookyball.ownerOf(tokenId) != msg.sender) {
      revert OwnershipRequired(tokenId, pookyball.ownerOf(tokenId), msg.sender);
    }

    uint256 levelPOKCost_ = levelPOKCost(tokenId, levels);
    if (levelPOKCost_ > pok.balanceOf(msg.sender)) {
      revert InsufficientPOKBalance(levelPOKCost_, pok.balanceOf(msg.sender));
    }

    if (nextLevel > maxLevels[metadata.rarity]) {
      revert MaximumLevelReached(tokenId, maxLevels[metadata.rarity]);
    }

    if (metadata.pxp > requiredPXP) {
      remainingPXP = metadata.pxp - requiredPXP;
    }

    // Burn $POK tokens
    pok.burn(msg.sender, levelPOKCost_);

    // Reset the ball PXP
    pookyball.setPXP(tokenId, remainingPXP);
    // Increment the ball level
    pookyball.setLevel(tokenId, nextLevel);
  }
}
