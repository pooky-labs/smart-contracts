// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

enum BallRarity {
  Uncommon,
  Rare,
  Epic,
  Legendary,
  Mythic
}

/**
 * @notice BallInfo represents all ball parameters which is stored in the onchain storage.
 * @param rarity Rarity of the ball
 * @param randomEntropy Random entropy received from Chainlink VRF.
 *   Backend uses random entropy of the ball to generate images and other ball metadata.
 * @param level Ball level
 * @param pxp Pxp points of the ball
 */
struct BallInfo {
  BallRarity rarity;
  uint256 randomEntropy;
  uint256 level;
  uint256 pxp;
  uint256 revokableUntilTimestamp;
}

/**
 * @notice MintTemplate represents all ball parameters of the minting template.
 * @param canMint flag if balls can be mint using this template
 * @param rarity rarity of the balls which will be minted with this template
 * @param maxMints maximum number of mints with this template
 * @param currentMints current number of mints with this template
 * @param price price for the one ball
 * @param payingToken address of the token with which user pays. If the native token is used 0x0 should be set.
 */
struct MintTemplate {
  bool canMint;
  BallRarity rarity;
  uint256 maxMints;
  uint256 currentMints;
  uint256 price;
  address payingToken; // 0x0 for native
}

/**
 * @notice Structre containing info for the request which is sent to Chainlink VRF
 * @param user address of the user to wich ball will be sent
 * @param ballId id of the ball
 */
struct MintRandomRequest {
  address user;
  uint256 ballId;
}

/**
 * @notice Structure containing parameters for the ball updates after matchweek ends.
 * @param ballId id of the ball
 * @param addPxp amount of pxp points to add to the ball
 * @param toLevelUp flag if ball should be leveled up
 */
struct BallUpdates {
  uint256 ballId;
  uint256 addPxp;
  bool toLevelUp;
}

/**
 * @notice Signature struct containing parameters of the ECDSA signature
 */
struct Signature {
  uint8 _v;
  bytes32 _r;
  bytes32 _s;
}
