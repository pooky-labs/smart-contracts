// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { StickersSale, Bundle, BundleContent } from "../../src/mint/StickersSale.sol";
import { StickersSetup } from "../setup/StickersSetup.sol";
import { BaseTest } from "../BaseTest.sol";

contract StickersSaleTest is BaseTest, StickersSetup {
  StickersSale sale;
  address admin = makeAddr("admin");
  address treasury = makeAddr("treasury");

  function setUp() public {
    Bundle[] memory bundles = new Bundle[](4);

    // Default bundles
    bundles[0] = Bundle(8 ether, 45, 0, 45, BundleContent(2, 0, 0, 0));
    bundles[1] = Bundle(28 ether, 40, 0, 40, BundleContent(3, 1, 0, 0));
    bundles[2] = Bundle(112 ether, 12, 0, 12, BundleContent(8, 1, 1, 0));
    bundles[3] = Bundle(416 ether, 3, 0, 3, BundleContent(15, 3, 1, 1));

    sale = new StickersSale(stickers, admin, treasury, bundles);
  }

  function test_getBundles() public {
    Bundle[] memory bundles = sale.getBundles();
    assertEq(bundles.length, 4);
  }
}
