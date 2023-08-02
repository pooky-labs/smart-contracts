// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { OwnableRoles } from "solady/auth/OwnableRoles.sol";
import { ECDSA } from "solady/utils/ECDSA.sol";

/// @title Signer
/// @author Mathieu Bour for Pooky Labs Ltd.
///
/// @dev Provide the `verify` function and the `onlyVerify` modifier to child contracts.
abstract contract Signer is OwnableRoles {
  using ECDSA for bytes32;

  uint256 public constant SIGNER = _ROLE_42;

  /// Thrown when the signature is invalid.
  error InvalidSignature();

  constructor(address signer) {
    _grantRoles(signer, SIGNER);
  }

  /// @notice Ensure that `data` has been signed by a `SIGNER` using the `proof`.
  function verify(bytes memory data, bytes calldata proof) internal view {
    // Generate the signed message from the tokenId and currentPXP
    bytes32 hash = keccak256(data).toEthSignedMessageHash();

    if (!hasAllRoles(hash.recoverCalldata(proof), SIGNER)) {
      revert InvalidSignature();
    }
  }

  /// @notice Modifier version of the `verify` function.
  modifier onlyVerify(bytes memory data, bytes calldata proof) {
    verify(data, proof);
    _;
  }
}
