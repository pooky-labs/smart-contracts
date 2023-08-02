// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { OwnableRoles } from "solady/auth/OwnableRoles.sol";
import { Ascension } from "@/common/Ascension.sol";
import { Treasury } from "@/common/Treasury.sol";
import { Signer } from "@/common/Signer.sol";
import { IStickers, StickerMetadata, StickerRarity } from "@/stickers/IStickers.sol";
import { IPOK } from "@/tokens/IPOK.sol";

/// @title StickersAscension
/// @author Mathieu Bour for Pooky Labs Ltd.
///
/// @notice This contract allow Pooky players to upgrade their Stickers by merging two Stickers into a better single Sticker.
contract StickersAscension is OwnableRoles, Ascension {
  /// @notice The Stickers ERC-721 smart contract.
  IStickers public immutable stickers;

  /// @param _stickers The Stickers ERC-721 smart contract.
  constructor(IStickers _stickers) {
    stickers = _stickers;
  }

  /// @notice Check if the `tokenId` is at its maximum level.
  /// @param sender The account that want to ascend the stickers, used for ownership test.
  /// @param tokenId The token id to check.
  /// @return The ascended rarity.
  function ascendable(address sender, uint256 tokenId) public view override returns (uint8) {
    if (stickers.ownerOf(tokenId) != sender) {
      revert Ineligible(tokenId);
    }

    StickerMetadata memory m = stickers.metadata(tokenId);

    if (m.rarity == StickerRarity.COMMON && m.level >= 40) {
      return uint8(StickerRarity.RARE);
    }

    if (m.rarity == StickerRarity.RARE && m.level >= 60) {
      return uint8(StickerRarity.EPIC);
    }

    if (m.rarity == StickerRarity.EPIC && m.level >= 80) {
      return uint8(StickerRarity.LEGENDARY);
    }

    revert Ineligible(tokenId);
  }

  /// @notice Burn the Sticker `tokenId`.
  /// @dev This burn does require the user to approve this contract as operator.
  function _burn(uint256 tokenId) internal override {
    stickers.burn(tokenId);
  }

  /// @notice Mint the new ascended Sticker.
  /// @param rarity The ascended Sticker rarity.
  /// @param recipient The recipient of the Sticker.
  /// @return The ascended Sticker token id.
  function _mint(uint8 rarity, address recipient) internal override returns (uint256) {
    StickerRarity[] memory rarities = new StickerRarity[](1);
    rarities[0] = StickerRarity(rarity);
    stickers.mint(recipient, rarities);
    return stickers.nextTokenId() - 1;
  }

  /// @notice Ascend Stickers `left` and `right` into a new Sticker.
  /// @param left The first Sticker token id.
  /// @param right The second Sticker token id.
  function ascend(uint256 left, uint256 right) external {
    _ascend(left, right);
  }
}
