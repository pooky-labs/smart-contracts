// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { Ownable } from "solady/auth/Ownable.sol";
import { ECDSA } from "solady/utils/ECDSA.sol";
import { NonceRegistry } from "@/game/NonceRegistry.sol";
import { Rewards, RewardsData } from "@/game/Rewards.sol";
import { PookyballRarity } from "@/interfaces/IPookyball.sol";
import { StickerRarity } from "@/interfaces/IStickers.sol";
import { BaseTest } from "@test/BaseTest.sol";
import { RewardsSetup } from "@test/setup/RewardsSetup.sol";
import { InvalidReceiver } from "@test/utils/InvalidReceiver.sol";

contract RewardsTest is BaseTest, RewardsSetup {
  function createRewards(
    address to,
    uint256 amountNAT,
    uint256 amountPOK,
    bytes32 nonce,
    string memory data
  ) public view returns (RewardsData memory rewardsData, bytes memory signature) {
    PookyballRarity[] memory pookyballs = new PookyballRarity[](1);
    pookyballs[0] = PookyballRarity.COMMON;

    StickerRarity[] memory stickers = new StickerRarity[](1);
    stickers[0] = StickerRarity.COMMON;

    bytes32[] memory nonces = new bytes32[](1);
    nonces[0] = nonce;

    rewardsData = RewardsData(amountNAT, amountPOK, pookyballs, stickers, nonces);
    signature = signRewards(to, rewardsData, data);
  }

  function testFuzz_withdraw_revertNonAdmin(uint256 amount) public {
    deal(address(rewards), amount);

    vm.expectRevert(Ownable.Unauthorized.selector);
    uint256 balanceBefore = user.balance;

    vm.prank(user);
    rewards.withdraw();

    assertEq(user.balance, balanceBefore);
  }

  function testFuzz_withdraw_revertInvalidReceiver(uint256 amountNAT) public {
    vm.assume(amountNAT > 0);
    deal(address(rewards), amountNAT);

    InvalidReceiver receiver = new InvalidReceiver();
    vm.startPrank(admin);
    rewards.transferOwnership(address(receiver));
    vm.stopPrank();

    vm.expectRevert(
      abi.encodeWithSelector(Rewards.TransferFailed.selector, address(receiver), amountNAT)
    );
    vm.prank(address(receiver));
    rewards.withdraw();
  }

  function testFuzz_withdraw_pass(uint256 amount) public {
    deal(address(rewards), amount);

    hoax(admin, 0);
    uint256 balanceBefore = admin.balance;
    rewards.withdraw();

    assertEq(admin.balance, balanceBefore + amount);
  }

  function testFuzz_claim_revertInvalidSignature(
    uint256 amountNAT,
    uint256 amountPOK,
    bytes32 nonce,
    string memory data
  ) public {
    vm.assume(amountNAT < 100000000e18);

    (RewardsData memory rewardsData, bytes memory signature) =
      createRewards(user, amountNAT, amountPOK, nonce, data);

    rewardsData.amountNAT += 100;

    deal(address(rewards), amountNAT); // Ensure the rewards contract has enough native currency

    vm.expectRevert(Rewards.InvalidSignature.selector);
    vm.prank(user);
    rewards.claim(rewardsData, signature, data);
  }

  function testFuzz_claim_revertInsufficientBalance(
    uint256 amountNAT,
    uint256 missingNAT,
    uint256 amountPOK,
    bytes32 nonce,
    string memory data
  ) public {
    vm.assume(amountNAT > 0);
    missingNAT = bound(missingNAT, 1, amountNAT);

    (RewardsData memory rewardsData, bytes memory signature) =
      createRewards(user, amountNAT, amountPOK, nonce, data);

    deal(address(rewards), amountNAT - missingNAT);

    vm.expectRevert(
      abi.encodeWithSelector(
        Rewards.InsufficientBalance.selector, amountNAT, amountNAT - missingNAT
      )
    );
    vm.prank(user);
    rewards.claim(rewardsData, signature, data);
  }

  function testFuzz_claim_revertAlreadyClaimedNonce(
    uint256 amountNAT,
    uint256 amountPOK,
    bytes32 nonce,
    string memory data
  ) public {
    (RewardsData memory rewardsData, bytes memory signature) =
      createRewards(user, amountNAT, amountPOK, nonce, data);

    deal(address(rewards), amountNAT); // Ensure the rewards contract has enough native currency

    vm.prank(operator);
    registry.set(nonce, true);

    vm.expectRevert(abi.encodeWithSelector(Rewards.AlreadyClaimed.selector, nonce));

    vm.prank(user);
    rewards.claim(rewardsData, signature, data);
  }

  function testFuzz_claim_revertTransferFailed(
    uint256 amountNAT,
    uint256 amountPOK,
    bytes32 nonce,
    string memory data
  ) public {
    vm.assume(amountNAT > 0);

    InvalidReceiver receiver = new InvalidReceiver();
    (RewardsData memory rewardsData, bytes memory signature) =
      createRewards(address(receiver), amountNAT, amountPOK, nonce, data);

    deal(address(rewards), amountNAT); // Ensure the rewards contract has enough native currency

    vm.expectRevert(
      abi.encodeWithSelector(Rewards.TransferFailed.selector, address(receiver), amountNAT)
    );
    vm.prank(address(receiver));
    rewards.claim(rewardsData, signature, data);
  }

  function testFuzz_claim_pass(
    uint256 amountNAT,
    uint256 amountPOK,
    bytes32 nonce,
    string memory data
  ) public {
    (RewardsData memory rewardsData, bytes memory signature) =
      createRewards(user, amountNAT, amountPOK, nonce, data);

    deal(address(rewards), amountNAT); // Ensure the rewards contract has enough native currency

    vm.expectEmit(true, true, true, true, address(rewards));
    emit RewardsClaimed(user, rewardsData, data);

    vm.prank(user);
    rewards.claim(rewardsData, signature, data);
  }
}
