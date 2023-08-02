// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { BaseTest } from "@test/BaseTest.sol";
import { Strings } from "openzeppelin/utils/Strings.sol";

/// @title AccessControlAssertions
/// Utility contract to test OpenZeppelin AccessControl contracts.
contract AccessControlAssertions is BaseTest {
  function expectRevertMissingRole(address account, bytes32 role) public {
    vm.expectRevert(
      abi.encodePacked(
        "AccessControl: account ",
        Strings.toHexString(account),
        " is missing role ",
        Strings.toHexString(uint256(role), 32)
      )
    );
  }
}
