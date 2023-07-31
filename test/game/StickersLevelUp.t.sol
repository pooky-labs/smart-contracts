// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Ownable } from "solady/auth/Ownable.sol";
import { ECDSA } from "solady/utils/ECDSA.sol";
import { BaseTest } from "../BaseTest.sol";
import { LevelUpSetup, SlotData, LevelData } from "../setup/LevelUpSetup.sol";
import { POKSetup } from "../setup/POKSetup.sol";
import { StickersSetup } from "../setup/StickersSetup.sol";
import { InvalidReceiver } from "../utils/InvalidReceiver.sol";
import { BaseLevelUp, Pricing } from "../../src/base/BaseLevelUp.sol";
import { IBaseTreasury } from "../../src/interfaces/IBaseTreasury.sol";
import { StickerMetadata, StickerRarity } from "../../src/interfaces/IStickers.sol";
import { StickersLevelUp } from "../../src/game/StickersLevelUp.sol";

contract StickersLevelUpTest is BaseTest, StickersSetup, LevelUpSetup {
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

  function test_slots() public {
    // coverage from setUp() function is not counted
    // see https://github.com/foundry-rs/foundry/issues/3453
    levelUp.compute(2, 120);

    (SlotData[] memory dataset) =
      abi.decode(loadDataset("StickersLevelUp_slots.json"), (SlotData[]));

    for (uint256 i; i < dataset.length; i++) {
      assertApproxEqRelDecimal(
        levelUp.slots(dataset[i].level),
        dataset[i].expected * 10 ** (levelUp.PXP_DECIMALS() - 3),
        1e14, // max 0.01% delta
        18
      );
    }
  }

  function test_getPricing() public {
    (LevelData[] memory dataset) =
      abi.decode(loadDataset("StickersLevelUp_pricing.json"), (LevelData[]));

    for (uint256 i; i < dataset.length; i++) {
      address recipient = makeAddr(string(abi.encodePacked(i)));
      uint256 tokenId = mintSticker(recipient, StickerRarity.LEGENDARY);

      vm.prank(game);
      stickers.setLevel(tokenId, uint248(dataset[i].level));

      Pricing memory pricing = levelUp.getPricing(
        dataset[i].level, dataset[i].currentPXP, dataset[i].increase, dataset[i].value
      );

      assertApproxEqRelDecimal(
        pricing.remainingPXP,
        dataset[i].remainingPXP,
        1e14, // max 0.01% delta
        18,
        "remainingPXP"
      );

      assertApproxEqRelDecimal(
        pricing.gapPOK + pricing.feePOK,
        dataset[i].expectedPOK,
        1e14, // max 0.01% delta
        18,
        "expectedPOK"
      );
    }
  }

  function test_changeTreasury_revertOnlyOwner() public {
    vm.prank(user);
    vm.expectRevert(Ownable.Unauthorized.selector);
    levelUp.changeTreasury(user);
  }

  function test_changeTreasury_success() public {
    address newTreasury = makeAddr("newTreasury");
    vm.prank(admin);
    levelUp.changeTreasury(newTreasury);
    assertEq(levelUp.treasury(), newTreasury);
  }

  function test_changeBasePXP_revertOnlyOwner() public {
    vm.prank(user);
    vm.expectRevert(Ownable.Unauthorized.selector);
    levelUp.changeBasePXP(1000e18);
  }

  function test_changeBasePXP_success() public {
    uint256 newBasePXP = 200e18;
    vm.prank(admin);
    levelUp.changeBasePXP(newBasePXP);
    assertEq(levelUp.basePXP(), newBasePXP);
  }

  function test_changeRatePXP_POK_revertOnlyOwner() public {
    vm.prank(user);
    vm.expectRevert(Ownable.Unauthorized.selector);
    levelUp.changeRatePXP_POK(10);
  }

  function test_changeRatePXP_POK_success() public {
    uint256 newRatePXP_POK = 2000;
    vm.prank(admin);
    levelUp.changeRatePXP_POK(newRatePXP_POK);
    assertEq(levelUp.ratePXP_POK(), newRatePXP_POK);
  }

  function test_changeRateNAT_POK_revertOnlyOwner() public {
    vm.prank(user);
    vm.expectRevert(Ownable.Unauthorized.selector);
    levelUp.changeRateNAT_POK(10);
  }

  function test_changeRateNAT_POK_success() public {
    uint256 newRateNAT_POK = 500;
    vm.prank(admin);
    levelUp.changeRateNAT_POK(newRateNAT_POK);
    assertEq(levelUp.rateNAT_POK(), newRateNAT_POK);
  }

  function test_changeGrowth_revertOnlyOwner() public {
    vm.prank(user);
    vm.expectRevert(Ownable.Unauthorized.selector);
    levelUp.changeGrowth(9000); // 90% => we don't want this :)
  }

  function test_changeGrowth_success() public {
    uint256 newGrowth = 10500;
    vm.prank(admin);
    levelUp.changeGrowth(newGrowth);
    assertEq(levelUp.growth(), newGrowth);
  }

  function test_changeFee_revertOnlyOwner() public {
    vm.prank(user);
    vm.expectRevert(Ownable.Unauthorized.selector);
    levelUp.changeFee(100); // 1%
  }

  function test_changeFee_success() public {
    uint256 newFee = 900;
    vm.prank(admin);
    levelUp.changeFee(newFee);
    assertEq(levelUp.fee(), newFee);
  }

  function test_getParams_pass() public {
    uint256 commonId = mintSticker(user, StickerRarity.COMMON);
    (, uint256 maxLevel) = levelUp.getParams(commonId);
    assertEq(maxLevel, 40);

    uint256 rareId = mintSticker(user, StickerRarity.RARE);
    (, maxLevel) = levelUp.getParams(rareId);
    assertEq(maxLevel, 60);

    uint256 epicId = mintSticker(user, StickerRarity.EPIC);
    (, maxLevel) = levelUp.getParams(epicId);
    assertEq(maxLevel, 80);

    uint256 legendaryId = mintSticker(user, StickerRarity.LEGENDARY);
    (, maxLevel) = levelUp.getParams(legendaryId);
    assertEq(maxLevel, 100);

    uint256 mythicId = mintSticker(user, StickerRarity.MYTHIC);
    (, maxLevel) = levelUp.getParams(mythicId);
    assertEq(maxLevel, 120);
  }

  /**
   * Assert that the levelUp function reverts when currentPXP parameter and the one used for signature differ.
   */
  function test_levelUp_revertInvalidSignature() public {
    uint256 tokenId = mintSticker(user);
    StickerMetadata memory metadata = stickers.metadata(tokenId);
    assertEq(metadata.level, 0);

    mintPOK(user, 100e18);
    // currentPXP and signedPXP mismatch
    uint256 currentPXP = 1000;
    uint256 signedPXP = 0;

    vm.prank(user);
    vm.expectRevert(BaseLevelUp.InvalidSignature.selector);
    levelUp.levelUp(tokenId, 1, currentPXP, sign(tokenId, signedPXP));

    // Assert that level is still zero
    metadata = stickers.metadata(tokenId);
    assertEq(metadata.level, 0);
  }

  /**
   * Assert that the levelUp function reverts if the user has not enough POK tokens.
   */
  function test_levelUp_revertInsufficientPOK() public {
    uint256 tokenId = mintSticker(user, StickerRarity.COMMON);

    // We don't deal POK to user
    uint256 currentPXP = 0;
    StickerMetadata memory metadata = stickers.metadata(tokenId);
    Pricing memory pricing = levelUp.getPricing(uint256(metadata.level), currentPXP, 1, 0);

    vm.prank(user);
    vm.expectRevert(
      abi.encodeWithSelector(
        BaseLevelUp.InsufficientPOK.selector, pricing.feePOK + pricing.gapPOK, 0
      )
    );
    levelUp.levelUp(tokenId, 1, currentPXP, sign(tokenId, currentPXP));
  }

  /**
   * Assert that the levelUp function reverts if the Sticker is already at the maximum level.
   */
  function test_levelUp_revertMaximumLevelReached() public {
    uint256 tokenId = mintSticker(user, StickerRarity.COMMON);
    (, uint256 maxLevel) = levelUp.getParams(tokenId);
    vm.prank(game);
    stickers.setLevel(tokenId, uint248(maxLevel));

    uint256 currentPXP = 0;
    mintPOK(user, 100e18); // Enough POK

    vm.prank(user);
    vm.expectRevert(
      abi.encodeWithSelector(BaseLevelUp.MaximumLevelReached.selector, tokenId, maxLevel)
    );
    levelUp.levelUp(tokenId, 1, currentPXP, sign(tokenId, currentPXP));
  }

  /**
   * Assert that the levelUp function reverts if the native transfer fails.
   */
  function test_levelUp_revertTransferFailed() public {
    InvalidReceiver invalid = new InvalidReceiver();

    // Change treasury to an InvalidReceiver contract
    vm.prank(admin);
    levelUp.changeTreasury(address(invalid));

    uint256 currentPXP = 0;
    uint256 value = 1 ether;
    mintPOK(user, 100e18); // Enough POK
    vm.deal(user, value);

    uint256 tokenId = mintSticker(user, StickerRarity.COMMON);
    vm.prank(user);
    vm.expectRevert(
      abi.encodeWithSelector(IBaseTreasury.TransferFailed.selector, address(invalid), value)
    );
    levelUp.levelUp{ value: value }(tokenId, 1, currentPXP, sign(tokenId, currentPXP));
  }

  /**
   * Assert that a Sticker can be upgraded from level zero to level one using POK.
   */
  function test_levelUp_passZeroLevel() public {
    uint256 tokenId = mintSticker(user);
    StickerMetadata memory metadata = stickers.metadata(tokenId);
    assertEq(metadata.level, 0);

    mintPOK(user, 100e18);
    uint256 currentPXP = 0;

    vm.prank(user);
    levelUp.levelUp(tokenId, 1, currentPXP, sign(tokenId, currentPXP));

    metadata = stickers.metadata(tokenId);
    assertEq(metadata.level, 1);
  }
}
