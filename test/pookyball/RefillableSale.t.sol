// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { BaseTest } from "@test/BaseTest.sol";
import { PookyballRarity } from "@/pookyball/IPookyball.sol";
import { Pookyball } from "@/pookyball/Pookyball.sol";
import { RefillableSale, Item, Refill } from "@/pookyball/RefillableSale.sol";
import { PookyballSetup } from "@test/setup/PookyballSetup.sol";
import { InvalidReceiver } from "@test/utils/InvalidReceiver.sol";

contract RefillableSaleTest is BaseTest, PookyballSetup {
  RefillableSale public sale;
  Refill[] public defaultRefills;

  address public treasury = makeAddr("treasury");
  address public admin = makeAddr("admin");
  address public seller = makeAddr("seller");
  address public user = makeAddr("user");

  event Sale(
    address indexed account, PookyballRarity indexed rarity, uint256 quantity, uint256 value
  );

  function setUp() public {
    defaultRefills.push(Refill(PookyballRarity.COMMON, 77, 20 ether));
    defaultRefills.push(Refill(PookyballRarity.RARE, 18, 80 ether));
    defaultRefills.push(Refill(PookyballRarity.EPIC, 4, 320 ether));
    defaultRefills.push(Refill(PookyballRarity.LEGENDARY, 1, 1280 ether));

    address[] memory sellers = new address[](1);
    sellers[0] = seller;
    sale = new RefillableSale(pookyball, treasury, admin, sellers);

    vm.startPrank(admin);
    pookyball.grantRole(pookyball.MINTER(), address(sale));
    vm.stopPrank();

    vm.prank(seller);
    sale.restock(defaultRefills, 1);
  }

  function test_permissions() public {
    assertTrue(sale.hasRole(sale.DEFAULT_ADMIN_ROLE(), admin));
    assertTrue(sale.hasRole(sale.SELLER(), seller));
  }

  function test_getTemplates() public {
    Item[] memory templates = sale.getTemplates();
    assertEq(templates.length, defaultRefills.length);
  }

  function test_isClosed_closedUntilIsZero() public {
    vm.prank(seller);
    sale.restock(defaultRefills, 0);
    assertTrue(sale.isClosed());
  }

  function testFuzz_isClosed_closedInTheFuture(uint256 future) public {
    vm.assume(future > block.timestamp);
    vm.prank(seller);
    sale.restock(defaultRefills, future);
    assertTrue(sale.isClosed());
  }

  function testFuzz_eligible_saleIsClosed(uint256 future) public {
    vm.assume(future > block.timestamp);
    vm.prank(seller);
    sale.restock(defaultRefills, future);

    for (uint256 i = 0; i < defaultRefills.length; i++) {
      assertEq(sale.eligible(defaultRefills[i].rarity, 1), "sale is closed");
    }
  }

  function testFuzz_eligible_insufficientRemainingSupply(uint256 quantity) public {
    vm.assume(0 < quantity && quantity < 100);

    vm.prank(seller);
    Refill[] memory refills = new Refill[](1);
    refills[0] = Refill(PookyballRarity.COMMON, quantity, 20 ether);
    sale.restock(refills, 1);

    vm.prank(user);
    assertEq(sale.eligible(PookyballRarity.COMMON, quantity), "");
    assertEq(sale.eligible(PookyballRarity.COMMON, quantity + 1), "insufficient supply");
  }

  function test_eligible_InsufficientRemainingSupply() public {
    vm.prank(user);
    assertEq(sale.eligible(PookyballRarity.COMMON, 1), "");
  }

  function test_mint_revertIfClosed(uint256 closedUntil) public {
    vm.assume(closedUntil > block.timestamp);

    vm.prank(seller);
    sale.restock(defaultRefills, closedUntil);

    (,,, uint256 price) = sale.items(PookyballRarity.COMMON);

    vm.expectRevert(abi.encodePacked(RefillableSale.Closed.selector, closedUntil));
    hoax(user, price);
    sale.mint{ value: price }(PookyballRarity.COMMON, user, 1);
  }

  function testFuzz_mint_revertInsufficientSupply(
    uint256 closedUntil,
    uint256 now_,
    uint256 supply,
    uint8 raritySeed
  ) public {
    now_ = bound(now_, 946684800, 32503680000); // between 01-01-2000 and 01-01-3000
    supply = bound(supply, 1, 1000);
    PookyballRarity rarity =
      randomPookyballRarity(raritySeed, PookyballRarity.COMMON, PookyballRarity.LEGENDARY);

    vm.assume(0 < closedUntil);
    vm.assume(closedUntil < now_);

    vm.warp(now_);

    defaultRefills[uint8(rarity)].quantity = supply;

    vm.prank(seller);
    sale.restock(defaultRefills, now_);

    (,,, uint256 price) = sale.items(rarity);
    uint256 value = (supply + 1) * price;

    vm.expectRevert(
      abi.encodePacked(RefillableSale.InsufficientSupply.selector, uint256(rarity), supply)
    );
    hoax(user, value);
    sale.mint{ value: value }(rarity, user, supply + 1);
  }

  function testFuzz_mint_revertInsufficientValue(uint8 raritySeed, uint256 quantity, uint256 delta)
    public
  {
    PookyballRarity rarity =
      randomPookyballRarity(raritySeed, PookyballRarity.COMMON, PookyballRarity.LEGENDARY);
    (uint256 supply,,, uint256 price) = sale.items(rarity);
    quantity = bound(quantity, 1, supply);
    uint256 expectedValue = quantity * price;
    delta = bound(delta, 1, expectedValue);
    uint256 actualValue = expectedValue - delta;

    vm.expectRevert(
      abi.encodeWithSelector(RefillableSale.InsufficientValue.selector, expectedValue, actualValue)
    );
    hoax(user, expectedValue);
    sale.mint{ value: actualValue }(rarity, user, quantity);
  }

  function testFuzz_mint_revertTransferFailed(uint8 raritySeed, uint256 quantity) public {
    InvalidReceiver receiver = new InvalidReceiver();
    address[] memory sellers = new address[](1);
    sellers[0] = seller;
    sale = new RefillableSale(pookyball, address(receiver), admin, sellers);

    vm.startPrank(admin);
    pookyball.grantRole(pookyball.MINTER(), address(sale));
    vm.stopPrank();

    vm.prank(seller);
    sale.restock(defaultRefills, 1);

    PookyballRarity rarity =
      randomPookyballRarity(raritySeed, PookyballRarity.COMMON, PookyballRarity.LEGENDARY);
    (uint256 supply,,, uint256 price) = sale.items(rarity);
    quantity = bound(quantity, 1, supply);
    uint256 value = quantity * price;

    vm.expectRevert(abi.encodeWithSelector(RefillableSale.TransferFailed.selector, receiver, value));
    hoax(user, value);
    sale.mint{ value: value }(rarity, user, quantity);
  }

  function testFuzz_mint_pass(uint8 raritySeed, uint256 quantity) public {
    PookyballRarity rarity =
      randomPookyballRarity(raritySeed, PookyballRarity.COMMON, PookyballRarity.LEGENDARY);
    (uint256 supply,,, uint256 price) = sale.items(rarity);
    quantity = bound(quantity, 1, supply);
    uint256 value = quantity * price;

    vm.expectEmit(true, true, true, true, address(sale));
    emit Sale(user, rarity, quantity, value);

    hoax(user, value);
    sale.mint{ value: value }(rarity, user, quantity);
  }
}
