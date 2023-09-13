// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { OwnableRoles } from "solady/auth/OwnableRoles.sol";
import { Signer } from "@/common/Signer.sol";
import { Treasury } from "@/common/Treasury.sol";

/// @title PookyballReroll
/// @author Mathieu Bour for Pooky Labs Ltd.
/// Allow player to reroll their Pookyball attributes.
contract PookyballReroll is OwnableRoles, Signer, Treasury {
  /// Fired when a Pookyball stats have been rerolled.
  event Reroll(uint256 indexed tokenId, uint256 price);

  constructor(address admin, address _signer, address _treasury)
    Signer(_signer)
    Treasury(_treasury)
  { }

  /// @notice Reroll the attributes of an existing Pookyball.
  /// @dev Pricing is controlled by the backend, which need to provide a proof to the end user.
  /// @param proof The signature of `abi.encode(tokenId, price, address(this))`.
  function reroll(uint256 tokenId, uint256 price, bytes calldata proof)
    external
    payable
    onlyVerify(abi.encode(tokenId, price, address(this)), proof)
    forwarder
  {
    if (msg.value < price) {
      revert InsufficientValue(price, msg.value);
    }

    emit Reroll(tokenId, price);
  }
}
