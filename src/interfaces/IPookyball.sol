// SPDX-License-Identifier: MIT
// Pooky Game Contracts (interfaces/IPookyball.sol)
pragma solidity ^0.8.17;

import "openzeppelin/access/IAccessControl.sol";
import "openzeppelin/token/ERC721/IERC721.sol";
import "openzeppelin/interfaces/IERC2981.sol";
import "../types/PookyballMetadata.sol";

/**
 * @title IPookyball
 * @author Mathieu Bour
 * @notice Minimal Pookyball interface.
 */
interface IPookyball is IAccessControl, IERC2981, IERC721 {
  /// Fired when the seed of a Pookyball token is set by the VRFCoordinator
  event SeedSet(uint256 indexed tokenId, uint256 seed);
  /// Fired when the level of a Pookyball token is changed
  event LevelChanged(uint256 indexed tokenId, uint256 level);
  /// Fired when the PXP of a Pookyball token is changed
  event PXPChanged(uint256 indexed tokenId, uint256 amount);

  /// Thrown when the length of two parameters mismatch. Used in the mint batched function.
  error ArgumentSizeMismatch(uint256 x, uint256 y);

  /**
   * @notice PookyballMetadata of the token {tokenId}.
   * @dev Requirements:
   * - Pookyball {tokenId} should exist (minted and not burned).
   */
  function metadata(uint256 tokenId) external view returns (PookyballMetadata memory);

  /**
   * @notice Change the secondary sale royalties receiver address.
   */
  function setERC2981Receiver(address newReceiver) external;

  /**
   * @notice Mint a new Pookyball token with a given rarity.
   */
  function mint(address[] memory recipients, PookyballRarity[] memory rarities) external returns (uint256);

  /**
   * @notice Change the level of a Pookyball token.
   * @dev Requirements:
   * - Pookyball {tokenId} should exist (minted and not burned).
   */
  function setLevel(uint256 tokenId, uint256 newLevel) external;

  /**
   * @notice Change the PXP of a Pookyball token.
   * @dev Requirements:
   * - Pookyball {tokenId} should exist (minted and not burned).
   */
  function setPXP(uint256 tokenId, uint256 newPXP) external;
}
