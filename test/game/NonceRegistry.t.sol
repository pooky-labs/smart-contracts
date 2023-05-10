// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Test } from "forge-std/Test.sol";
import { NonceRegistry } from "../../src/game/NonceRegistry.sol";

contract NonceRegistryTest is Test {
  address admin = makeAddr("admin");
  address operator = makeAddr("operator");
  address user = makeAddr("user");

  NonceRegistry registry;

  function setUp() public {
    address[] memory admins = new address[](1);
    admins[0] = admin;
    address[] memory operators = new address[](1);
    operators[0] = operator;
    registry = new NonceRegistry(admins, operators);
  }

  function test_contructor() public {
    assertTrue(registry.hasRole(registry.DEFAULT_ADMIN_ROLE(), admin));
    assertTrue(registry.hasRole(registry.OPERATOR(), operator));
  }

  function test_set_revertIfNonOperator(bytes32 nonce) public {
    vm.expectRevert();
    vm.prank(user);
    registry.set(nonce, true);
  }

  function test_set_allowOperators(bytes32 nonce) public {
    assertFalse(registry.has(nonce));
    vm.prank(operator);
    registry.set(nonce, true);
    assertTrue(registry.has(nonce));
  }
}
