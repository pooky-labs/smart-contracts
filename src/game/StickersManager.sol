// SPDX-License-Identifier: MIT
// Pooky Game Contracts (game/StickersManager.sol)
pragma solidity ^0.8.19;

import { OwnableRoles } from "solady/auth/OwnableRoles.sol";
import { IPookyball } from "../interfaces/IPookyball.sol";
import { IStickers } from "../interfaces/IStickers.sol";
import { IStickersController } from "../interfaces/IStickersController.sol";
import { PookyballMetadata } from "../types/PookyballMetadata.sol";
import { PookyballRarity } from "../types/PookyballRarity.sol";

contract StickersManager {
  IStickers public immutable stickers;
  IPookyball public immutable pookyball;
  IStickersController public immutable sstorage;

  error OwnershipRequired(address token, uint256 tokenId);
  error InsufficientFreeSlot(uint256 pookyballId);

  constructor(IStickersController controller) {
    sstorage = controller;
    stickers = controller.stickers();
    pookyball = controller.pookyball();
  }

  function slots(uint256 pookyballId) public view returns (uint256 total, uint256 unlocked, uint256 free) {
    PookyballMetadata memory metadata = pookyball.metadata(pookyballId);

    if (metadata.rarity == PookyballRarity.COMMON) {
      total = 4;
    } else if (metadata.rarity == PookyballRarity.RARE) {
      total = 6;
    } else if (metadata.rarity == PookyballRarity.EPIC) {
      total = 8;
    } else if (metadata.rarity == PookyballRarity.LEGENDARY) {
      total = 10;
    } else if (metadata.rarity == PookyballRarity.MYTHIC) {
      total = 12;
    }

    unlocked = (metadata.level + 1) / 10;
    uint256 used = sstorage.slots(pookyballId).length;

    // We might have some promotional offers that allow to unlock the slots before the Pookyball has reached the required level
    if (used > unlocked) {
      unlocked = used;
    }

    free = unlocked - used;
  }

  function attach(uint256 stickerId, uint256 pookyballId) external {
    if (stickers.ownerOf(stickerId) != msg.sender) {
      revert OwnershipRequired(address(stickers), stickerId);
    }

    if (pookyball.ownerOf(pookyballId) != msg.sender) {
      revert OwnershipRequired(address(pookyball), pookyballId);
    }

    (,, uint256 free) = slots(pookyballId);

    if (free == 0) {
      revert InsufficientFreeSlot(pookyballId);
    }

    sstorage.attach(stickerId, pookyballId);
  }
}
