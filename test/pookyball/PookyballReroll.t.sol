// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { Ownable } from "solady/auth/Ownable.sol";
import { ECDSA } from "solady/utils/ECDSA.sol";
import { BaseTest } from "@test/BaseTest.sol";
import { PookyballSetup } from "@test/setup/PookyballSetup.sol";
import { ITreasury } from "@/common/ITreasury.sol";
import { Signer } from "@/common/Signer.sol";
import { NonceRegistry } from "@/common/NonceRegistry.sol";
import { PookyballRarity } from "@/pookyball/IPookyball.sol";
import { PookyballReroll } from "@/pookyball/PookyballReroll.sol";

contract PookyballRerollTest is BaseTest, PookyballSetup {
  using ECDSA for bytes32;

  /// Fired when a Pookyball stats have been rerolled.
  event Reroll(uint256 indexed tokenId, uint256 price);

  address admin = makeAddr("admin");
  address treasury = makeAddr("treasury");
  address signer;
  uint256 privateKey;
  address user1 = makeAddr("user1");
  address user2 = makeAddr("user2");

  PookyballReroll reroll;
  NonceRegistry nonces;

  function setUp() public {
    (signer, privateKey) = makeAddrAndKey("signer");

    address[] memory admins = new address[](1);
    admins[0] = admin;
    address[] memory operators = new address[](0);
    nonces = new NonceRegistry(admins, operators);
    reroll = new PookyballReroll(pookyball, nonces, admin, signer, treasury);

    vm.startPrank(admin);
    nonces.grantRole(nonces.OPERATOR(), address(reroll));
    vm.stopPrank();
  }

  /// Sign the tokenId and the price for a reroll.
  function sign(uint256 tokenId, uint256 price, bytes32 nonce, address target)
    internal
    view
    returns (bytes memory)
  {
    bytes32 hash = keccak256(abi.encode(tokenId, price, nonce, target)).toEthSignedMessageHash();
    (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKey, hash);
    return abi.encodePacked(r, s, v);
  }

  function test_reroll_revertOwnershipRequired() public {
    uint256 tokenId = mintPookyball(user1, PookyballRarity.COMMON);
    bytes32 nonce = keccak256("test_reroll_revertOwnershipRequired");
    uint256 price = 50 ether;
    bytes memory signature = sign(tokenId, price, nonce, address(reroll));

    uint256 balanceBefore = treasury.balance;

    hoax(user2, price);
    vm.expectRevert(abi.encodeWithSelector(PookyballReroll.OwnershipRequired.selector, tokenId));
    reroll.reroll{ value: price }(tokenId, price, nonce, signature);

    assertEq(treasury.balance, balanceBefore);
  }

  function test_reroll_revertNonceAlreadyUsed() public {
    uint256 tokenId = mintPookyball(user1, PookyballRarity.COMMON);
    bytes32 nonce = keccak256("test_reroll_revertNonceAlreadyUsed");
    uint256 price = 50 ether;
    bytes memory signature = sign(tokenId, price, nonce, address(reroll));

    // First call: pass
    uint256 balanceBefore = treasury.balance;

    hoax(user1, price);

    vm.expectEmit(address(reroll));
    emit Reroll(tokenId, price);

    reroll.reroll{ value: price }(tokenId, price, nonce, signature);

    assertEq(treasury.balance, balanceBefore + price);

    // Second call: revert
    balanceBefore = treasury.balance;

    hoax(user1, price);

    vm.expectRevert(abi.encodeWithSelector(PookyballReroll.NonceAlreadyUsed.selector, nonce));
    reroll.reroll{ value: price }(tokenId, price, nonce, signature);

    assertEq(treasury.balance, balanceBefore);
  }

  function test_reroll_revertInsufficientValue() public {
    uint256 tokenId = mintPookyball(user1, PookyballRarity.COMMON);
    bytes32 nonce = keccak256("test_reroll_revertInsufficientValue");
    uint256 price = 50 ether;
    bytes memory signature = sign(tokenId, price, nonce, address(reroll));

    uint256 value = price - 1;
    uint256 balanceBefore = treasury.balance;

    hoax(user1, price);
    vm.expectRevert(abi.encodeWithSelector(ITreasury.InsufficientValue.selector, price, value));
    reroll.reroll{ value: value }(tokenId, price, nonce, signature);

    assertEq(treasury.balance, balanceBefore);
  }

  function test_reroll_revertInvalidSignature() public {
    uint256 tokenId = mintPookyball(user1, PookyballRarity.COMMON);
    bytes32 nonce = keccak256("test_reroll_revertInvalidSignature");
    uint256 price = 50 ether;
    bytes memory signature = sign(tokenId, price, nonce, address(reroll));

    uint256 value = price - 1;
    uint256 balanceBefore = treasury.balance;

    hoax(user1, price);
    vm.expectRevert(Signer.InvalidSignature.selector);
    reroll.reroll{ value: value }(tokenId, value, nonce, signature);

    assertEq(treasury.balance, balanceBefore);
  }

  function test_reroll_pass() public {
    uint256 tokenId = mintPookyball(user1, PookyballRarity.COMMON);
    bytes32 nonce = keccak256("test_reroll_pass");
    uint256 price = 50 ether;
    bytes memory signature = sign(tokenId, price, nonce, address(reroll));

    uint256 balanceBefore = treasury.balance;

    hoax(user1, price);

    vm.expectEmit(address(reroll));
    emit Reroll(tokenId, price);

    reroll.reroll{ value: price }(tokenId, price, nonce, signature);

    assertEq(treasury.balance, balanceBefore + price);
  }
}
