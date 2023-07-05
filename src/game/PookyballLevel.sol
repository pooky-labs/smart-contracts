// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { IPOK } from "../interfaces/IPOK.sol";
import { IPookyball, PookyballMetadata, PookyballRarity } from "../interfaces/IPookyball.sol";

struct Pricing {
  uint256 requiredPXP;
  uint256 remainingPXP;
  uint256 newLevel;
  uint256 gapPOK;
  uint256 feePOK;
}

contract PookyballLevel {
  uint256 public constant PXP_DECIMALS = 18;
  uint256 public constant BASE_RATIO = 10000;
  /// @dev How much PXP is necessary is required to pass to the level 0 => 1.
  uint256 public constant BASE_PXP = 60 * 10 ** PXP_DECIMALS;
  /// @dev The POK fee is required to pass the level (over 10000).
  uint256 public constant FEE_RATIO = 800;
  /// @dev Level up POK ratio increase (over 10000).
  uint256 public constant LEVEL_RATIO = 10750;
  /// @dev How much POK is 1 PXP point (over 10000).
  uint256 public constant PXP_POK_RATIO = 1250;
  /// @dev How much POK is 1 MATIC point (over 10000).
  uint256 public constant MATIC_POK_RATIO = 350;

  IPookyball immutable pookyball;
  IPOK immutable pok;
  address immutable treasury;

  mapping(uint256 => uint256) public slots;
  mapping(PookyballRarity => uint256) public maxLevel;

  /// Thrown when an account tries to level a ball above its maximum level.
  error MaximumLevelReached(uint256 tokenId, uint256 maxLevel);
  /// Thrown when an account does own enough $POK token to pay the level up fee
  error InsufficientPOK(uint256 expected, uint256 actual);
  /// Thrown when the native transfer has failed.
  error TransferFailed(address recipient, uint256 amount);

  constructor(IPookyball _pookyball, IPOK _pok, address _treasury) {
    pookyball = _pookyball;
    pok = _pok;
    treasury = _treasury;

    maxLevel[PookyballRarity.COMMON] = 40;
    maxLevel[PookyballRarity.RARE] = 60;
    maxLevel[PookyballRarity.EPIC] = 80;
    maxLevel[PookyballRarity.LEGENDARY] = 100;
    maxLevel[PookyballRarity.MYTHIC] = 120;

    slots[1] = BASE_PXP;
    compute(2, 120);
  }

  function compute(uint256 from, uint256 to) public {
    for (uint256 i = from; i <= to;) {
      slots[i] = slots[i - 1] * LEVEL_RATIO / 10000;
      unchecked {
        i++;
      }
    }
  }

  function getPricing(uint256 tokenId, uint256 increase, uint256 value)
    public
    view
    returns (Pricing memory pricing)
  {
    PookyballMetadata memory metadata = pookyball.metadata(tokenId);

    // Ensure the ball does not go over the maximum allowed level
    if (metadata.level + increase > maxLevel[metadata.rarity]) {
      revert MaximumLevelReached(tokenId, maxLevel[metadata.rarity]);
    }

    for (uint256 i = 1; i <= increase; i++) {
      pricing.requiredPXP += slots[metadata.level + i];
    }

    if (pricing.requiredPXP > metadata.pxp) {
      pricing.gapPOK = (pricing.requiredPXP - metadata.pxp) * PXP_POK_RATIO / BASE_RATIO;
    } else {
      pricing.remainingPXP = metadata.pxp - pricing.requiredPXP;
    }

    pricing.feePOK = pricing.requiredPXP * FEE_RATIO / BASE_RATIO;
    uint256 coverPOK = value * BASE_RATIO / MATIC_POK_RATIO;

    if (pricing.feePOK > coverPOK) {
      pricing.feePOK -= coverPOK;
    } else {
      pricing.feePOK = 0;
    }

    pricing.newLevel = metadata.level + increase;
  }

  function levelUp(uint256 tokenId, uint256 increase) external payable {
    Pricing memory pricing = getPricing(tokenId, increase, msg.value);
    uint256 requiredPOK = pricing.gapPOK + pricing.feePOK;

    uint256 balancePOK = pok.balanceOf(msg.sender);
    if (requiredPOK > balancePOK) {
      revert InsufficientPOK(requiredPOK, balancePOK);
    }

    // Burn $POK tokens
    pok.burn(msg.sender, requiredPOK);

    // Reset the ball PXP
    pookyball.setPXP(tokenId, pricing.remainingPXP);
    // Increment the ball level
    pookyball.setLevel(tokenId, pricing.newLevel);

    if (msg.value > 0) {
      // Forward the funds to the treasury wallet
      (bool sent,) = treasury.call{ value: msg.value }("");
      if (!sent) {
        revert TransferFailed(treasury, msg.value);
      }
    }
  }
}
