// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { Ownable } from "solady/auth/Ownable.sol";
import { Base64 } from "solady/utils/Base64.sol";
import { LibString } from "solady/utils/LibString.sol";
import { Energy } from "@/common/Energy.sol";
import { ITreasury } from "@/common/ITreasury.sol";
import { BaseTest } from "@test/BaseTest.sol";

struct Attribute {
  string trait_type;
  uint256 value;
}

struct Metadata {
  Attribute[] attributes;
  string description;
  string name;
}

contract EnergyTest is BaseTest {
  using LibString for uint256;

  address admin = makeAddr("admin");
  address operator = makeAddr("operator");
  address treasury = makeAddr("treasury");
  address player = makeAddr("player");

  uint256 defaultPricing = 5.15 ether;

  Energy energy;

  function setUp() public {
    vm.startPrank(admin);
    address[] memory operators = new address[](1);
    operators[0] = operator;
    energy = new Energy(admin, operators, treasury, defaultPricing);
    vm.stopPrank();
  }

  function test_setPricing_revertUnauthorized() public {
    vm.prank(player);
    vm.expectRevert(Ownable.Unauthorized.selector);
    energy.setPricing(1);
  }

  function test_setPricing_operator_pass() public {
    uint256 newPricing = 7 ether;

    assertEq(energy.pricing(), defaultPricing);
    vm.prank(operator);
    energy.setPricing(newPricing);
    assertEq(energy.pricing(), newPricing);
  }

  function test_setPricing_owner_pass() public {
    uint256 newPricing = 7 ether;

    assertEq(energy.pricing(), defaultPricing);
    vm.prank(admin);
    energy.setPricing(newPricing);
    assertEq(energy.pricing(), newPricing);
  }

  function trim(string calldata str, uint256 start) external pure returns (string memory) {
    return str[start:];
  }

  function test_tokenURI_pass() public {
    uint256 quantity = 20;
    uint256 tokenId = energy.mint{ value: quantity * energy.pricing() }(quantity, player);
    string memory tokenIdStr = tokenId.toString();

    string memory data64 =
      LibString.replace(energy.tokenURI(tokenId), "data:application/json;base64,", "");
    string memory decoded = string(Base64.decode(data64));

    (Metadata memory metadata) = abi.decode(vm.parseJson(decoded), (Metadata));

    assertEq(metadata.name, string(abi.encodePacked("Voucher #", tokenIdStr)));
    assertEq(
      metadata.description,
      string(abi.encodePacked("Voucher granting ", quantity.toString(), " Energy on Pooky.gg"))
    );
    assertEq(metadata.attributes.length, 1);
    assertEq(metadata.attributes[0].trait_type, "Value");
    assertEq(metadata.attributes[0].value, quantity);
  }

  function test_mint_revertInsufficientValue() public {
    uint256 quantity = 30;
    uint256 expectedValue = quantity * energy.pricing();
    uint256 actualValue = expectedValue - 1;

    vm.expectRevert(
      abi.encodeWithSelector(ITreasury.InsufficientValue.selector, expectedValue, actualValue)
    );
    hoax(player, expectedValue);
    energy.mint{ value: actualValue }(quantity, player);
  }

  function test_mint_pass() public {
    uint256 quantity = 25;
    uint256 value = quantity * energy.pricing();

    hoax(player, value);
    uint256 tokenId = energy.mint{ value: value }(quantity, player);

    assertEq(energy.values(tokenId), quantity);
  }
}
