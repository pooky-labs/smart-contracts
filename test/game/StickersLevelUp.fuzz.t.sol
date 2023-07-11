// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ECDSA } from "solady/utils/ECDSA.sol";
import { BaseTest } from "../BaseTest.sol";
import { LevelUpSetup } from "../setup/LevelUpSetup.sol";
import { POKSetup } from "../setup/POKSetup.sol";
import { StickersSetup } from "../setup/StickersSetup.sol";
import { BaseLevelUp, Pricing } from "../../src/base/BaseLevelUp.sol";
import { StickerMetadata, StickerRarity } from "../../src/interfaces/IStickers.sol";
import { StickersLevelUp } from "../../src/game/StickersLevelUp.sol";

struct SlotData {
  uint256 expected;
  uint256 level;
}

contract StickersLevelUpFuzzTest is BaseTest, StickersSetup, LevelUpSetup {
  using ECDSA for bytes32;

  address public admin = makeAddr("admin");
  address public game = makeAddr("game");
  address public user = makeAddr("user");
  address public treasury = makeAddr("treasury");

  StickersLevelUp public levelUp;

  function setUp() public {
    vm.startPrank(admin);
    levelUp = new StickersLevelUp(stickers, pok, admin, treasury);
    levelUp.grantRoles(signer, levelUp.SIGNER());
    stickers.grantRoles(address(levelUp), stickers.GAME());
    pok.grantRole(pok.BURNER(), address(levelUp));
    vm.stopPrank();
  }

  /**
   * Assert that the levelUp function reverts if the user has not enough POK tokens.
   */
  function testFuzz_levelUp_revertInsufficientPOK(uint256 raritySeed, uint256 balancePOK) public {
    StickerRarity rarity = randomStickerRarity(raritySeed);
    uint256 tokenId = mintSticker(user, rarity);

    uint256 currentPXP = 0;
    StickerMetadata memory metadata = stickers.metadata(tokenId);
    Pricing memory pricing = levelUp.getPricing(uint256(metadata.level), currentPXP, 1, 0);
    uint256 requiredPOK = pricing.feePOK + pricing.gapPOK;
    balancePOK = bound(balancePOK, 0, pricing.feePOK + pricing.gapPOK - 1);

    vm.prank(user);
    vm.expectRevert(abi.encodeWithSelector(BaseLevelUp.InsufficientPOK.selector, requiredPOK, 0));
    levelUp.levelUp(tokenId, 1, currentPXP, sign(tokenId, currentPXP));
  }

  /**
   * Assert that the levelUp function reverts if the Sticker is already at the maximum level.
   */
  function testFuzz_levelUp_revertMaximumLevelReached(uint256 raritySeed) public {
    StickerRarity rarity = randomStickerRarity(raritySeed);
    uint256 tokenId = mintSticker(user, rarity);
    (, uint256 maxLevel) = levelUp.getParams(tokenId);
    vm.prank(game);
    stickers.setLevel(tokenId, uint248(maxLevel));

    mintPOK(user, 100e18);
    uint256 currentPXP = 0;

    vm.prank(user);
    vm.expectRevert(
      abi.encodeWithSelector(BaseLevelUp.MaximumLevelReached.selector, tokenId, maxLevel)
    );
    levelUp.levelUp(tokenId, 1, currentPXP, sign(tokenId, currentPXP));
  }

  /**
   * Assert that a Sticker can be upgraded from level zero to level one using POK.
   */
  function testFuzz_levelUp_pass(
    uint256 raritySeed,
    uint256 level,
    uint256 increase,
    uint256 currentPXP,
    uint256 value
  ) public {
    StickerRarity rarity = randomStickerRarity(raritySeed);
    uint256 tokenId = mintSticker(user, rarity);
    (, uint256 maxLevel) = levelUp.getParams(tokenId);
    level = bound(level, 0, maxLevel - 1);
    vm.prank(game);
    stickers.setLevel(tokenId, uint248(level));

    increase = bound(increase, 1, maxLevel - level);
    value = bound(value, 0, 1000 ether);

    Pricing memory pricing = levelUp.getPricing(level, currentPXP, increase, value);
    uint256 requiredPOK = pricing.feePOK + pricing.gapPOK;

    mintPOK(user, requiredPOK);

    vm.deal(user, value);
    vm.prank(user);
    levelUp.levelUp{ value: value }(tokenId, increase, currentPXP, sign(tokenId, currentPXP));

    StickerMetadata memory metadata = stickers.metadata(tokenId);
    assertEq(metadata.level, level + increase);
  }
}
