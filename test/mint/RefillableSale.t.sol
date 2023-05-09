// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Test } from "forge-std/Test.sol";
import { RefillableSale, Item, Refill } from "../../src/mint/RefillableSale.sol";
import { Pookyball } from "../../src/tokens/Pookyball.sol";
import { PookyballRarity } from "../../src/types/PookyballRarity.sol";
import { PookyballSetup } from "../setup/PookyballSetup.sol";

contract RefillableSaleTest is Test, PookyballSetup {
  RefillableSale sale;
  Refill[] defaultRefills;

  address treasury = makeAddr("treasury");
  address admin = makeAddr("admin");
  address seller = makeAddr("seller");
  address user = makeAddr("user");

  function setUp() public override(PookyballSetup) {
    defaultRefills.push(Refill(PookyballRarity.COMMON, 77, 20 ether));
    defaultRefills.push(Refill(PookyballRarity.RARE, 18, 80 ether));
    defaultRefills.push(Refill(PookyballRarity.EPIC, 4, 320 ether));
    defaultRefills.push(Refill(PookyballRarity.LEGENDARY, 1, 1280 ether));

    address[] memory sellers = new address[](1);
    sellers[0] = seller;
    sale = new RefillableSale(pookyball, treasury, admin, sellers);

    vm.prank(seller);
    sale.restock(defaultRefills, 1);
  }

  function testPermissions() public {
    assertTrue(sale.hasRole(sale.DEFAULT_ADMIN_ROLE(), admin));
    assertTrue(sale.hasRole(sale.SELLER(), seller));
  }

  function testGetTemplates() public {
    Item[] memory templates = sale.getTemplates();
    assertEq(templates.length, defaultRefills.length);
  }

  function testIsClosedClosedUntilIsZero() public {
    vm.prank(seller);
    sale.restock(defaultRefills, 0);
    assertTrue(sale.isClosed());
  }

  function testIsClosedClosedInTheFuture(uint256 future) public {
    vm.assume(future > block.timestamp);
    vm.prank(seller);
    sale.restock(defaultRefills, future);
    assertTrue(sale.isClosed());
  }

  function testEligibleSaleIsClosed(uint256 future) public {
    vm.assume(future > block.timestamp);
    vm.prank(seller);
    sale.restock(defaultRefills, future);

    for (uint256 i = 0; i < defaultRefills.length; i++) {
      assertEq(sale.eligible(defaultRefills[i].rarity, 1), "sale is closed");
    }
  }

  function testEligibleInsufficientRemainingSupply(uint256 quantity) public {
    vm.assume(0 < quantity && quantity < 100);

    vm.prank(seller);
    Refill[] memory refills = new Refill[](1);
    refills[0] = Refill(PookyballRarity.COMMON, quantity, 20 ether);
    sale.restock(refills, 1);

    vm.prank(user);
    assertEq(sale.eligible(PookyballRarity.COMMON, quantity), "");
    assertEq(sale.eligible(PookyballRarity.COMMON, quantity + 1), "insufficient supply");
  }

  function testEligibleInsufficientRemainingSupply() public {
    vm.prank(user);
    assertEq(sale.eligible(PookyballRarity.COMMON, 1), "");
  }
}
