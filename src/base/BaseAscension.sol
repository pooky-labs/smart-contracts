// SPDX-License-Identifier: MIT
// Pooky Game Contracts (base/BaseAscension.sol)
pragma solidity 0.8.20;

import { Ownable } from "solady/auth/Ownable.sol";
import { IPOK } from "@/interfaces/IPOK.sol";

/// @title BaseAscension
/// @author Mathieu Bour for Pooky Labs Ltd.
/// @notice Ascension is the process of combining two tokens of the same rarity to create a new token with a higher rarity.
/// @dev Base contract for ascendable tokens.
abstract contract BaseAscension is Ownable {
  /// @notice Fired when a token is ascended.
  /// @param tokenId The new ascended token id.
  /// @param rarity The rarity of the new ascended token.
  /// @param left The first token id.
  /// @param right The second token id.
  event Ascended(
    uint256 indexed tokenId, uint8 rarity, uint256 indexed left, uint256 indexed right
  );

  /// @notice Thrown when the `tokenId` is not eligible for the ascension.
  error Ineligible(uint256 tokenId);

  /// @notice Thrown when the rarities of the two source tokens do not match.
  error RarityMismatch(uint8 left, uint8 right);

  /// @notice Check if the `tokenId` is ascendable, e.g. has reached the conditions to be ascended (level, etc.).
  /// This function can may also include an ownership test if necessary.
  /// @param sender The account that want to ascend the stickers, used for ownership test.
  /// @param tokenId The token id to check.
  /// @return The ascended rarity.
  function ascendable(address sender, uint256 tokenId) public view virtual returns (uint8);

  /// @notice Burn the `tokenId`.
  /// @dev Depending of the token implementation, on ownership test might be run upfront in the `ascendable` function.
  function _burn(uint256 tokenId) internal virtual;

  /// @notice Mint the ascended token of `rarity` to `recipient.
  function _mint(uint8 rarity, address recipient) internal virtual returns (uint256);

  /// @notice Ascend two tokens to get a new one of a better rarity.
  /// @dev Technically speaking, ascending is equivalent to burning two tokens and minting another one.
  /// @param left The first token id.
  /// @param right The second token id.
  function _ascend(uint256 left, uint256 right) internal {
    uint8 rarity = ascendable(msg.sender, left);
    uint8 rarity2 = ascendable(msg.sender, right);

    if (rarity != rarity2) {
      revert RarityMismatch(rarity, rarity2);
    }

    // Actual ascension: burn the two source tokens and mint a new one.
    _burn(left);
    _burn(right);
    uint256 ascendedId = _mint(rarity, msg.sender);

    emit Ascended(ascendedId, rarity, left, right);
  }
}
