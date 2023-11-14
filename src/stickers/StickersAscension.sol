// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { OwnableRoles } from "solady/auth/OwnableRoles.sol";
import { Treasury } from "@/common/Treasury.sol";
import { Signer } from "@/common/Signer.sol";
import { IPookyball } from "@/pookyball/IPookyball.sol";
import { IStickers, StickerMetadata, StickerRarity } from "@/stickers/IStickers.sol";
import { IStickersController } from "@/stickers/IStickersController.sol";
import { IPOK } from "@/tokens/IPOK.sol";

/// @title StickersAscension
/// @author Mathieu Bour for Pooky Labs Ltd.
///
/// @notice This contract allow Pooky players to upgrade their Stickers by merging Stickers into a better single Sticker.
contract StickersAscension is OwnableRoles, Signer {
  /// @notice Fired when a Sticker is ascended.
  /// @param tokenId The new ascended Sticker id.
  /// @param rarity The rarity of the new ascended Sticker.
  /// @param parts The Sticker that were used for the ascension.
  /// @param data Abitrary data.
  event Ascended(uint256 indexed tokenId, StickerRarity rarity, uint256[] parts, string data);

  /// @notice Thrown when the `tokenId` is not eligible for the ascension.
  error Ineligible(uint256 tokenId);

  /// @notice Thrown when the rarity of the Sticker does not support Ascension.
  error UnsupportedRarity(StickerRarity rarity);

  /// @notice Thrown when the rarities of the two source Stickers do not match.
  error RarityMismatch(StickerRarity source, StickerRarity other);

  /// @notice The StickersController smart contract, used to detach stickers if necessary.
  IStickersController public immutable controller;

  /// @notice The Stickers ERC-721 smart contract.
  IStickers public immutable stickers;

  /// @notice The Pookyball ERC-721 smart contract.
  IPookyball public immutable pookyball;

  /// @param _controller  The StickersController smart contract, used to detach stickers if necessary.
  constructor(IStickersController _controller, address admin, address _signer) Signer(_signer) {
    _initializeOwner(admin);
    controller = _controller;
    stickers = _controller.stickers();
    pookyball = _controller.pookyball();
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

  /// @notice Get the next rarity after `rarity`.
  function nextRarity(StickerRarity rarity) public pure returns (StickerRarity) {
    if (rarity == StickerRarity.COMMON) {
      return StickerRarity.RARE;
    } else if (rarity == StickerRarity.RARE) {
      return StickerRarity.EPIC;
    } else if (rarity == StickerRarity.EPIC) {
      return StickerRarity.LEGENDARY;
    } else if (rarity == StickerRarity.LEGENDARY) {
      return StickerRarity.MYTHIC;
    }

    revert UnsupportedRarity(rarity);
  }

  /// @notice Mint the new ascended Sticker.
  /// @dev Unsupported rarities (legendary and mythical) will revert with `UnsupportedRarity`.
  /// @param rarity The ascended Sticker rarity.
  /// @param recipient The recipient of the Sticker.
  /// @return The ascended Sticker token id.
  function _mint(StickerRarity rarity, address recipient) internal returns (uint256) {
    StickerRarity[] memory rarities = new StickerRarity[](1);
    rarities[0] = rarity;

    stickers.mint(recipient, rarities);
    return stickers.nextTokenId() - 1;
  }

  /// @dev Burn a sticker, checking that
  function _burn(uint256 stickerId, address sender, bool requireMax)
    internal
    returns (StickerMetadata memory metadata)
  {
    metadata = stickers.metadata(stickerId);
    if (requireMax && !isLevelMax(metadata)) {
      revert Ineligible(stickerId);
    }

    if (stickers.ownerOf(stickerId) == sender) {
      // pass
    } else if (
      stickers
        // Sticker is attached to a Pookyball, check the owner the Pookyball
        .ownerOf(stickerId) == address(controller)
        && pookyball.ownerOf(controller.attachedTo(stickerId)) == sender
    ) {
      stickers.transferFrom(address(controller), address(this), stickerId);
    } else {
      revert Ineligible(stickerId);
    }

    stickers.burn(stickerId);
  }

  /// @notice Ascend two maxed identical Stickers of the same rarity.
  /// @dev Since the Stickers attributes are stored off-chain, calling this function requires a proof from the Pooky back-end.
  /// @param source The first Sticker id.
  /// @param other The second Sticker id.
  /// @param data Abitrary data repeated in the `Ascended` event.
  /// @param proof The proof from the back-end: `abi.encode(source, other, data, address(this))`.
  /// @return ascendedId The ascended Sticker id.
  function ascend2(uint256 source, uint256 other, string calldata data, bytes calldata proof)
    external
    onlyVerify(abi.encode(source, other, data, address(this)), proof)
    returns (uint256 ascendedId)
  {
    StickerMetadata memory mSource = _burn(source, msg.sender, true);
    StickerMetadata memory mOther = _burn(other, msg.sender, true);
    if (mSource.rarity != mOther.rarity) {
      revert RarityMismatch(mSource.rarity, mOther.rarity);
    }

    uint256[] memory _parts = new uint[](2);
    _parts[0] = source;
    _parts[1] = other;

    StickerRarity rarity = nextRarity(mSource.rarity);
    ascendedId = _mint(rarity, msg.sender);
    emit Ascended(ascendedId, rarity, _parts, data);
  }

  /// @notice Ascend three maxed Stickers of the same rarity.
  /// @param source The reference Sticker to ascend.
  /// @param parts An array of two other maxed Stickers of the same rarity.
  /// @param data Abitrary data repeated in the `Ascended` event.
  /// @param proof The proof from the back-end: `abi.encode(source, parts, data, address(this))`.
  /// @return ascendedId The ascended Sticker id.
  function ascend3(
    uint256 source,
    uint256[2] memory parts,
    string calldata data,
    bytes calldata proof
  )
    external
    onlyVerify(abi.encode(source, parts, data, address(this)), proof)
    returns (uint256 ascendedId)
  {
    StickerMetadata memory mSource = _burn(source, msg.sender, true);

    uint256[] memory _parts = new uint[](parts.length + 1);
    _parts[0] = source;

    for (uint256 i; i < parts.length; i++) {
      _parts[i + 1] = parts[i];
      StickerMetadata memory m = _burn(parts[i], msg.sender, true);

      if (mSource.rarity != m.rarity) {
        revert RarityMismatch(mSource.rarity, m.rarity);
      }
    }

    StickerRarity rarity = nextRarity(mSource.rarity);
    ascendedId = _mint(rarity, msg.sender);
    emit Ascended(ascendedId, rarity, _parts, data);
  }

  /// @notice Ascend one maxed Sticker and five Stickers of the same rarity.
  /// @param source The reference Sticker to ascend.
  /// @param parts An array of five other Stickers of the same rarity.
  /// @param data Abitrary data repeated in the `Ascended` event.
  /// @param proof The proof from the back-end: `abi.encode(source, parts, data, address(this))`.
  /// @return ascendedId The ascended Sticker id.
  function ascend6(
    uint256 source,
    uint256[5] memory parts,
    string calldata data,
    bytes calldata proof
  )
    external
    onlyVerify(abi.encode(source, parts, data, address(this)), proof)
    returns (uint256 ascendedId)
  {
    StickerMetadata memory mSource = _burn(source, msg.sender, true);

    uint256[] memory _parts = new uint[](parts.length + 1);
    _parts[0] = source;

    // Burn parts
    for (uint256 i; i < parts.length; i++) {
      _parts[i + 1] = parts[i];

      StickerMetadata memory m = _burn(parts[i], msg.sender, false);

      // Ensure that the part[i] has the same rarity as the source
      if (mSource.rarity != m.rarity) {
        revert RarityMismatch(mSource.rarity, m.rarity);
      }
    }

    StickerRarity rarity = nextRarity(mSource.rarity);
    ascendedId = _mint(rarity, msg.sender);
    emit Ascended(ascendedId, rarity, _parts, data);
  }
}
