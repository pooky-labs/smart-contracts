// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import { IAccessControl } from "openzeppelin/access/IAccessControl.sol";
import { IERC721 } from "openzeppelin/token/ERC721/IERC721.sol";
import { IERC2981 } from "openzeppelin/interfaces/IERC2981.sol";

/// @title PookyballMetadata
/// @notice The Pookyball rarities are represented on chain by this enum.
enum PookyballRarity {
  COMMON,
  RARE,
  EPIC,
  LEGENDARY,
  MYTHIC
}

/// @title PookyballMetadata
/// @notice Pookyballs NFT have the following features:
/// - rarity: integer enum.
/// - level: token level, can be increase by spending token experiences points (PXP).
/// - pxp: token experience points.
/// - seed: a random uint256 word provided by Chainlink VRF service that will be used by Pooky's NFT generator
///     back-end to generate the NFT visuals and in-game statistics\.
struct PookyballMetadata {
  PookyballRarity rarity;
  uint256 level;
  uint256 pxp;
  uint256 seed;
}

/// @title IPookyball
/// @author Mathieu Bour for Pooky Labs Ltd.
/// @notice Minimal Pookyball interface.
interface IPookyball is IAccessControl, IERC2981, IERC721 {
  /// Fired when the seed of a Pookyball token is set by the VRFCoordinator
  event SeedSet(uint256 indexed tokenId, uint256 seed);
  /// Fired when the level of a Pookyball token is changed
  event LevelChanged(uint256 indexed tokenId, uint256 level);
  /// Fired when the PXP of a Pookyball token is changed
  event PXPChanged(uint256 indexed tokenId, uint256 amount);

  /// Thrown when the length of two parameters mismatch. Used in the mint batched function.
  error ArgumentSizeMismatch(uint256 x, uint256 y);

  /// @notice PookyballMetadata of the token {tokenId}.
  /// @dev Requirements:
  /// - Pookyball {tokenId} should exist (minted and not burned).
  function metadata(uint256 tokenId) external view returns (PookyballMetadata memory);

  /// @notice Change the secondary sale royalties receiver address.
  function setERC2981Receiver(address newReceiver) external;

  /// @notice Mint a new Pookyball token with a given rarity.
  function mint(address[] memory recipients, PookyballRarity[] memory rarities)
    external
    returns (uint256);

  /// @notice Change the level of a Pookyball token.
  /// @dev Requirements:
  /// - Pookyball {tokenId} should exist (minted and not burned).
  function setLevel(uint256 tokenId, uint256 newLevel) external;

  /// @notice Change the PXP of a Pookyball token.
  /// @dev Requirements:
  /// - Pookyball {tokenId} should exist (minted and not burned).
  function setPXP(uint256 tokenId, uint256 newPXP) external;
}
