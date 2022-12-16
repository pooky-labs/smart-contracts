// SPDX-License-Identifier: MIT
// Pooky Game Contracts (types/PookyballMetadata.sol)
pragma solidity ^0.8.17;

import "./PookyballRarity.sol";

/**
 * @title PookyballMetadata
 * @notice Pookyballs NFT have the following features:
 * - rarity: integer enum.
 * - luxury: integer enum, mapping will be published and maintained by Pooky offchain.
 * - level: token level, can be increase by spending token experiences points (PXP).
 * - pxp: token experience points.
 * - seed: a random uint256 word provided by Chainlink VRF service that will be used by Pooky's NFT generator
 *     back-end to generate the NFT visuals and in-game statistics\.
 */
struct PookyballMetadata {
  PookyballRarity rarity;
  uint256 luxury;
  uint256 level;
  uint256 pxp;
  uint256 seed;
}
