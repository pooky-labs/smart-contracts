// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Ownable } from "solady/auth/Ownable.sol";
import { IBaseTreasury } from "../../src/interfaces/IBaseTreasury.sol";
import { StickersSale, Bundle, BundleContent, Refill } from "../../src/mint/StickersSale.sol";
import { StickersSetup } from "../setup/StickersSetup.sol";
import { InvalidReceiver } from "../utils/InvalidReceiver.sol";
import { BaseTest } from "../BaseTest.sol";

contract StickersSaleTest is BaseTest, StickersSetup {
  address admin = makeAddr("admin");
  address seller = makeAddr("seller");
  address user = makeAddr("user");
  address treasury = makeAddr("treasury");

  uint256 date = 1641070800;

  StickersSale sale;

  Bundle[] defaultBundles;
  Refill[] defaultRefills;

  function setUp() public {
    // Default refills
    defaultRefills.push(Refill(0, 8 ether, 45));
    defaultRefills.push(Refill(1, 28 ether, 40));
    defaultRefills.push(Refill(2, 112 ether, 12));
    defaultRefills.push(Refill(3, 416 ether, 3));

    // Default bundles
    defaultBundles.push(Bundle(8 ether, 45, 0, 45, BundleContent(2, 0, 0, 0)));
    defaultBundles.push(Bundle(28 ether, 40, 0, 40, BundleContent(3, 1, 0, 0)));
    defaultBundles.push(Bundle(112 ether, 12, 0, 12, BundleContent(8, 1, 1, 0)));
    defaultBundles.push(Bundle(416 ether, 3, 0, 3, BundleContent(15, 3, 1, 1)));

    for (uint256 i; i < defaultBundles.length; i++) {
      defaultRefills.push(Refill(i, defaultBundles[i].price, defaultBundles[i].supply));
    }

    sale = new StickersSale(stickers, admin, treasury, defaultBundles);

    vm.startPrank(sale.owner());
    sale.grantRoles(seller, sale.SELLER());
    vm.startPrank(stickers.owner());
    stickers.grantRoles(address(sale), stickers.MINTER());
    vm.stopPrank();

    vm.deal(user, 1000000 ether);

    vm.warp(date);
    vm.prank(seller);
    sale.restock(defaultRefills, 1);
  }

  function test_getBundles() public {
    Bundle[] memory bundles = sale.getBundles();
    assertEq(bundles.length, 4);
    assertEq(bundles[0].price, 8 ether);
    assertEq(bundles[3].price, 416 ether);
  }

  function test_isClosed_zero() public {
    vm.prank(seller);
    sale.restock(defaultRefills, 0); // zero means closed
    assertTrue(sale.isClosed());
  }

  function test_isClosed_future() public {
    vm.warp(date);

    vm.prank(seller);
    sale.restock(defaultRefills, date + 1); // closeUntil greater than date => sale is closed
    assertTrue(sale.isClosed());
  }

  function test_create_revertOnlyOwner() public {
    assertEq(sale.getBundles().length, defaultBundles.length);

    vm.prank(user);
    vm.expectRevert(Ownable.Unauthorized.selector);
    sale.create(defaultBundles[0]);
  }

  function test_create() public {
    assertEq(sale.getBundles().length, defaultBundles.length);

    vm.prank(admin);
    sale.create(defaultBundles[0]);
    assertEq(sale.getBundles().length, defaultBundles.length + 1);
  }

  function test_purchase_revertClose() public {
    vm.prank(seller);
    sale.restock(defaultRefills, 0); // zero means closed
    assertTrue(sale.isClosed());

    uint256 bundleId = 0;
    Bundle memory bundle = sale.getBundles()[bundleId];
    vm.prank(user);
    vm.expectRevert(abi.encodeWithSelector(StickersSale.Closed.selector, 0));
    sale.purchase{ value: bundle.price }(bundleId);
  }

  function test_purchase_revertInvalidBundle() public {
    uint256 bundleId = sale.getBundles().length;
    vm.prank(user);
    vm.expectRevert(StickersSale.InvalidBundle.selector);
    sale.purchase(bundleId);
  }

  function test_purchase_revertInsufficientSupply() public {
    vm.warp(date);

    uint256 bundleId = 0;
    Refill[] memory faultyRefills = new Refill[](1);
    faultyRefills[0] = Refill(bundleId, defaultBundles[0].price, 0);

    vm.prank(seller);
    sale.restock(faultyRefills, 1);
    assertFalse(sale.isClosed());

    Bundle memory bundle = sale.getBundles()[bundleId];
    vm.prank(user);
    vm.expectRevert(abi.encodeWithSelector(StickersSale.InsufficientSupply.selector, bundleId));
    sale.purchase{ value: bundle.price }(bundleId);
  }

  function test_purchase_revertInsufficientValue() public {
    uint256 bundleId = 0;
    Bundle memory bundle = sale.getBundles()[bundleId];
    vm.prank(user);
    uint256 value = bundle.price - 1;
    vm.expectRevert(
      abi.encodeWithSelector(IBaseTreasury.InsufficientValue.selector, value, bundle.price)
    );
    sale.purchase{ value: value }(bundleId);
  }

  function test_purchase_revertTransferFailed() public {
    InvalidReceiver invalid = new InvalidReceiver();
    vm.prank(admin);
    sale.changeTreasury(address(invalid));

    uint256 bundleId = 0;
    Bundle memory bundle = sale.getBundles()[bundleId];

    vm.prank(user);
    vm.expectRevert(
      abi.encodeWithSelector(IBaseTreasury.TransferFailed.selector, address(invalid), bundle.price)
    );
    sale.purchase{ value: bundle.price }(bundleId);
  }

  function test_purchase_pass_legend() public {
    uint256 bundleId = 3; // legend pack with all sticker rarities
    Bundle memory bundle = sale.getBundles()[bundleId];

    uint256 stickersBefore = stickers.balanceOf(user);
    uint256 quantity =
      bundle.content.common + bundle.content.rare + bundle.content.epic + bundle.content.legendary;
    uint256 expectedBalance = stickersBefore + quantity;

    vm.prank(user);
    sale.purchase{ value: bundle.price }(bundleId);
    assertEq(stickers.balanceOf(user), expectedBalance);
  }
}
