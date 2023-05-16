// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Test } from "forge-std/Test.sol";
import { NonceRegistry } from "../../src/game/NonceRegistry.sol";
import { Strings } from "openzeppelin/utils/Strings.sol";

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

  function test_setBatch_revertIfNonOperator(bytes32 nonce1, bytes32 nonce2, bytes32 nonce3) public {
    assertFalse(registry.has(nonce1));
    assertFalse(registry.has(nonce2));
    assertFalse(registry.has(nonce3));

    bytes32[] memory nonces = new bytes32[](3);
    nonces[0] = nonce1;
    nonces[1] = nonce2;
    nonces[2] = nonce3;

    bool[] memory values = new bool[](3);
    values[0] = true;
    values[1] = true;
    values[2] = true;

    vm.expectRevert(
      abi.encodePacked(
        "AccessControl: account ",
        Strings.toHexString(user),
        " is missing role ",
        Strings.toHexString(uint256(registry.OPERATOR()), 32)
      )
    );
    vm.prank(user);
    registry.setBatch(nonces, values);

    assertFalse(registry.has(nonce1));
    assertFalse(registry.has(nonce2));
    assertFalse(registry.has(nonce3));
  }

  function test_setBatch_allowOperators(bytes32 nonce1, bytes32 nonce2, bytes32 nonce3) public {
    assertFalse(registry.has(nonce1));
    assertFalse(registry.has(nonce2));
    assertFalse(registry.has(nonce3));

    bytes32[] memory nonces = new bytes32[](3);
    nonces[0] = nonce1;
    nonces[1] = nonce2;
    nonces[2] = nonce3;

    bool[] memory values = new bool[](3);
    values[0] = true;
    values[1] = true;
    values[2] = true;

    vm.prank(operator);
    registry.setBatch(nonces, values);

    assertTrue(registry.has(nonce1));
    assertTrue(registry.has(nonce2));
    assertTrue(registry.has(nonce3));
  }
}