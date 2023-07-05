// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ECDSA } from "openzeppelin/utils/cryptography/ECDSA.sol";
import { Ownable } from "solady/auth/Ownable.sol";
import { POKSetup } from "../setup/POKSetup.sol";
import { BaseTest } from "../BaseTest.sol";
import { LevelUpSetup } from "../setup/LevelUpSetup.sol";
import { StickersSetup } from "../setup/StickersSetup.sol";
import { StickerMetadata } from "../../src/interfaces/IStickers.sol";
import { StickersLevelUp } from "../../src/game/StickersLevelUp.sol";
import { BaseLevelUp } from "../../src/game/BaseLevelUp.sol";

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

  /**
   * Assert that the levelUp function reverts when currentPXP parameter and the one used for signature differ.
   */
  function test_levelUp_revertInvalidSignature() public {
    uint256 tokenId = mintSticker(user);
    StickerMetadata memory metadata = stickers.metadata(tokenId);
    assertEq(metadata.level, 0);

    mintPOK(user, 100e18);

    vm.prank(user);
    vm.expectRevert(BaseLevelUp.InvalidSignature.selector);
    levelUp.levelUp(tokenId, 1, 1000, sign(tokenId, 0)); // currentPXP and signedPXP mismatch

    // Assert that level is still zero
    metadata = stickers.metadata(tokenId);
    assertEq(metadata.level, 0);
  }

  /**
   * Assert that a Sticker can be upgrade from level zero to level one using POK.
   */
  function test_levelUp_zero() public {
    uint256 tokenId = mintSticker(user);
    StickerMetadata memory metadata = stickers.metadata(tokenId);
    assertEq(metadata.level, 0);

    mintPOK(user, 100e18);

    vm.prank(user);
    levelUp.levelUp(tokenId, 1, 0, sign(tokenId, 0));

    metadata = stickers.metadata(tokenId);
    assertEq(metadata.level, 1);
  }
}
