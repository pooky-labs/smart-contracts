// SPDX-License-Identifier: MIT
// Pooky Game Contracts (game/Rewards.sol)
pragma solidity ^0.8.17;

import "openzeppelin/access/AccessControl.sol";
import "openzeppelin/utils/cryptography/ECDSA.sol";
import "../interfaces/IPOK.sol";
import { IPookyball, PookyballMetadata, PookyballRarity } from "../../src/interfaces/IPookyball.sol";
import "../interfaces/INonceRegistry.sol";

struct RewardsPXP {
  uint256 tokenId;
  uint256 amountPXP;
}

struct RewardsData {
  /// The amount of native currency
  uint256 amountNAT;
  /// The amount of $POK token
  uint256 amountPOK;
  /// The amount of Pookyball PXP to grant to the tokens
  RewardsPXP[] pxp;
  /// The rarities of the minted Pookyballs.
  PookyballRarity[] pookyballs;
  /// The nonces that represents the payload. This prevent accounts to claim the same reward twice.
  bytes32[] nonces;
}

/**
 * @title Rewards
 * @author Mathieu Bour, Claudiu Micu
 * @notice Gameplay contract that allows to claim rewards native, $POK tokens and Pookyball PXP rewards.
 * @dev Only authorized REWARDER-role can sign the rewards payload.
 */
contract Rewards is AccessControl {
  using ECDSA for bytes32;

  // Roles
  bytes32 public constant REWARDER = keccak256("REWARDER");

  // Contracts
  IPookyball public immutable pookyball;
  IPOK public immutable pok;

  /// To prevent users to use the same signature multiple times, we mark the rewards as claimed.
  INonceRegistry public nonces;

  /// Fired when rewards are claimed.
  event RewardsClaimed(address indexed account, RewardsData rewards, string data);

  /// Thrown when an account submits an invalid signature.
  error InvalidSignature();
  /// Thrown when an account tries to claim rewards twice.
  error AlreadyClaimed(bytes32 nonce);
  /// Thrown when the reward contract does not own enough native currency.
  error InsufficientBalance(uint256 expected, uint256 actual);
  /// Thrown when the native transfer has failed.
  error TransferFailed(address recipient, uint256 amount);

  constructor(
    IPOK _pok,
    IPookyball _pookyball,
    INonceRegistry _nonces,
    address admin,
    address[] memory rewarders
  ) {
    pok = _pok;
    pookyball = _pookyball;
    nonces = _nonces;

    // Set up the roles
    _grantRole(DEFAULT_ADMIN_ROLE, admin);
    for (uint256 i = 0; i < rewarders.length; i++) {
      _grantRole(REWARDER, rewarders[i]);
    }
  }

  /**
   * @notice Receive funds that will be used for native token reward.
   */
  receive() external payable { }

  /**
   * @notice Recover all the funds on the contract.
   */
  function withdraw() external onlyRole(DEFAULT_ADMIN_ROLE) {
    (bool sent,) = address(msg.sender).call{ value: address(this).balance }("");
    if (!sent) {
      revert TransferFailed(msg.sender, address(this).balance);
    }
  }

  /**
   * @notice Claim rewards using a signature generated from the Pooky game back-end.
   * Rewards include: native currency, $POK tokens, PXP for the Pookyball tokens and Pookyball tokens.
   * @dev Requirements:
   * - signature is valid
   * - tokenIds and tokenPXP have the same size
   * - contract has enough native currency to reward player
   */
  function claim(RewardsData memory rewards, bytes memory signature, string memory data) external {
    // Generate the signed message from the sender, rewards and nonce
    bytes32 hash = keccak256(abi.encode(msg.sender, rewards, data)).toEthSignedMessageHash();

    // Ensure that all rewards are claimed only once
    for (uint256 i = 0; i < rewards.nonces.length; i++) {
      if (nonces.has(rewards.nonces[i])) {
        revert AlreadyClaimed(rewards.nonces[i]);
      }

      nonces.set(rewards.nonces[i], true);
    }

    if (!hasRole(REWARDER, hash.recover(signature))) {
      revert InvalidSignature();
    }

    // Mint $POK token
    if (rewards.amountPOK > 0) {
      pok.mint(msg.sender, rewards.amountPOK);
    }

    // Increase Pookyballs PXP
    if (rewards.pxp.length > 0) {
      for (uint256 i = 0; i < rewards.pxp.length; i++) {
        PookyballMetadata memory metadata = pookyball.metadata(rewards.pxp[i].tokenId);
        pookyball.setPXP(rewards.pxp[i].tokenId, metadata.pxp + rewards.pxp[i].amountPXP);
      }
    }

    if (rewards.pookyballs.length > 0) {
      address[] memory addresses = new address[](
                rewards.pookyballs.length
            );
      for (uint256 i = 0; i < rewards.pookyballs.length; i++) {
        addresses[i] = msg.sender;
      }

      pookyball.mint(addresses, rewards.pookyballs);
    }

    // Transfer native currency
    if (rewards.amountNAT > 0) {
      // Ensure that the contract has enough tokens to deliver
      if (address(this).balance < rewards.amountNAT) {
        revert InsufficientBalance(rewards.amountNAT, address(this).balance);
      }

      (bool sent,) = address(msg.sender).call{ value: rewards.amountNAT }("");
      if (!sent) {
        revert TransferFailed(msg.sender, rewards.amountNAT);
      }
    }

    emit RewardsClaimed(msg.sender, rewards, data);
  }
}
