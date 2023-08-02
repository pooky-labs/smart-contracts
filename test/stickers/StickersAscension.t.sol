// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { IERC721A } from "ERC721A/IERC721A.sol";
import { Ascension } from "@/common/Ascension.sol";
import { ITreasury } from "@/common/ITreasury.sol";
import { StickerRarity } from "@/stickers/IStickers.sol";
import { StickersAscension } from "@/stickers/StickersAscension.sol";
import { BaseTest } from "@test/BaseTest.sol";
import { AscensionSetup } from "@test/setup/AscensionSetup.sol";
import { StickersSetup } from "@test/setup/StickersSetup.sol";

contract StickersAscensionTest is BaseTest, StickersSetup, AscensionSetup {
  address public admin = makeAddr("admin");
  address public user = makeAddr("user");
  address public user2 = makeAddr("user2");

  StickersAscension ascension;

  function setUp() public {
    ascension = new StickersAscension(stickers);

    vm.startPrank(admin);
    stickers.grantRoles(address(ascension), stickers.MINTER());
    vm.stopPrank();
  }

  struct AscendableLevelInsufficientLevel {
    StickerRarity rarity;
    uint248 level;
  }

  function test_ascendable_revertIneligible_insufficientLevel() public {
    AscendableLevelInsufficientLevel[3] memory data = [
      AscendableLevelInsufficientLevel(StickerRarity.COMMON, 39),
      AscendableLevelInsufficientLevel(StickerRarity.RARE, 59),
      AscendableLevelInsufficientLevel(StickerRarity.EPIC, 79)
    ];

    for (uint256 i; i < data.length; i++) {
      uint256 tokenId = mintSticker(user, data[i].rarity);
      setPookyballLevel(tokenId, data[i].level);

      vm.expectRevert(abi.encodeWithSelector(Ascension.Ineligible.selector, tokenId));
      ascension.ascendable(user, tokenId);
    }
  }

  function test_ascendable_revertLegendary() public {
    uint256 tokenId = mintSticker(user, StickerRarity.LEGENDARY);
    setPookyballLevel(tokenId, 100);

    vm.expectRevert(abi.encodeWithSelector(Ascension.Ineligible.selector, tokenId));
    ascension.ascendable(user, tokenId);
  }

  struct AscendablePass {
    StickerRarity input;
    StickerRarity output;
    uint248 level;
  }

  function test_ascendable_pass() public {
    AscendablePass[3] memory data = [
      AscendablePass(StickerRarity.COMMON, StickerRarity.RARE, 40),
      AscendablePass(StickerRarity.RARE, StickerRarity.EPIC, 60),
      AscendablePass(StickerRarity.EPIC, StickerRarity.LEGENDARY, 80)
    ];

    for (uint256 i; i < data.length; i++) {
      uint256 tokenId = mintSticker(user, data[i].input);
      setPookyballLevel(tokenId, data[i].level);
      assertEq(ascension.ascendable(user, tokenId), uint8(data[i].output));
    }
  }

  /// Assert the ascend fails if one of the Pookyballs is not owned by the user
  function test_ascend_revertIneligible_nonOwner() public {
    uint256 left = mintSticker(user, StickerRarity.COMMON);
    uint256 right = mintSticker(user2, StickerRarity.COMMON);

    uint256 priceNAT = 10 ether;
    setPookyballLevel(left, 40);
    setPookyballLevel(right, 40);

    startHoax(user, priceNAT);
    stickers.setApprovalForAll(address(ascension), true);

    vm.expectRevert(abi.encodeWithSelector(Ascension.Ineligible.selector, right));
    ascension.ascend(left, right);
    vm.stopPrank();

    assertEq(stickers.ownerOf(left), user);
    assertEq(stickers.ownerOf(right), user2);
  }

  /// Assert the ascend fails if one of the Pookyballs is not at the maximum level
  function test_ascend_revertIneligible_notMaxLevel() public {
    uint256 left = mintSticker(user, StickerRarity.COMMON);
    uint256 right = mintSticker(user, StickerRarity.COMMON);

    uint256 priceNAT = 10 ether;
    setPookyballLevel(left, 40);
    setPookyballLevel(right, 30);

    startHoax(user, priceNAT);
    stickers.setApprovalForAll(address(ascension), true);
    vm.expectRevert(abi.encodeWithSelector(Ascension.Ineligible.selector, right));
    ascension.ascend(left, right);
    vm.stopPrank();

    assertEq(stickers.ownerOf(left), user);
    assertEq(stickers.ownerOf(right), user);
  }

  /// Assert the ascend fails if used Pookyballs are both Legendary rarity
  function test_ascend_revertIneligible_maximumRarity() public {
    uint256 left = mintSticker(user, StickerRarity.LEGENDARY);
    uint256 right = mintSticker(user, StickerRarity.LEGENDARY);

    uint256 priceNAT = 10 ether;
    setPookyballLevel(left, 120);
    setPookyballLevel(right, 120);

    startHoax(user, priceNAT);
    stickers.setApprovalForAll(address(ascension), true);

    vm.expectRevert(abi.encodeWithSelector(Ascension.Ineligible.selector, left));
    ascension.ascend(left, right);
    vm.stopPrank();

    assertEq(stickers.ownerOf(left), user);
    assertEq(stickers.ownerOf(right), user);
  }

  /// Assert the ascend fails if used Pookyball rarities mismatch
  function test_ascend_revertRarityMismatch() public {
    uint256 left = mintSticker(user, StickerRarity.COMMON);
    uint256 right = mintSticker(user, StickerRarity.RARE);

    uint256 priceNAT = 10 ether;
    setPookyballLevel(left, 40);
    setPookyballLevel(right, 60);

    startHoax(user, priceNAT);
    stickers.setApprovalForAll(address(ascension), true);
    vm.expectRevert(
      abi.encodeWithSelector(
        Ascension.RarityMismatch.selector, StickerRarity.RARE, StickerRarity.EPIC
      )
    );
    ascension.ascend(left, right);
    vm.stopPrank();

    assertEq(stickers.ownerOf(left), user);
    assertEq(stickers.ownerOf(right), user);
  }

  struct AscendPass {
    StickerRarity input;
    StickerRarity output;
    uint248 level;
  }

  function test_ascend_pass() public {
    AscendPass[3] memory data = [
      AscendPass(StickerRarity.COMMON, StickerRarity.RARE, 40),
      AscendPass(StickerRarity.RARE, StickerRarity.EPIC, 60),
      AscendPass(StickerRarity.EPIC, StickerRarity.LEGENDARY, 80)
    ];

    for (uint256 i; i < data.length; i++) {
      uint256 left = mintSticker(user, data[i].input);
      uint256 right = mintSticker(user, data[i].input);

      setPookyballLevel(left, data[i].level);
      setPookyballLevel(right, data[i].level);

      vm.startPrank(user);
      stickers.setApprovalForAll(address(ascension), true);
      uint256 ascendedId = ascension.ascend(left, right);
      vm.stopPrank();

      vm.expectRevert(IERC721A.OwnerQueryForNonexistentToken.selector);
      stickers.ownerOf(left);

      vm.expectRevert(IERC721A.OwnerQueryForNonexistentToken.selector);
      stickers.ownerOf(right);

      assertEq(stickers.ownerOf(ascendedId), user);
      assertTrue(stickers.metadata(ascendedId).rarity == data[i].output);
    }
  }
}
