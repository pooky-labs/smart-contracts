// SPDX-License-Identifier: UNLICENSED
// Pooky Game Contracts (PookyGame.sol)

pragma solidity ^0.8.9;

import './interfaces/IPookyBall.sol';
import './interfaces/IPOK.sol';
import '@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol';
import { BallUpdates, BallInfo, BallRarity } from './types/DataTypes.sol';
import { Errors } from './types/Errors.sol';

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
  bytes32 public constant REWARD_SIGNER = keccak256('REWARD_SIGNER');

  // Contracts
  IPookyBall public pookyBall;
  IPOK public pok;

  uint256[] public levelPXP;
  uint256[] public levelPOKCost;
  mapping(BallRarity => uint256) maxBallLevelPerRarity;
  mapping(uint256 => bool) usedNonces;

  function initialize(address _admin) public initializer {
    __AccessControl_init();
    _setupRole(DEFAULT_ADMIN_ROLE, _admin);
  }

  /**
   * @dev Initialization function that sets the Pooky Ball maximum level for a given rarity.
   */
  function _setMaxBallLevel() external onlyRole(DEFAULT_ADMIN_ROLE) {
    maxBallLevelPerRarity[BallRarity.Uncommon] = 40;
    maxBallLevelPerRarity[BallRarity.Rare] = 60;
    maxBallLevelPerRarity[BallRarity.Epic] = 80;
    maxBallLevelPerRarity[BallRarity.Legendary] = 100;
    maxBallLevelPerRarity[BallRarity.Mythic] = 100;
  }

  /**
   * @dev Initialization function that sets the Pooky Ball PXP required for a given level.
   * Levels range starts at 0 and ends at 100, inclusive.
   * TODO(2022 Oct 11): exact formula is still in active discussion
   */
  function _setLevelPXP() external onlyRole(DEFAULT_ADMIN_ROLE) {
    levelPXP.push(0);
    levelPXP.push(3 ether);
    for (uint256 i = 2; i <= 100; i++) {
      levelPXP.push((levelPXP[i - 1] * 120) / 100);
    }
  }

  /**
   * @dev Initialization function that sets the $POK token required to level up Pooky Ball at given level.
   * Levels range starts at 0 and ends at 100, inclusive.
   * TODO(2022 Oct 11): exact formula is still in active discussion
   */
  function _setLevelPOKCost() external onlyRole(DEFAULT_ADMIN_ROLE) {
    for (uint256 i = 0; i < 100; i++) {
      levelPOKCost.push((levelPXP[i] / 3)); // $POK decimals are 18
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
   * @dev Internal function that checks if a {message} has be signed by a REWARD_SIGNER.
   */
  function verifySignature(bytes memory message, bytes memory signature) private view returns (bool) {
    address signer = keccak256(message).toEthSignedMessageHash().recover(signature);
    return hasRole(REWARD_SIGNER, signer);
  }

  /**
   * @notice level up the ball with `tokenId`. Must be called by the ball owner.
   * @notice   required amount of POK tokens are paid from the user address.
   */
  /**
   * @notice Level up a Pooky Ball in exchange of a certain amount of $POK token.
   * @dev Requirements
   * - msg.sender must be the Pooky Ball owner
   * - msg.sender must own enough $POK tokens
   * - Pooky Ball should have enough PXP to reach the next level.
   * - Pooky Ball level should be strictly less than the maximum allowed level for its rarity.
   */
  function levelUp(uint256 tokenId) public {
    require(pookyBall.ownerOf(tokenId) == msg.sender, Errors.MUST_BE_OWNER);

    BallInfo memory ball = pookyBall.getBallInfo(tokenId);
    uint256 nextLevel = ball.level + 1;

    require(ball.pxp >= levelPXP[nextLevel], Errors.NOT_ENOUGH_PXP);
    require(ball.level < maxBallLevelPerRarity[ball.rarity], Errors.MAX_LEVEL_REACHED);

    pok.burn(msg.sender, levelPOKCost[nextLevel]); // Burn $POK tokens
    pookyBall.changeBallLevel(tokenId, nextLevel);
  }

  /**
   * @notice Claim prediction rewards ($POK tokens and Ball PXP).
   * @param POKAmount The $POK token amount.
   * @param ballUpdates The updated to apply to the Pooky Balls (PXP and optional level up).
   * @param ttl UNIX timestamp until signature is valid.
   * @param nonce Unique word that prevents the usage the same signature twice.
   * @param signature The signature of the previous parameters generated using the eth_personalSign RPC call.
   */
  function claimRewards(
    uint256 POKAmount,
    BallUpdates[] calldata ballUpdates,
    uint256 ttl,
    uint256 nonce,
    bytes memory signature
  ) external {
    require(verifySignature(abi.encode(POKAmount, ballUpdates, ttl, nonce), signature), Errors.FALSE_SIGNATURE);
    require(!usedNonces[nonce], Errors.USED_NONCE);
    require(block.timestamp < ttl, Errors.TTL_PASSED);

    usedNonces[nonce] = true;

    pok.mint(msg.sender, POKAmount);

    for (uint256 i = 0; i < ballUpdates.length; i++) {
      pookyBall.addBallPXP(ballUpdates[i].tokenId, ballUpdates[i].addPXP);

      if (ballUpdates[i].shouldLevelUp) {
        levelUp(ballUpdates[i].tokenId);
      }
    }
  }
}
