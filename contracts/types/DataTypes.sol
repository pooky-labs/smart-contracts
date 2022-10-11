// SPDX-License-Identifier: UNLICENSED
// Pooky Game Contracts (types/DataTypes.sol)

pragma solidity ^0.8.9;

enum BallRarity {
  Uncommon,
  Rare,
  Epic,
  Legendary,
  Mythic
}

/**
 * @notice BallInfo represents all ball parameters which is stored in the on-chain storage.
 * @param rarity Rarity of the ball.
 * @param randomEntropy Random entropy received from Chainlink VRF.
 *   Backend uses random entropy of the ball to generate images and other ball metadata.
 * @param level Ball level.
 * @param pxp PXP (experience points) of the ball.
 */
struct BallInfo {
  BallRarity rarity;
  uint256 randomEntropy;
  uint256 level;
  uint256 pxp;
  uint256 revocableUntil;
}

/**
 * @notice MintTemplate represents all ball parameters of the minting template.
 * @param enabled If balls can be mint using this template.
 * @param rarity Rarity of the balls which will be minted with this template.
 * @param maxMints Maximum number of mints with this template.
 * @param currentMints Current number of mints with this template.
 * @param price Price for the one ball.
 * @param payingToken Address of the token with which user pays. If the native token is used 0x0 should be set.
 */
struct MintTemplate {
  bool enabled;
  BallRarity rarity;
  uint256 maxMints;
  uint256 currentMints;
  uint256 price;
  address payingToken; // 0x0 for native
}

/**
 * @notice Structure containing info for the request which is sent to Chainlink VRF
 * @param user address of the user to which ball will be sent
 * @param tokenId id of the ball
 */
struct MintRandomRequest {
  address recipient;
  uint256 tokenId;
}

/**
 * @notice Structure containing parameters for the ball updates after matchweek ends.
 * @param tokenId Pooky Ball id.
 * @param addPXP Amount of PXP to add to the Pooky Ball.
 * @param shouldLevelUp If Pooky Ball should be leveled up.
 */
struct BallUpdates {
  uint256 tokenId;
  uint256 addPXP;
  bool shouldLevelUp;
}
