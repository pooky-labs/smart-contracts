// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import { Ownable } from "solady/auth/Ownable.sol";
import { IPOK } from "@/interfaces/IPOK.sol";

/**
 * @title BaseAscension
 * @author Mathieu Bour for Pooky Labs Ltd.
 * @dev Base contract for ascendable tokens.
 */
abstract contract BaseAscension is Ownable {
  event Ascended(uint256 indexed tokenId, uint8 rarity, uint256 left, uint256 right);

  error Ineligible(uint256 tokenId);
  error RarityMismatch(uint8 left, uint8 right);

  /// Thrown when an account does own enough $POK token to pay the level up fee
  error InsufficientPOK(uint256 expected, uint256 actual);

  /**
   * @notice Check if the `tokenId` is ascendable, e.g. has reached the conditions to be ascended (level, etc.).
   * This function can may also include an ownership test if necessary.
   * @param sender The account that want to ascend the stickers, used for ownership test.
   * @param tokenId The token id to check.
   * @return The ascended rarity.
   */
  function ascendable(address sender, uint256 tokenId) public view virtual returns (uint8);

  /**
   * @notice Burn the `tokenId`.
   * @dev Dependending of the token implementation, on ownership test might be run upfronmt in the `ascendable` function.
   */
  function _burn(uint256 tokenId) internal virtual;

  /**
   * @notice Mint the ascended token of `rarity` to `recipient.
   */
  function _mint(uint8 rarity, address recipient) internal virtual returns (uint256);

  /**
   * @notice Ascend two tokens to get a new one of a better rarity.
   * @dev Technically speaking, ascending is equivalent to burning two tokens and minting another one.
   * @param left The first token id.
   * @param right The second token id.
   */
  function _ascend(uint256 left, uint256 right) internal {
    uint8 rarity = ascendable(msg.sender, left);
    uint8 rarity2 = ascendable(msg.sender, right);

    if (rarity != rarity2) {
      revert RarityMismatch(rarity, rarity2);
    }

    // Actgual ascension: burn the two source tokens and mint a new one.
    _burn(left);
    _burn(right);
    uint256 ascendedId = _mint(rarity, msg.sender);

    emit Ascended(ascendedId, rarity, left, right);
  }
}
