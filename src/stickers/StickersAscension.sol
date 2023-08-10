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
contract StickersAscension is OwnableRoles, Signer {
  /// @notice Fired when a token is ascended.
  /// @param tokenId The new ascended token id.
  /// @param rarity The rarity of the new ascended token.
  /// @param parts The Sticker that were used for the ascension.
  event Ascended(uint256 indexed tokenId, StickerRarity indexed rarity, uint256[] parts);

  /// @notice Thrown when the `tokenId` is not eligible for the ascension.
  error Ineligible(uint256 tokenId);

  /// @notice Thrown when the rarity of the Sticker does not support Ascension.
  error UnsupportedRarity(StickerRarity rarity);

  /// @notice Thrown when the rarities of the two source Stickers do not match.
  error RarityMismatch(StickerRarity source, StickerRarity other);

  /// @notice The Stickers ERC-721 smart contract.
  IStickers public immutable stickers;

  /// @param _stickers The Stickers ERC-721 smart contract.
  constructor(IStickers _stickers, address admin, address _signer) Signer(_signer) {
    _initializeOwner(admin);
    stickers = _stickers;
  }

  /// @notice Check if the provided metadata is at the maximum level, based on the rarity.
  /// @param m The StickerMetadata to check.
  function isLevelMax(StickerMetadata memory m) public pure returns (bool) {
    if (m.rarity == StickerRarity.COMMON && m.level >= 40) {
      return true;
    }
    if (m.rarity == StickerRarity.RARE && m.level >= 60) {
      return true;
    }
    if (m.rarity == StickerRarity.EPIC && m.level >= 80) {
      return true;
    }
    if (m.rarity == StickerRarity.LEGENDARY && m.level >= 100) {
      return true;
    }

    return false;
  }

  /// @notice Mint the new ascended Sticker.
  /// @dev Unsupported rarities (legendary and mythical) will revert with `UnsupportedRarity`.
  /// @param rarity The ascended Sticker rarity.
  /// @param recipient The recipient of the Sticker.
  /// @return The ascended Sticker token id.
  function _mint(StickerRarity rarity, address recipient) internal returns (uint256) {
    StickerRarity[] memory rarities = new StickerRarity[](1);

    // Find the ascended rarity
    if (rarity == StickerRarity.COMMON) {
      rarities[0] = StickerRarity.RARE;
    } else if (rarity == StickerRarity.RARE) {
      rarities[0] = StickerRarity.EPIC;
    } else if (rarity == StickerRarity.EPIC) {
      rarities[0] = StickerRarity.LEGENDARY;
    } else {
      revert UnsupportedRarity(rarity);
    }

    stickers.mint(recipient, rarities);
    return stickers.nextTokenId() - 1;
  }

  /// @notice Ascend two maxed identical Stickers of the same rarity.
  /// @dev Since the Stickers attributes are stored off-chain, calling this function requires a proof from the Pooky back-end.
  /// @param source The first Sticker id.
  /// @param other The second Sticker id.
  /// @param proof The proof from the back-end: `abi.encode(source, other, address(this))`.
  /// @return The ascended Sticker id.
  function ascend(uint256 source, uint256 other, bytes calldata proof)
    external
    onlyVerify(abi.encode(source, other, address(this)), proof)
    returns (uint256)
  {
    StickerMetadata memory mSource = stickers.metadata(source);
    if (!isLevelMax(mSource) || stickers.ownerOf(source) != msg.sender) {
      revert Ineligible(source);
    }

    StickerMetadata memory mOther = stickers.metadata(other);
    if (!isLevelMax(mOther) || stickers.ownerOf(other) != msg.sender) {
      revert Ineligible(other);
    }

    if (mSource.rarity != mOther.rarity) {
      revert RarityMismatch(mSource.rarity, mOther.rarity);
    }

    stickers.burn(source);
    stickers.burn(other);
    return _mint(mSource.rarity, msg.sender);
  }

  /// @notice Ascend three maxed Stickers of the same rarity.
  /// @param source The reference Sticker to ascend.
  /// @param parts An array of two other maxed Stickers of the same rarity.
  /// @return The ascended Sticker id.
  function ascend(uint256 source, uint256[2] memory parts) external returns (uint256) {
    StickerMetadata memory mSource = stickers.metadata(source);
    if (!isLevelMax(mSource) || stickers.ownerOf(source) != msg.sender) {
      revert Ineligible(source);
    }

    for (uint256 i; i < parts.length;) {
      StickerMetadata memory m = stickers.metadata(parts[i]);
      if (!isLevelMax(m) || stickers.ownerOf(parts[i]) != msg.sender) {
        revert Ineligible(parts[i]);
      }

      if (mSource.rarity != m.rarity) {
        revert RarityMismatch(mSource.rarity, m.rarity);
      }

      stickers.burn(parts[i]);

      unchecked {
        i++;
      }
    }

    stickers.burn(source);
    return _mint(mSource.rarity, msg.sender);
  }

  /// @notice Ascend one maxed Sticker and five Stickers of the same rarity.
  /// @param source The reference Sticker to ascend.
  /// @param parts An array of five other Stickers of the same rarity.
  /// @return The ascended Sticker id.
  function ascend(uint256 source, uint256[5] memory parts) external returns (uint256) {
    StickerMetadata memory mSource = stickers.metadata(source);
    if (!isLevelMax(mSource) || stickers.ownerOf(source) != msg.sender) {
      revert Ineligible(source);
    }

    for (uint256 i; i < parts.length;) {
      if (stickers.ownerOf(parts[i]) != msg.sender) {
        revert Ineligible(parts[i]);
      }

      StickerMetadata memory m = stickers.metadata(parts[i]);
      if (mSource.rarity != m.rarity) {
        revert RarityMismatch(mSource.rarity, m.rarity);
      }

      stickers.burn(parts[i]);

      unchecked {
        i++;
      }
    }

    stickers.burn(source);
    return _mint(mSource.rarity, msg.sender);
  }
}
