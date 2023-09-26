// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { OwnableRoles } from "solady/auth/OwnableRoles.sol";
import { INonceRegistry } from "@/common/INonceRegistry.sol";
import { Signer } from "@/common/Signer.sol";
import { Treasury } from "@/common/Treasury.sol";
import { PookyballRarity, IPookyball } from "@/pookyball/IPookyball.sol";

struct Boost {
  /// The Pookyball rarity.
  PookyballRarity rarity;
  /// The number of boosted predictions.
  uint256 predictions;
  /// The boost value.
  uint256 value;
}

/// @title BoostPXP
/// @author Mathieu Bour for Pooky Labs Ltd.
/// Allow player to purchase temporary PXP boosts for their Pookyball.
contract BoostPXP is OwnableRoles, Signer, Treasury {
  /// Fired when a boost has been purchased.
  /// @param account The account who purchased the boost.
  /// @param details The boost details.
  /// @param price The amount in native currency paid for the boost.
  event Boosted(address indexed account, Boost details, uint256 price);

  /// Thrown when user attempts to use a nonce that was already used in the past.
  error NonceAlreadyUsed(bytes32 nonce);

  /// The NonceRegistry contract.
  INonceRegistry public immutable nonces;

  constructor(INonceRegistry _nonces, address admin, address _signer, address _treasury)
    Signer(_signer)
    Treasury(_treasury)
  {
    _initializeOwner(admin);
    nonces = _nonces;
  }

  /// @notice Boost the received PXP of a Pookyball.
  /// @dev Pricing is controlled by the backend, which need to provide a proof to the end user.
  /// @param details The Pookyball boost data.
  /// @param price The price in native currency, provided by the Pooky back-end.
  /// @param nonce The nonce, provided by the Pooky back-end.
  /// @param proof The signature of `abi.encode(details, price, nonce, address(this))`.
  function boost(Boost memory details, uint256 price, bytes32 nonce, bytes calldata proof)
    external
    payable
    onlyVerify(abi.encode(details, price, nonce, address(this)), proof)
    forwarder
  {
    if (nonces.has(nonce)) {
      revert NonceAlreadyUsed(nonce);
    }

    nonces.set(nonce, true);

    if (msg.value < price) {
      revert InsufficientValue(price, msg.value);
    }

    emit Boosted(msg.sender, details, price);
  }
}
