// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { ECDSA } from "solady/utils/ECDSA.sol";
import { LevelUp, Pricing } from "@/common/LevelUp.sol";
import { StickerMetadata, StickerRarity } from "@/stickers/IStickers.sol";
import { StickersLevelUp } from "@/stickers/StickersLevelUp.sol";
import { BaseTest } from "@test/BaseTest.sol";
import { LevelUpSetup } from "@test/setup/LevelUpSetup.sol";
import { POKSetup } from "@test/setup/POKSetup.sol";
import { StickersSetup } from "@test/setup/StickersSetup.sol";

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
    levelUp = new StickersLevelUp(stickers, pok, admin, signer, treasury);
    levelUp.grantRoles(signer, levelUp.SIGNER());
    stickers.grantRoles(address(levelUp), stickers.GAME());
    pok.grantRole(pok.BURNER(), address(levelUp));
    vm.stopPrank();
  }

  /// Assert that the levelUp function reverts if the user has not enough POK tokens.
  function testFuzz_levelUp_revertInsufficientPOK(uint256 raritySeed, uint256 balancePOK) public {
    StickerRarity rarity = randomStickerRarity(raritySeed);
    uint256 tokenId = mintSticker(user, rarity);

    uint256 currentPXP = 0;
    StickerMetadata memory metadata = stickers.metadata(tokenId);
    Pricing memory pricing = levelUp.getPricing(uint256(metadata.level), currentPXP, 1, 0);
    uint256 requiredPOK = pricing.feePOK + pricing.gapPOK;
    balancePOK = bound(balancePOK, 0, pricing.feePOK + pricing.gapPOK - 1);

    vm.prank(user);
    vm.expectRevert(abi.encodeWithSelector(LevelUp.InsufficientPOK.selector, requiredPOK, 0));
    levelUp.levelUp(
      tokenId, 1, currentPXP, sign(tokenId, metadata.level, currentPXP, address(levelUp))
    );
  }

  /// Assert that the levelUp function reverts if the Sticker is already at the maximum level.
  function testFuzz_levelUp_revertMaximumLevelReached(uint256 raritySeed) public {
    StickerRarity rarity = randomStickerRarity(raritySeed);
    uint256 tokenId = mintSticker(user, rarity);
    (, uint256 maxLevel) = levelUp.getParams(tokenId);
    StickerMetadata memory metadata = stickers.metadata(tokenId);

    vm.prank(game);
    stickers.setLevel(tokenId, uint248(maxLevel));

    mintPOK(user, 100e18);
    uint256 currentPXP = 0;

    vm.prank(user);
    vm.expectRevert(abi.encodeWithSelector(LevelUp.MaximumLevelReached.selector, tokenId, maxLevel));
    levelUp.levelUp(
      tokenId, 1, currentPXP, sign(tokenId, metadata.level, currentPXP, address(levelUp))
    );
  }

  /// @dev This function computes some intermediate values for the testFuzz_levelUp_pass function.
  /// This allow to avoid the following error:
  /// Stack too deep. Try compiling with `--via-ir` (cli) or the equivalent `viaIR: true` (standard JSON)
  /// while enabling the optimizer. Otherwise, try removing local variables.
  function prepare_testFuzz_levelUp_pass(
    uint256 raritySeed,
    uint256 levelSeed,
    uint256 increaseSeed,
    uint256 valueSeed
  ) internal returns (uint256 tokenId, uint256 level, uint256 increase, uint256 value) {
    StickerRarity rarity = randomStickerRarity(raritySeed);
    tokenId = mintSticker(user, rarity);
    (, uint256 maxLevel) = levelUp.getParams(tokenId);
    level = bound(levelSeed, 0, maxLevel - 1);

    vm.prank(game);
    stickers.setLevel(tokenId, uint248(level));

    increase = bound(increaseSeed, 1, maxLevel - level);
    value = bound(valueSeed, 0, 1000 ether);
  }

  /// Assert that a Sticker can be upgraded from level zero to level one using POK.
  function testFuzz_levelUp_pass(
    uint256 raritySeed,
    uint256 levelSeed,
    uint256 increaseSeed,
    uint256 valueSeed,
    uint256 currentPXP
  ) public {
    (uint256 tokenId, uint256 level, uint256 increase, uint256 value) =
      prepare_testFuzz_levelUp_pass(raritySeed, levelSeed, increaseSeed, valueSeed);

    Pricing memory pricing = levelUp.getPricing(level, currentPXP, increase, value);
    uint256 requiredPOK = pricing.feePOK + pricing.gapPOK;

    mintPOK(user, requiredPOK);

    vm.deal(user, value);
    vm.prank(user);
    levelUp.levelUp{ value: value }(
      tokenId, increase, currentPXP, sign(tokenId, level, currentPXP, address(levelUp))
    );

    StickerMetadata memory metadata = stickers.metadata(tokenId);
    assertEq(metadata.level, level + increase);
  }
}
