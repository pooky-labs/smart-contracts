// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Ownable } from "solady/auth/Ownable.sol";
import { IBaseTreasury } from "../../src/interfaces/IBaseTreasury.sol";
import { StickersSale, Pack, PackContent, Refill } from "../../src/mint/StickersSale.sol";
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

  Pack[] defaultPacks;
  Refill[] defaultRefills;

  function setUp() public {
    // Default refills
    defaultRefills.push(Refill(0, 8 ether, 45));
    defaultRefills.push(Refill(1, 28 ether, 40));
    defaultRefills.push(Refill(2, 112 ether, 12));
    defaultRefills.push(Refill(3, 416 ether, 3));

    // Default packs
    defaultPacks.push(Pack(8 ether, 45, 0, 45, PackContent(2, 0, 0, 0)));
    defaultPacks.push(Pack(28 ether, 40, 0, 40, PackContent(3, 1, 0, 0)));
    defaultPacks.push(Pack(112 ether, 12, 0, 12, PackContent(8, 1, 1, 0)));
    defaultPacks.push(Pack(416 ether, 3, 0, 3, PackContent(15, 3, 1, 1)));

    for (uint256 i; i < defaultPacks.length; i++) {
      defaultRefills.push(Refill(i, defaultPacks[i].price, defaultPacks[i].supply));
    }

    sale = new StickersSale(stickers, admin, treasury, defaultPacks);

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

  function test_getPacks() public {
    Pack[] memory packs = sale.getPacks();
    assertEq(packs.length, 4);
    assertEq(packs[0].price, 8 ether);
    assertEq(packs[3].price, 416 ether);
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
    assertEq(sale.getPacks().length, defaultPacks.length);

    vm.prank(user);
    vm.expectRevert(Ownable.Unauthorized.selector);
    sale.create(defaultPacks[0]);
  }

  function test_create() public {
    assertEq(sale.getPacks().length, defaultPacks.length);

    vm.prank(admin);
    sale.create(defaultPacks[0]);
    assertEq(sale.getPacks().length, defaultPacks.length + 1);
  }

  function test_purchase_revertClose() public {
    vm.prank(seller);
    sale.restock(defaultRefills, 0); // zero means closed
    assertTrue(sale.isClosed());

    uint256 packId = 0;
    Pack memory pack = sale.getPacks()[packId];
    vm.prank(user);
    vm.expectRevert(abi.encodeWithSelector(StickersSale.Closed.selector, 0));
    sale.purchase{ value: pack.price }(packId);
  }

  function test_purchase_revertInvalidPack() public {
    uint256 packId = sale.getPacks().length;
    vm.prank(user);
    vm.expectRevert(StickersSale.InvalidPack.selector);
    sale.purchase(packId);
  }

  function test_purchase_revertInsufficientSupply() public {
    vm.warp(date);

    uint256 packId = 0;
    Refill[] memory faultyRefills = new Refill[](1);
    faultyRefills[0] = Refill(packId, defaultPacks[0].price, 0);

    vm.prank(seller);
    sale.restock(faultyRefills, 1);
    assertFalse(sale.isClosed());

    Pack memory pack = sale.getPacks()[packId];
    vm.prank(user);
    vm.expectRevert(abi.encodeWithSelector(StickersSale.InsufficientSupply.selector, packId));
    sale.purchase{ value: pack.price }(packId);
  }

  function test_purchase_revertInsufficientValue() public {
    uint256 packId = 0;
    Pack memory pack = sale.getPacks()[packId];
    vm.prank(user);
    uint256 value = pack.price - 1;
    vm.expectRevert(
      abi.encodeWithSelector(IBaseTreasury.InsufficientValue.selector, value, pack.price)
    );
    sale.purchase{ value: value }(packId);
  }

  function test_purchase_revertTransferFailed() public {
    InvalidReceiver invalid = new InvalidReceiver();
    vm.prank(admin);
    sale.changeTreasury(address(invalid));

    uint256 packId = 0;
    Pack memory pack = sale.getPacks()[packId];

    vm.prank(user);
    vm.expectRevert(
      abi.encodeWithSelector(IBaseTreasury.TransferFailed.selector, address(invalid), pack.price)
    );
    sale.purchase{ value: pack.price }(packId);
  }

  function test_purchase_pass_legend() public {
    uint256 packId = 3; // legend pack with all sticker rarities
    Pack memory pack = sale.getPacks()[packId];

    uint256 stickersBefore = stickers.balanceOf(user);
    uint256 quantity =
      pack.content.common + pack.content.rare + pack.content.epic + pack.content.legendary;
    uint256 expectedBalance = stickersBefore + quantity;

    vm.prank(user);
    sale.purchase{ value: pack.price }(packId);
    assertEq(stickers.balanceOf(user), expectedBalance);
  }
}
