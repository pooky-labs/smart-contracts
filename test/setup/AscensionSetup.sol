// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { ECDSA } from "solady/utils/ECDSA.sol";
import { BaseTest } from "@test/BaseTest.sol";

abstract contract AscensionSetup is BaseTest {
  using ECDSA for bytes32;

  address internal signer;
  uint256 internal privateKey;

  constructor() {
    (signer, privateKey) = makeAddrAndKey("signer");
  }

  /// Sign the parameters for ascension.
  function sign(uint256 left, uint256 right, uint256 priceNAT) internal view returns (bytes memory) {
    bytes32 hash = keccak256(abi.encode(left, right, priceNAT)).toEthSignedMessageHash();
    (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKey, hash);
    return abi.encodePacked(r, s, v);
  }
}
