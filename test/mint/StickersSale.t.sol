// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Ownable } from "solady/auth/Ownable.sol";
import { StickersSale, Bundle, BundleContent, Refill } from "../../src/mint/StickersSale.sol";
import { StickersSetup } from "../setup/StickersSetup.sol";
import { BaseTest } from "../BaseTest.sol";

contract StickersSaleTest is BaseTest, StickersSetup {
  address admin = makeAddr("admin");
  address seller = makeAddr("seller");
  address user = makeAddr("user");
  address treasury = makeAddr("treasury");

  StickersSale sale;

  Bundle[] defaultBundles;
  Refill[] defaultRefills;

  function setUp() public {
    // Default bundles
    defaultBundles.push(Bundle(8 ether, 45, 0, 45, BundleContent(2, 0, 0, 0)));
    defaultBundles.push(Bundle(28 ether, 40, 0, 40, BundleContent(3, 1, 0, 0)));
    defaultBundles.push(Bundle(112 ether, 12, 0, 12, BundleContent(8, 1, 1, 0)));
    defaultBundles.push(Bundle(416 ether, 3, 0, 3, BundleContent(15, 3, 1, 1)));

    for (uint256 i; i < defaultBundles.length; i++) {
      defaultRefills.push(Refill(i, defaultBundles[i].price, defaultBundles[i].supply));
    }

    sale = new StickersSale(stickers, admin, treasury, defaultBundles);
  }

  function test_getBundles() public {
    Bundle[] memory bundles = sale.getBundles();
    assertEq(bundles.length, 4);
    assertEq(bundles[0].price, 8 ether);
    assertEq(bundles[3].price, 416 ether);
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
}
