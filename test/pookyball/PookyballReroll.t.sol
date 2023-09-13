// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { Ownable } from "solady/auth/Ownable.sol";
import { ECDSA } from "solady/utils/ECDSA.sol";
import { BaseTest } from "@test/BaseTest.sol";
import { ITreasury } from "@/common/ITreasury.sol";
import { Signer } from "@/common/Signer.sol";
import { PookyballReroll } from "@/pookyball/PookyballReroll.sol";

contract PookyballRerollTest is BaseTest {
  using ECDSA for bytes32;

  /// Fired when a Pookyball stats have been rerolled.
  event Reroll(uint256 indexed tokenId, uint256 price);

  address admin = makeAddr("admin");
  address treasury = makeAddr("treasury");
  address signer;
  uint256 privateKey;
  address user = makeAddr("user");

  PookyballReroll reroll;

  function setUp() public {
    (signer, privateKey) = makeAddrAndKey("signer");
    reroll = new PookyballReroll(admin, signer, treasury);
  }

  /// Sign the tokenId and the price for a reroll.
  function sign(uint256 tokenId, uint256 price, address target)
    internal
    view
    returns (bytes memory)
  {
    bytes32 hash = keccak256(abi.encode(tokenId, price, target)).toEthSignedMessageHash();
    (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKey, hash);
    return abi.encodePacked(r, s, v);
  }

  function test_reroll_revertInsufficientValue() public {
    uint256 tokenId = 42;
    uint256 price = 50 ether;
    uint256 value = price - 1;
    uint256 balanceBefore = treasury.balance;

    hoax(user, price);
    vm.expectRevert(abi.encodeWithSelector(ITreasury.InsufficientValue.selector, price, value));
    reroll.reroll{ value: value }(tokenId, price, sign(tokenId, price, address(reroll)));

    assertEq(treasury.balance, balanceBefore);
  }

  function test_reroll_revertInvalidSignature() public {
    uint256 tokenId = 42;
    uint256 price = 50 ether;
    uint256 value = price - 1;
    uint256 balanceBefore = treasury.balance;

    hoax(user, price);
    vm.expectRevert(Signer.InvalidSignature.selector);
    reroll.reroll{ value: value }(tokenId, value, sign(tokenId, price, address(reroll)));

    assertEq(treasury.balance, balanceBefore);
  }

  function test_reroll_pass() public {
    uint256 tokenId = 42;
    uint256 price = 50 ether;
    uint256 balanceBefore = treasury.balance;

    hoax(user, price);
    vm.expectEmit(address(reroll));
    emit Reroll(tokenId, price);

    reroll.reroll{ value: price }(tokenId, price, sign(tokenId, price, address(reroll)));

    assertEq(treasury.balance, balanceBefore + price);
  }
}
