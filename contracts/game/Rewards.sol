// SPDX-License-Identifier: MIT
// Pooky Game Contracts (game/Rewards.sol)
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "../interfaces/IPookyball.sol";
import "../interfaces/IPOK.sol";
import "../types/PookyballMetadata.sol";

contract Rewards is AccessControl {
  using ECDSA for bytes32;

  // Roles
  bytes32 public constant REWARDER = keccak256("REWARDER");

  // Contracts
  IPookyball public pookyball;
  IPOK public pok;

  mapping(address => uint256) public nonces;

  event POKClaimed(address indexed account, uint256 amountPOK);
  event PookyballPXPClaimed(address indexed account, uint indexed tokenId, uint pxp);
  event NativeClaimed(address indexed account, uint256 amountNative);

  /// Thrown when an account submits an invalid signature.
  error InvalidSignature();
  /// Thrown when the length of two parameters mismatch. Used in batched functions.
  error ArgumentSizeMismatch(uint256 x, uint256 y);
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
   * - Signature is valid
   * - tokenIds and tokenPXP have the same size
   * - contract has enough native currency to reward player
   */
  function claim(
    uint256 amountNative,
    uint256 amountPOK,
    uint256[] calldata tokenIds,
    uint256[] calldata tokenPXP,
    bytes memory signature
  ) external {
    bytes32 hash = keccak256(
      abi.encodePacked(msg.sender, amountNative, amountPOK, tokenIds, tokenPXP, nonces[msg.sender] + 1)
    ).toEthSignedMessageHash();

    if (!hasRole(REWARDER, hash.recover(signature))) {
      revert InvalidSignature();
    }

    if (tokenIds.length != tokenPXP.length) {
      revert ArgumentSizeMismatch(tokenIds.length, tokenPXP.length);
    }

    // Ensure that the contract has enough tokens to deliver
    if (address(this).balance < amountNative) {
      revert InsufficientBalance(amountNative, address(this).balance);
    }

    // Mint $POK token
    if (amountPOK > 0) {
      pok.mint(msg.sender, amountPOK);
      emit POKClaimed(msg.sender, amountNative);
    }

    // Increase Pookyballs PXP
    for (uint256 i = 0; i < tokenIds.length; i++) {
      PookyballMetadata memory metadata = pookyball.metadata(tokenIds[i]);
      pookyball.setPXP(tokenIds[i], metadata.pxp + tokenPXP[i]);
      emit PookyballPXPClaimed(msg.sender, tokenIds[i], tokenPXP[i]);
    }

    // Transfer native currency
    if (amountNative > 0) {
      (bool sent, ) = address(msg.sender).call{ value: amountNative }("");
      if (!sent) {
        revert TransferFailed(msg.sender, amountNative);
      }
      emit NativeClaimed(msg.sender, amountNative);
    }

    nonces[msg.sender]++;
  }
}
