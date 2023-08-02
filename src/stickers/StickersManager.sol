// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { IPookyball, PookyballMetadata, PookyballRarity } from "@/pookyball/IPookyball.sol";
import { IStickers } from "@/stickers/IStickers.sol";
import { IStickersController } from "@/stickers/IStickersController.sol";

/// @title StickersManager
/// @author Mathieu Bour for Pooky Labs Ltd.
///
/// @dev Implementation of the manager that allows end users to attach or replace stickers to Pookyballs.
contract StickersManager {
  IStickers public immutable stickers;
  IPookyball public immutable pookyball;
  IStickersController public immutable controller;

  error OwnershipRequired(address token, uint256 tokenId);
  error InsufficientFreeSlot(uint256 pookyballId);

  constructor(IStickersController _controller) {
    controller = _controller;
    stickers = _controller.stickers();
    pookyball = _controller.pookyball();
  }

  modifier checkOwnership(uint256 stickerId, uint256 pookyballId) {
    if (stickers.ownerOf(stickerId) != msg.sender) {
      revert OwnershipRequired(address(stickers), stickerId);
    }

    if (pookyball.ownerOf(pookyballId) != msg.sender) {
      revert OwnershipRequired(address(pookyball), pookyballId);
    }

    _;
  }

  function slots(uint256 pookyballId)
    public
    view
    returns (uint256 total, uint256 unlocked, uint256 free)
  {
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
    uint256 used = controller.slots(pookyballId).length;

    // We might have some promotional offers that allow to unlock the slots before the Pookyball has reached the required level
    if (used > unlocked) {
      unlocked = used;
    }

    free = unlocked - used;
  }

  function attach(uint256 stickerId, uint256 pookyballId)
    external
    checkOwnership(stickerId, pookyballId)
  {
    (,, uint256 free) = slots(pookyballId);

    if (free == 0) {
      revert InsufficientFreeSlot(pookyballId);
    }

    controller.attach(stickerId, pookyballId);
  }

  function replace(uint256 stickerId, uint256 previousStickerId, uint256 pookyballId)
    external
    checkOwnership(stickerId, pookyballId)
  {
    controller.replace(stickerId, previousStickerId, pookyballId);
  }
}
