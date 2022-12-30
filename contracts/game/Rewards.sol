// SPDX-License-Identifier: MIT
// Pooky Game Contracts (game/Rewards.sol)
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "../interfaces/IPookyball.sol";
import "../interfaces/IPOK.sol";
import "../types/PookyballMetadata.sol";

struct RewardsPXP {
  uint256 tokenId;
  uint256 amountPXP;
}

struct RewardsMint {
  PookyballRarity rarity;
  uint256 luxury;
}

struct RewardsData {
  /// The amount of native currency
  uint256 amountNAT;
  /// The amount of $POK token
  uint256 amountPOK;
  /// The amount of Pookyball PXP to grant to the tokens
  RewardsPXP[] pxp;
  /// The details of the new Pookyball token
  RewardsMint[] mints;
}

/**
 * @title Rewards
 * @author Mathieu Bour
 * @notice Gameplay contract that allows to claim rewards native, $POK tokens and Pookyball PX rewards.
 * @dev Only authorized REWARDER-role can sign the rewards payload.
 */
contract Rewards is AccessControl {
  using ECDSA for bytes32;

  // Roles
  bytes32 public constant REWARDER = keccak256("REWARDER");

  // Contracts
  IPookyball public pookyball;
  IPOK public pok;

  /// To prevent users to use the same signature multiple times, a incrementing nonce is required.
  mapping(address => uint256) public nonces;

  /// Fired when rewards are claimed.
  event RewardsClaimed(address indexed account, RewardsData rewards, string data);

  /// Thrown when an account submits an invalid signature.
  error InvalidSignature();
  /// Thrown when the reward contract does not own enough native currency.
  error InsufficientBalance(uint256 expected, uint256 actual);
  /// Thrown when the native transfer has failed.
  error TransferFailed(address recipient, uint256 amount);

  constructor(IPOK _pok, IPookyball _pookyball) {
    pok = _pok;
    pookyball = _pookyball;
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
  }

  /**
   * @notice Receive funds that will be used for native token reward.
   */
  receive() external payable {}

  /**
   * @notice Claim rewards using a signature generated from the Pooky game back-end.
   * Rewards include: native currency, $POK tokens and PXP for the Pookyball tokens.
   * @dev Requirements:
   * - signature is valid
   * - tokenIds and tokenPXP have the same size
   * - contract has enough native currency to reward player
   */
  function claim(RewardsData memory rewards, bytes memory signature, string memory data) external {
    // Generate the signed message from the sender, rewards and nonce
    bytes32 hash = keccak256(abi.encode(msg.sender, rewards, nonces[msg.sender] + 1, data)).toEthSignedMessageHash();

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

    // Mint Pookyballs
    if (rewards.mints.length > 0) {
      // Build the arrays for the batched mint
      address[] memory recipients = new address[](rewards.mints.length);
      PookyballRarity[] memory rarities = new PookyballRarity[](rewards.mints.length);
      uint256[] memory luxuries = new uint256[](rewards.mints.length);

      for (uint256 i = 0; i < rarities.length; i++) {
        recipients[i] = msg.sender;
        rarities[i] = rewards.mints[i].rarity;
        luxuries[i] = rewards.mints[i].luxury;
      }

      pookyball.mint(recipients, rarities, luxuries);
    }

    // Transfer native currency
    if (rewards.amountNAT > 0) {
      // Ensure that the contract has enough tokens to deliver
      if (address(this).balance < rewards.amountNAT) {
        revert InsufficientBalance(rewards.amountNAT, address(this).balance);
      }

      (bool sent, ) = address(msg.sender).call{ value: rewards.amountNAT }("");
      if (!sent) {
        revert TransferFailed(msg.sender, rewards.amountNAT);
      }
    }

    emit RewardsClaimed(msg.sender, rewards, data);
    nonces[msg.sender]++;
  }
}
