// SPDX-License-Identifier: MIT
// Pooky Game Contracts (game/Rewards.sol)
pragma solidity ^0.8.17;

import { OwnableRoles } from "solady/auth/OwnableRoles.sol";
import { ECDSA } from "solady/utils/ECDSA.sol";
import { INonceRegistry } from "../interfaces/INonceRegistry.sol";
import { IPOK } from "../interfaces/IPOK.sol";
import { IPookyball, PookyballMetadata, PookyballRarity } from "../interfaces/IPookyball.sol";
import { IStickers, StickerMetadata, StickerRarity } from "../interfaces/IStickers.sol";

struct RewardsData {
  /// The amount of native currency.
  uint256 amountNAT;
  /// The amount of $POK token.
  uint256 amountPOK;
  /// The rarities of the minted Pookyballs.
  PookyballRarity[] pookyballs;
  /// The rarities of the minted Stickers.
  StickerRarity[] stickers;
  /// The nonces that represents the payload. This prevent accounts to claim the same reward twice.
  bytes32[] nonces;
}

/**
 * @title Rewards
 * @author Mathieu Bour, Claudiu Micu
 * @notice Gameplay contract that allows to claim rewards native, $POK tokens and Pookyball PXP rewards.
 * @dev Only authorized REWARDER-role can sign the rewards payload.
 */
contract Rewards is OwnableRoles {
  using ECDSA for bytes32;

  // Roles
  uint256 public constant REWARDER = _ROLE_0;

  // Contracts
  IPOK public immutable pok;
  IPookyball public immutable pookyball;
  IStickers public immutable stickers;

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
    IStickers _stickers,
    INonceRegistry _nonces,
    address admin,
    address[] memory rewarders
  ) {
    pok = _pok;
    pookyball = _pookyball;
    stickers = _stickers;
    nonces = _nonces;

    // Set up the roles
    _initializeOwner(admin);
    uint256 length = rewarders.length;
    for (uint256 i; i < length;) {
      _grantRoles(rewarders[i], REWARDER);
      unchecked {
        i++;
      }
    }
  }

  /**
   * @notice Receive funds that will be used for native token reward.
   */
  receive() external payable { }

  /**
   * @notice Recover all the funds on the contract.
   */
  function withdraw() external onlyOwner {
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
    uint256 length = rewards.nonces.length;
    for (uint256 i; i < length; i++) {
      if (nonces.has(rewards.nonces[i])) {
        revert AlreadyClaimed(rewards.nonces[i]);
      }

      nonces.set(rewards.nonces[i], true);
    }

    if (!hasAllRoles(hash.recover(signature), REWARDER)) {
      revert InvalidSignature();
    }

    // Mint $POK token
    if (rewards.amountPOK > 0) {
      pok.mint(msg.sender, rewards.amountPOK);
    }

    // Mint Pookyballs
    if (rewards.pookyballs.length > 0) {
      uint256 pookyballCount = rewards.pookyballs.length;
      address[] memory addresses = new address[](pookyballCount);

      for (uint256 i; i < pookyballCount;) {
        addresses[i] = msg.sender;
        unchecked {
          i++;
        }
      }

      pookyball.mint(addresses, rewards.pookyballs);
    }

    // Mint Stickers
    if (rewards.stickers.length > 0) {
      stickers.mint(msg.sender, rewards.stickers);
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
