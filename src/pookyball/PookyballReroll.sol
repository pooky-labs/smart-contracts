// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { OwnableRoles } from "solady/auth/OwnableRoles.sol";
import { INonceRegistry } from "@/common/INonceRegistry.sol";
import { Signer } from "@/common/Signer.sol";
import { Treasury } from "@/common/Treasury.sol";
import { IPookyball } from "@/pookyball/IPookyball.sol";

/// @title PookyballReroll
/// @author Mathieu Bour for Pooky Labs Ltd.
/// Allow player to reroll their Pookyball attributes.
contract PookyballReroll is OwnableRoles, Signer, Treasury {
  /// Fired when a Pookyball stats have been rerolled.
  event Reroll(uint256 indexed tokenId, uint256 price);

  /// Thrown when user attempts to use a nonce that was already used in the past.
  error NonceAlreadyUsed(bytes32 nonce);
  /// Thrown when user attempts to reroll a Pookyball he does not own.
  error OwnershipRequired(uint256 tokenId);

  /// The Pookyball contract.
  IPookyball public immutable pookyball;
  /// The NonceRegistry contract.
  INonceRegistry public immutable nonces;

  constructor(
    IPookyball _pookyball,
    INonceRegistry _nonces,
    address admin,
    address _signer,
    address _treasury
  ) Signer(_signer) Treasury(_treasury) {
    _initializeOwner(admin);
    pookyball = _pookyball;
    nonces = _nonces;
  }

  /// @notice Reroll the attributes of an existing Pookyball.
  /// @dev Pricing is controlled by the backend, which need to provide a proof to the end user.
  /// @param tokenId The Pookyball token id to reroll.
  /// @param price The price in native currency, provided by the Pooky back-end.
  /// @param nonce The nonce, provided by the Pooky back-end.
  /// @param proof The signature of `abi.encode(tokenId, price, nonce, address(this))`.
  function reroll(uint256 tokenId, uint256 price, bytes32 nonce, bytes calldata proof)
    external
    payable
    onlyVerify(abi.encode(tokenId, price, nonce, address(this)), proof)
    forwarder
  {
    if (nonces.has(nonce)) {
      revert NonceAlreadyUsed(nonce);
    }
    nonces.set(nonce, true);

    if (pookyball.ownerOf(tokenId) != msg.sender) {
      revert OwnershipRequired(tokenId);
    }

    if (msg.value < price) {
      revert InsufficientValue(price, msg.value);
    }

    emit Reroll(tokenId, price);
  }
}
