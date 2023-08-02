// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { Ownable } from "solady/auth/Ownable.sol";
import { ECDSA } from "solady/utils/ECDSA.sol";
import { BaseTest } from "@test/BaseTest.sol";
import { LevelUpSetup, SlotData, LevelData } from "@test/setup/LevelUpSetup.sol";
import { POKSetup } from "@test/setup/POKSetup.sol";
import { PookyballSetup } from "@test/setup/PookyballSetup.sol";
import { InvalidReceiver } from "@test/utils/InvalidReceiver.sol";
import { BaseLevelUp, Pricing } from "@/base/BaseLevelUp.sol";
import { BaseSigner } from "@/base/BaseSigner.sol";
import { IBaseTreasury } from "@/interfaces/IBaseTreasury.sol";
import { PookyballMetadata, PookyballRarity } from "@/interfaces/IPookyball.sol";
import { PookyballLevelUp } from "@/game/PookyballLevelUp.sol";

contract PookyballLevelUpTest is BaseTest, PookyballSetup, LevelUpSetup {
  using ECDSA for bytes32;

  address public admin = makeAddr("admin");
  address public game = makeAddr("game");
  address public user = makeAddr("user");
  address public treasury = makeAddr("treasury");

  PookyballLevelUp public levelUp;

  function setUp() public {
    vm.startPrank(admin);
    levelUp = new PookyballLevelUp(pookyball, pok, admin, signer, treasury);
    levelUp.grantRoles(signer, levelUp.SIGNER());
    pookyball.grantRole(pookyball.GAME(), address(levelUp));
    pok.grantRole(pok.BURNER(), address(levelUp));
    vm.stopPrank();
  }

  function test_slots() public {
    // coverage from setUp() function is not counted
    // see https://github.com/foundry-rs/foundry/issues/3453
    levelUp.compute(2, 120);

    (SlotData[] memory dataset) =
      abi.decode(loadDataset("PookyballLevelUp_slots.json"), (SlotData[]));

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
      abi.decode(loadDataset("PookyballLevelUp_pricing.json"), (LevelData[]));

    for (uint256 i; i < dataset.length; i++) {
      address recipient = makeAddr(string(abi.encodePacked(i)));
      uint256 tokenId = mintPookyball(recipient, PookyballRarity.LEGENDARY);

      vm.prank(game);
      pookyball.setLevel(tokenId, uint248(dataset[i].level));

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
    uint256 commonId = mintPookyball(user, PookyballRarity.COMMON);
    (, uint256 maxLevel) = levelUp.getParams(commonId);
    assertEq(maxLevel, 40);

    uint256 rareId = mintPookyball(user, PookyballRarity.RARE);
    (, maxLevel) = levelUp.getParams(rareId);
    assertEq(maxLevel, 60);

    uint256 epicId = mintPookyball(user, PookyballRarity.EPIC);
    (, maxLevel) = levelUp.getParams(epicId);
    assertEq(maxLevel, 80);

    uint256 legendaryId = mintPookyball(user, PookyballRarity.LEGENDARY);
    (, maxLevel) = levelUp.getParams(legendaryId);
    assertEq(maxLevel, 100);

    uint256 mythicId = mintPookyball(user, PookyballRarity.MYTHIC);
    (, maxLevel) = levelUp.getParams(mythicId);
    assertEq(maxLevel, 120);
  }

  /// Assert that the levelUp function reverts when currentPXP parameter and the one used for signature differ.
  function test_levelUp_revertInvalidSignature() public {
    uint256 tokenId = mintPookyball(user);
    PookyballMetadata memory metadata = pookyball.metadata(tokenId);
    assertEq(metadata.level, 0);

    mintPOK(user, 100e18);
    // currentPXP and signedPXP mismatch
    uint256 currentPXP = 1000;
    uint256 signedPXP = 0;

    vm.prank(user);
    vm.expectRevert(BaseSigner.InvalidSignature.selector);
    levelUp.levelUp(
      tokenId, 1, currentPXP, sign(tokenId, metadata.level, signedPXP, address(levelUp))
    );

    // Assert that level is still zero
    metadata = pookyball.metadata(tokenId);
    assertEq(metadata.level, 0);
  }

  /// Assert that the levelUp function reverts if the user has not enough POK tokens.
  function test_levelUp_revertInsufficientPOK() public {
    uint256 tokenId = mintPookyball(user, PookyballRarity.COMMON);

    // We don't deal POK to user
    uint256 currentPXP = 0;
    PookyballMetadata memory metadata = pookyball.metadata(tokenId);
    Pricing memory pricing = levelUp.getPricing(uint256(metadata.level), currentPXP, 1, 0);

    vm.prank(user);
    vm.expectRevert(
      abi.encodeWithSelector(
        BaseLevelUp.InsufficientPOK.selector, pricing.feePOK + pricing.gapPOK, 0
      )
    );
    levelUp.levelUp(
      tokenId, 1, currentPXP, sign(tokenId, metadata.level, currentPXP, address(levelUp))
    );
  }

  /// Assert that the levelUp function reverts if the Pookyball is already at the maximum level.
  function test_levelUp_revertMaximumLevelReached() public {
    uint256 tokenId = mintPookyball(user, PookyballRarity.COMMON);
    (, uint256 maxLevel) = levelUp.getParams(tokenId);
    vm.prank(game);
    pookyball.setLevel(tokenId, maxLevel);

    uint256 currentPXP = 0;
    mintPOK(user, 100e18); // Enough POK

    vm.prank(user);
    vm.expectRevert(
      abi.encodeWithSelector(BaseLevelUp.MaximumLevelReached.selector, tokenId, maxLevel)
    );
    levelUp.levelUp(tokenId, 1, currentPXP, sign(tokenId, maxLevel, currentPXP, address(levelUp)));
  }

  /// Assert that the levelUp function reverts if the native transfer fails.
  function test_levelUp_revertTransferFailed() public {
    InvalidReceiver invalid = new InvalidReceiver();

    // Change treasury to an InvalidReceiver contract
    vm.prank(admin);
    levelUp.changeTreasury(address(invalid));

    uint256 currentPXP = 0;
    uint256 value = 1 ether;
    mintPOK(user, 100e18); // Enough POK
    vm.deal(user, value);

    uint256 tokenId = mintPookyball(user, PookyballRarity.COMMON);
    PookyballMetadata memory metadata = pookyball.metadata(tokenId);

    vm.prank(user);
    vm.expectRevert(
      abi.encodeWithSelector(IBaseTreasury.TransferFailed.selector, address(invalid), value)
    );
    levelUp.levelUp{ value: value }(
      tokenId, 1, currentPXP, sign(tokenId, metadata.level, currentPXP, address(levelUp))
    );
  }

  /// Assert that a Pookyball can be upgraded from level zero to level one using POK.
  function test_levelUp_passZeroLevel() public {
    uint256 tokenId = mintPookyball(user);
    PookyballMetadata memory metadata = pookyball.metadata(tokenId);
    assertEq(metadata.level, 0);

    mintPOK(user, 100e18);
    uint256 currentPXP = 0;

    vm.prank(user);
    levelUp.levelUp(
      tokenId, 1, currentPXP, sign(tokenId, metadata.level, currentPXP, address(levelUp))
    );

    metadata = pookyball.metadata(tokenId);
    assertEq(metadata.level, 1);
  }
}
