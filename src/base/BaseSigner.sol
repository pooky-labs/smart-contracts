// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import { OwnableRoles } from "solady/auth/OwnableRoles.sol";
import { ECDSA } from "solady/utils/ECDSA.sol";

abstract contract BaseSigner is OwnableRoles {
  using ECDSA for bytes32;

  uint256 public constant SIGNER = _ROLE_42;

  /// Thrown when the signature is invalid.
  error InvalidSignature();

  constructor(address signer) {
    _grantRoles(signer, SIGNER);
  }

  function verify(bytes memory data, bytes calldata proof) internal view {
    // Generate the signed message from the tokenId and currentPXP
    bytes32 hash = keccak256(data).toEthSignedMessageHash();

    if (!hasAllRoles(hash.recoverCalldata(proof), SIGNER)) {
      revert InvalidSignature();
    }
  }

  modifier onlyVerify(bytes memory data, bytes calldata proof) {
    verify(data, proof);
    _;
  }
}
