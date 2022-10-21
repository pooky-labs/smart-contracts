// SPDX-License-Identifier: UNLICENSED
// Pooky Game Contracts (PookyGame.sol)

pragma solidity ^0.8.9;

import "./interfaces/IPookyBall.sol";
import "./interfaces/IPOK.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";
import { BallUpdates, BallInfo, BallRarity } from "./types/DataTypes.sol";

/**
 * @title PookyBallMinter
 * @author Pooky Engineering Team
 *
 * @notice The contract controls the on-chain features of the Pooky game.
 * Notable features:
 * - Claim prediction rewards (Pooky Ball PXP + $POK tokens) using a signature from the Pooky back-end.
 * - Level up Pooky Balls by spending $POK token.
 *
 * Roles:
 * - DEFAULT_ADMIN_ROLE can add/remove roles.
 * - REWARD_SIGNER can sign rewards claims.
 */
contract PookyGame is AccessControlUpgradeable {
  using ECDSAUpgradeable for bytes32;

  // Roles
  bytes32 public constant REWARD_SIGNER = keccak256("REWARD_SIGNER");

  // Contracts
  IPookyBall public pookyBall;
  IPOK public pok;

  uint256 public constant PXP_DECIMALS = 18;
  uint256 public constant PXP_BASE = 60 * 10**PXP_DECIMALS;
  uint256 public constant RATIO_DECIMALS = 3;
  uint256 public constant RATIO_PXP = 1085; // =1.085: each level costs 1.085 more than the previous one.
  uint256 public constant RATIO_POK = 90; // =0.090: 9% of PXP cost is required in $POK tokens to confirm level up.

  mapping(BallRarity => uint256) public maxBallLevelPerRarity;
  mapping(uint256 => bool) nonces;

  /// Thrown when an account tries to level up a ball that is not owned the sender.
  error OwnershipRequired(uint256 tokenId);
  /// Thrown when an account tries to level a ball above its maximum level.
  error MaximumLevelReached(uint256 tokenId, uint256 maxLevel);
  /// Thrown when an account does not own enough $POK token to cover the level up fee.
  error InsufficientPOKBalance(uint256 required, uint256 actual);
  /// Thrown when an account submits an invalid signature.
  error InvalidSignature();
  /// Thrown when an account submits an expired signature.
  error ExpiredSignature(uint256 expiration);
  /// Thrown when an account tries to claim rewards twice.
  error NonceUsed();
  /// Thrown when the native transfer has failed.
  error TransferFailed(uint256 amount, address recipient);

  function initialize(address _admin) public initializer {
    __AccessControl_init();
    _setupRole(DEFAULT_ADMIN_ROLE, _admin);

    // Set the Pooky Ball maximum level for a given rarity
    maxBallLevelPerRarity[BallRarity.Common] = 40;
    maxBallLevelPerRarity[BallRarity.Rare] = 60;
    maxBallLevelPerRarity[BallRarity.Epic] = 80;
    maxBallLevelPerRarity[BallRarity.Legendary] = 100;
    maxBallLevelPerRarity[BallRarity.Mythic] = 100;
  }

  /**
   * @notice Receive funds that will be used for native token reward.
   */
  receive() external payable {}

  /**
   * @notice Withdraw all the native tokens of the contract.
   * @dev Useful if the contract need to be hard-upgraded.
   * Requirements:
   * - only DEFAULT_ADMIN_ROLE role can withdraw the native tokens.
   */
  function withdraw() external onlyRole(DEFAULT_ADMIN_ROLE) {
    (bool sent, ) = address(msg.sender).call{ value: address(this).balance }("");
    if (!sent) {
      revert TransferFailed(address(this).balance, msg.sender);
    }
  }

  /**
   * @notice Sets the address of the PookyBall contract.
   * @dev Requirements:
   * - only DEFAULT_ADMIN_ROLE role can call this function.
   */
  function setPookyBallContract(address _pookyBall) external onlyRole(DEFAULT_ADMIN_ROLE) {
    pookyBall = IPookyBall(_pookyBall);
  }

  /**
   * @notice Sets the address of the POK contract.
   * @dev Requirements:
   * - only DEFAULT_ADMIN_ROLE role can call this function.
   */
  function setPOKContract(address _pok) external onlyRole(DEFAULT_ADMIN_ROLE) {
    pok = IPOK(_pok);
  }

  /**
   * Get the PXP required to level up a ball to {level}.
   * @param level The targeted level.
   */
  function levelPXP(uint256 level) public pure returns (uint256) {
    if (level == 0) {
      return 0;
    }

    uint256 acc = PXP_BASE;
    for (uint256 i = 1; i < level; i++) {
      acc = (acc * RATIO_PXP) / 10**3;
    }

    return acc;
  }

  /**
   * Get the $POK tokens required to level up a ball to {level}. This does not take the ball PXP into account.
   * @param level The targeted level.
   */
  function levelPOK(uint256 level) public pure returns (uint256) {
    return (levelPXP(level) * RATIO_POK) / 10**RATIO_DECIMALS;
  }

  /**
   * Get the $POK tokens required to level up the ball identified by {tokenId}.
   * This computation the ball PXP into account and add an additional POK fee if ball does not have enough PXP.
   * @param tokenId The targeted level.
   */
  function levelPOKCost(uint256 tokenId) public view returns (uint256) {
    BallInfo memory ball = pookyBall.getBallInfo(tokenId);
    uint256 requiredPXP = levelPXP(ball.level + 1);
    uint256 requiredPOK = levelPOK(ball.level + 1);

    if (requiredPXP <= ball.pxp) {
      return requiredPOK;
    } else {
      // If the ball has not enough PXP, missing PXP can be covered with $POK tokens at {POK_FACTOR} ratio
      return requiredPOK + ((requiredPXP - ball.pxp) * RATIO_POK) / 10**RATIO_DECIMALS;
    }
  }

  /**
   * @notice Level up a Pooky Ball in exchange of a certain amount of $POK token.
   * @dev Requirements
   * - msg.sender must be the owner of Pooky Ball tokenId.
   * - Pooky Ball level should be strictly less than the maximum allowed level for its rarity.
   * - msg.sender must own enough $POK tokens to pay the level up fee.
   */
  function levelUp(uint256 tokenId) public {
    BallInfo memory ball = pookyBall.getBallInfo(tokenId);
    uint256 nextLevel = ball.level + 1;
    uint256 remainingPXP = 0;

    if (pookyBall.ownerOf(tokenId) != msg.sender) {
      revert OwnershipRequired(tokenId);
    }

    if (ball.level >= maxBallLevelPerRarity[ball.rarity]) {
      revert MaximumLevelReached(tokenId, maxBallLevelPerRarity[ball.rarity]);
    }

    uint256 levelPOKCost_ = levelPOKCost(tokenId);
    if (levelPOKCost_ > pok.balanceOf(msg.sender)) {
      revert InsufficientPOKBalance(levelPOKCost(tokenId), pok.balanceOf(msg.sender));
    }

    if (ball.pxp > levelPXP(nextLevel)) {
      remainingPXP = ball.pxp - levelPXP(nextLevel);
    }

    // Burn $POK tokens
    pok.burn(msg.sender, levelPOKCost_);
    // Reset the ball PXP
    pookyBall.changePXP(tokenId, remainingPXP);
    // Increment the ball level
    pookyBall.changeLevel(tokenId, nextLevel);
  }

  /**
   * @dev Internal function that checks if a {message} has be signed by a REWARD_SIGNER.
   */
  function verifySignature(bytes memory message, bytes memory signature) private view returns (bool) {
    address signer = keccak256(message).toEthSignedMessageHash().recover(signature);
    return hasRole(REWARD_SIGNER, signer);
  }

  /**
   * @notice Claim prediction rewards ($POK tokens and Ball PXP).
   * @dev No explicit re-entrancy guard is present as this function is nonce-based.
   * @param amountNative The amount of native currency to transfer.
   * @param amountPOK The $POK token amount.
   * @param ballUpdates The updated to apply to the Pooky Balls (PXP and optional level up).
   * @param ttl UNIX timestamp until signature is valid.
   * @param nonce Unique word that prevents the usage the same signature twice.
   * @param signature The signature of the previous parameters generated using the eth_personalSign RPC call.
   */
  function claimRewards(
    uint256 amountNative,
    uint256 amountPOK,
    BallUpdates[] calldata ballUpdates,
    uint256 ttl,
    uint256 nonce,
    bytes memory signature
  ) external {
    if (!verifySignature(abi.encode(msg.sender, amountNative, amountPOK, ballUpdates, ttl, nonce), signature)) {
      revert InvalidSignature();
    }

    if (block.timestamp > ttl) {
      revert ExpiredSignature(ttl);
    }

    if (nonces[nonce]) {
      revert NonceUsed();
    }

    nonces[nonce] = true;

    pok.mint(msg.sender, amountPOK);

    for (uint256 i = 0; i < ballUpdates.length; i++) {
      BallInfo memory ball = pookyBall.getBallInfo(ballUpdates[i].tokenId);
      pookyBall.changePXP(ballUpdates[i].tokenId, ball.pxp + ballUpdates[i].addPXP);

      if (ballUpdates[i].shouldLevelUp) {
        levelUp(ballUpdates[i].tokenId);
      }
    }

    (bool sent, ) = address(msg.sender).call{ value: amountNative }("");
    if (!sent) {
      revert TransferFailed(amountNative, msg.sender);
    }
  }
}
