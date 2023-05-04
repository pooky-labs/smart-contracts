// SPDX-License-Identifier: MIT
// Pooky Game Contracts (POK.sol)
pragma solidity =0.8.18;

import { IERC721A } from "erc721a/contracts/IERC721A.sol";
import { StickerMetadata } from "../types/StickerMetadata.sol";
import { StickerRarity } from "../types/StickerRarity.sol";

/**
 * @title IStickers
 * @author Mathieu Bour
 * @notice
 */
interface IStickers is IERC721A {
  /// Fired when the seed of a Pookyball token is set by the VRFCoordinator,
  event SeedSet(uint256 indexed tokenId, uint256 seed);
  /// Fired when the level of a Pookyball token is changed,
  event LevelChanged(uint256 indexed tokenId, uint256 level);
  /// Fired when the PXP of a Pookyball token is changed,
  event PXPChanged(uint256 indexed tokenId, uint256 amount);

  /// Thrown when the token {tokenId} does not exist.
  error NonExistentToken(uint256 tokenId);
  /// Thrown when the length of two parameters mismatch. Used in the mint batched function.
  error ArgumentSizeMismatch(uint256 x, uint256 y);

  /**
   * @notice PookyballMetadata of the token {tokenId}.
   * @dev Requirements:
   * - Pookyball {tokenId} should exist (minted and not burned).
   */
  function metadata(uint256 tokenId) external view returns (StickerMetadata memory);

  function mint(address[] memory recipients, StickerRarity[] memory rarities) external returns (uint256);
}
