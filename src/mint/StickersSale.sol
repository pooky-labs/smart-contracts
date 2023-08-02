// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { OwnableRoles } from "solady/auth/OwnableRoles.sol";
import { BaseTreasury } from "@/base/BaseTreasury.sol";
import { IStickers, StickerMint, StickerRarity } from "@/interfaces/IStickers.sol";

struct Pack {
  uint256 price;
  /// Supply of the current sale
  uint256 supply;
  /// Total number of tokens minted during all the sales
  uint256 minted;
  /// Total supply of all the sales
  uint256 totalSupply;
  PackContent content;
}

struct PackContent {
  /// How many common stickers are in the pack.
  uint256 common;
  /// How many rare stickers are in the pack.
  uint256 rare;
  /// How many epic stickers are in the pack.
  uint256 epic;
  /// How many legendary stickers are in the pack.
  uint256 legendary;
}

struct Refill {
  uint256 packId;
  /// The token price in native currency wei.
  uint256 price;
  /// The refill token quantity.
  uint256 quantity;
}

/// @title StickersSale
/// @author Mathieu Bour for Pooky Labs Ltd.
/// @notice Sticker Sale contract that can be refilled by an admin.
/// @dev Roles:
/// - Owner: allowd to create new packs
/// - Seller: allowed to refill the sale
contract StickersSale is OwnableRoles, BaseTreasury {
  uint256 public constant SELLER = _ROLE_0;

  /// The Stickers contract address.
  IStickers public immutable stickers;

  /// The date when next mint window will open (compared to block.timestamp).
  uint256 public closedUntil;

  mapping(uint256 => Pack) private packs;
  /// The number of created packs.
  uint256 size;

  /// Thrown when a mint is attempt before the sale opens.
  error Closed(uint256 closedUntil);
  /// Thrown when the passed pack id is invalid (greater or equal than `size`).
  error InvalidPack();
  /// Thrown when a mint would exceed the pack supply.
  error InsufficientSupply(uint256 packId);

  constructor(IStickers _stickers, address admin, address _treasury, Pack[] memory _packs)
    BaseTreasury(_treasury)
  {
    stickers = _stickers;
    _initializeOwner(admin);

    uint256 length = _packs.length;
    for (uint256 i; i < length;) {
      _create(_packs[i]);
      unchecked {
        i++;
      }
    }
  }

  /// @notice List available packs.
  function getPacks() external view returns (Pack[] memory) {
    Pack[] memory output = new Pack[](size);
    for (uint256 i; i < size;) {
      output[i] = packs[i];
      unchecked {
        i++;
      }
    }

    return output;
  }

  /// @notice Checks if the sale is open.
  function isClosed() public view returns (bool) {
    return closedUntil == 0 || block.timestamp < closedUntil;
  }

  /// @dev Internal unprotected pack creation.
  function _create(Pack memory _pack) internal {
    packs[size++] = _pack;
  }

  /// @notice Create a new pack.
  /// @dev Requirements:
  /// - Only owner can create new packs.
  function create(Pack memory _pack) external onlyOwner {
    _create(_pack);
  }

  /// @notice Purchase a Stickers pack.
  /// @dev Requirements:
  /// - Sale must be open.
  /// - Pack ID must exist.
  /// - Transaction value must be greater or equal than the pack price.
  function purchase(uint256 packId) external payable forwarder {
    if (isClosed()) {
      revert Closed(closedUntil);
    }

    if (packId >= size) {
      revert InvalidPack();
    }

    Pack memory pack = packs[packId];

    if (pack.minted + 1 > pack.totalSupply) {
      revert InsufficientSupply(packId);
    }

    if (msg.value < pack.price) {
      revert InsufficientValue(msg.value, pack.price);
    }

    uint256 quantity =
      pack.content.common + pack.content.rare + pack.content.epic + pack.content.legendary;

    StickerRarity[] memory rarities = new StickerRarity[](quantity);

    uint256 requestId;
    for (uint256 i; i < pack.content.common;) {
      rarities[requestId++] = StickerRarity.COMMON;
      unchecked {
        i++;
      }
    }
    for (uint256 i; i < pack.content.rare;) {
      rarities[requestId++] = StickerRarity.RARE;
      unchecked {
        i++;
      }
    }
    for (uint256 i; i < pack.content.epic;) {
      rarities[requestId++] = StickerRarity.EPIC;
      unchecked {
        i++;
      }
    }
    for (uint256 i; i < pack.content.legendary;) {
      rarities[requestId++] = StickerRarity.LEGENDARY;
      unchecked {
        i++;
      }
    }

    stickers.mint(msg.sender, rarities);
    packs[packId].minted++;
  }

  /// @notice Restock the sale items.
  /// @param refills Array of the modifications to apply.
  /// @param _closedUntil Update the opening of the sale; a date in the past opens the sale immediately.
  /// @dev Requirements:
  /// - msg.sender must have the `SELLER` role or be the owner
  function restock(Refill[] memory refills, uint256 _closedUntil) external onlyRolesOrOwner(SELLER) {
    uint256 length = refills.length;
    for (uint256 i = 0; i < length; i++) {
      Pack memory current = packs[refills[i].packId];
      current.price = refills[i].price;
      current.totalSupply = current.minted + refills[i].quantity;
      current.supply = refills[i].quantity;
      packs[refills[i].packId] = current;
    }

    closedUntil = _closedUntil;
  }
}
