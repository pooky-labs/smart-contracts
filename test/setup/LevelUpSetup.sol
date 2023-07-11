// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ECDSA } from "openzeppelin/utils/cryptography/ECDSA.sol";
import { BaseTest } from "../BaseTest.sol";
import { POKSetup } from "./POKSetup.sol";

struct SlotData {
  uint256 expected;
  uint256 level;
}

abstract contract LevelUpSetup is BaseTest, POKSetup {
  using ECDSA for bytes32;

  address internal signer;
  uint256 internal privateKey;

  constructor() {
    (signer, privateKey) = makeAddrAndKey("signer");
  }

  /**
   * Sign the tokenId and the currentPXP for a level up.
   */
  function sign(uint256 tokenId, uint256 currentPXP) internal view returns (bytes memory) {
    bytes32 hash = keccak256(abi.encode(tokenId, currentPXP)).toEthSignedMessageHash();
    (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKey, hash);
    return abi.encodePacked(r, s, v);
  }
}
