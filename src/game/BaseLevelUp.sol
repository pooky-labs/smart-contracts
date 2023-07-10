// SPDX-License-Identifier: MIT
// Pooky Game Contracts (game/BaseLevelUp.sol)
pragma solidity ^0.8.20;

import { ECDSA } from "openzeppelin/utils/cryptography/ECDSA.sol";
import { OwnableRoles } from "solady/auth/OwnableRoles.sol";
import { BaseTreasury } from "../base/BaseTreasury.sol";
import { IPOK } from "../interfaces/IPOK.sol";
import { IPookyball, PookyballMetadata } from "../interfaces/IPookyball.sol";

struct Pricing {
  uint256 requiredPXP;
  uint256 remainingPXP;
  uint256 newLevel;
  uint256 gapPOK;
  uint256 feePOK;
}

/**
 * @title BaseLevelUp
 * @author Mathieu Bour
 * @notice Base level up contract for tokens using exponential level growth, POK/NAT integration and offchain PXP.
 */
abstract contract BaseLevelUp is OwnableRoles, BaseTreasury {
  using ECDSA for bytes32;

  // Roles
  uint256 public constant SIGNER = _ROLE_0;

  uint256 public constant PXP_DECIMALS = 18;
  uint256 public constant BASE_RATIO = 10000;
  /// @dev How much PXP is necessary is required to pass to the level 0 => 1.
  uint256 public basePXP;
  /// @dev How much POK is 1 PXP point (over 10000).
  uint256 public ratePXP_POK = 1250;
  /// @dev How much POK is 1 native currency (over 10000).
  uint256 public rateNAT_POK = 350;
  /// @dev Level PXP growth factor (over 10000).
  /// Example: 10750 means that every level requires 7.5% more PXP that the previous one.
  uint256 public growth = 10750;
  /// @dev The POK fee required to pass the level (over 10000).
  /// Example: 800 means that every level requires 8% of the level PXP in POK.
  uint256 public fee = 800;

  /// The POK token destination address.
  IPOK public immutable pok;

  mapping(uint256 => uint256) public slots;

  /// Thrown when the signature is invalid.
  error InvalidSignature();
  /// Thrown when an account tries to level a ball above its maximum level.
  error MaximumLevelReached(uint256 tokenId, uint256 maxLevel);
  /// Thrown when an account does own enough $POK token to pay the level up fee
  error InsufficientPOK(uint256 expected, uint256 actual);
  /// Thrown when the native transfer has failed.
  error TransferFailed(address recipient, uint256 amount);

  constructor(IPOK _pok, address admin, address _treasury, uint256 _basePXP, uint256 precompute)
    BaseTreasury(_treasury)
  {
    pok = _pok;
    _initializeOwner(admin);
    basePXP = _basePXP;
    slots[1] = _basePXP;
    _compute(2, precompute);
  }

  function _compute(uint256 from, uint256 to) internal {
    for (uint256 i = from; i <= to;) {
      slots[i] = slots[i - 1] * growth / 10000;
      unchecked {
        i++;
      }
    }
  }

  /**
   * Change how much PXP is necessary is required to pass to the level 0 => 1.
   * @param _basePXP The new base PXP value.
   */
  function changeBasePXP(uint256 _basePXP) external onlyOwner {
    basePXP = _basePXP;
  }

  /**
   * Change how much POK is 1 PXP point (over 10000).
   * @param _ratePXP_POK The new PXP/POK rate value.
   */
  function changeRatePXP_POK(uint256 _ratePXP_POK) external onlyOwner {
    ratePXP_POK = _ratePXP_POK;
  }

  /**
   * Change how much POK is 1 native currency (over 10000).
   * @param _rateNAT_POK The new NAT/POK rate value.
   */
  function changeRateNAT_POK(uint256 _rateNAT_POK) external onlyOwner {
    rateNAT_POK = _rateNAT_POK;
  }

  /**
   * Change the level PXP growth factor.
   * @param _growth The new growth factor.
   */
  function changeGrowth(uint256 _growth) external onlyOwner {
    growth = _growth;
  }

  /**
   * Change the POK fee required to pass the level.
   * @param _fee The new POK fee.
   */
  function changeFee(uint256 _fee) external onlyOwner {
    fee = _fee;
  }

  /**
   * Get the level details of a token.
   * @param tokenId The token id.
   * @return The current token level.
   * @return The maximum allowed level.
   */
  function _getLevel(uint256 tokenId) internal virtual returns (uint256, uint256);

  /**
   * Apply the new level and PXP change.
   * @param tokenId The token id.
   * @param newLevel The new level.
   * @param newPXP The new PXP amount.
   */
  function _apply(uint256 tokenId, uint256 newLevel, uint256 newPXP) internal virtual;

  /**
   * Compute the level up pricing given the token parameters.
   * @param currentLevel The token current level.
   * @param currentPXP The token current PXP.
   * @param increase The number of level to increase.
   * @param value The transaction value in native currency.
   */
  function getPricing(uint256 currentLevel, uint256 currentPXP, uint256 increase, uint256 value)
    public
    view
    returns (Pricing memory pricing)
  {
    for (uint256 i = 1; i <= increase; i++) {
      pricing.requiredPXP += slots[currentLevel + i];
    }

    if (pricing.requiredPXP > currentPXP) {
      pricing.gapPOK = (pricing.requiredPXP - currentPXP) * ratePXP_POK / BASE_RATIO;
    } else {
      pricing.remainingPXP = currentPXP - pricing.requiredPXP;
    }

    pricing.feePOK = pricing.requiredPXP * fee / BASE_RATIO;
    uint256 coverPOK = value * BASE_RATIO / rateNAT_POK;

    if (pricing.feePOK > coverPOK) {
      pricing.feePOK -= coverPOK;
    } else {
      pricing.feePOK = 0;
    }

    pricing.newLevel = currentLevel + increase;
  }

  /**
   * Level up a token with offchain PXP validation.
   * @param tokenId The token id.
   * @param increase The number of levels to increase.
   * @param currentPXP The token current PXP.
   * @param proof The signature of abi.encode(tokenId, currentPXP).
   */
  function levelUp(uint256 tokenId, uint256 increase, uint256 currentPXP, bytes memory proof)
    external
    payable
  {
    // Generate the signed message from the tokenId and currentPXP
    bytes32 hash = keccak256(abi.encode(tokenId, currentPXP)).toEthSignedMessageHash();

    if (!hasAllRoles(hash.recover(proof), SIGNER)) {
      revert InvalidSignature();
    }

    (uint256 currentLevel, uint256 maxLevel) = _getLevel(tokenId);
    if (currentLevel + increase > maxLevel) {
      revert MaximumLevelReached(tokenId, maxLevel);
    }

    Pricing memory pricing = getPricing(currentLevel, currentPXP, increase, msg.value);
    uint256 requiredPOK = pricing.gapPOK + pricing.feePOK;

    uint256 balancePOK = pok.balanceOf(msg.sender);
    if (requiredPOK > balancePOK) {
      revert InsufficientPOK(requiredPOK, balancePOK);
    }

    // Burn $POK tokens
    pok.burn(msg.sender, requiredPOK);

    _apply(tokenId, pricing.newLevel, pricing.remainingPXP);

    if (msg.value > 0) {
      // Forward the funds to the treasury wallet
      (bool sent,) = treasury.call{ value: msg.value }("");
      if (!sent) {
        revert TransferFailed(treasury, msg.value);
      }
    }
  }
}
