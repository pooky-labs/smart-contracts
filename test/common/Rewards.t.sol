// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { Ownable } from "solady/auth/Ownable.sol";
import { ECDSA } from "solady/utils/ECDSA.sol";
import { NonceRegistry } from "@/common/NonceRegistry.sol";
import { Rewards, RewardsData } from "@/common/Rewards.sol";
import { PookyballRarity } from "@/pookyball/IPookyball.sol";
import { StickerRarity } from "@/stickers/IStickers.sol";
import { BaseTest } from "@test/BaseTest.sol";
import { RewardsSetup } from "@test/setup/RewardsSetup.sol";
import { InvalidReceiver } from "@test/utils/InvalidReceiver.sol";

contract RewardsTest is BaseTest, RewardsSetup {
  function test_roles() public {
    assertEq(rewards.owner(), admin);
    assertTrue(rewards.hasAllRoles(rewarder, rewards.REWARDER()));
  }

  function test_claim_revertAlreadyClaimed() public {
    bytes32 nonce = keccak256("test_claim_revertAlreadyClaimed");
    RewardsData memory rewardsData;
    rewardsData.nonces = new bytes32[](1);
    rewardsData.nonces[0] = nonce;
    string memory data = "";
    bytes memory signature = signRewards(user, rewardsData, data);

    vm.prank(operator);
    registry.set(nonce, true);

    vm.prank(user);
    vm.expectRevert(abi.encodeWithSelector(Rewards.AlreadyClaimed.selector, nonce));
    rewards.claim(rewardsData, signature, data);
  }

  function test_claim_revertInvalidSignature() public {
    bytes32 nonce = keccak256("test_claim_revertInvalidSignature");
    RewardsData memory rewardsData;
    rewardsData.amountNAT = 1 ether;
    rewardsData.nonces = new bytes32[](1);
    rewardsData.nonces[0] = nonce;
    string memory data = "";
    bytes memory signature = signRewards(user, rewardsData, data);
    rewardsData.amountNAT = 1000 ether; // attempt to claim more rewards than the value allowed by the signature

    vm.prank(user);
    vm.expectRevert(abi.encodeWithSelector(Rewards.InvalidSignature.selector));
    rewards.claim(rewardsData, signature, data);
  }

  function test_claim_revertInsufficientBalance() public {
    vm.deal(address(rewards), 10 ether);

    bytes32 nonce = keccak256("test_claim_revertInsufficientBalance");
    RewardsData memory rewardsData;
    rewardsData.amountNAT = address(rewards).balance + 1; // rewards has not enough funds to reward the user
    rewardsData.nonces = new bytes32[](1);
    rewardsData.nonces[0] = nonce;
    string memory data = "";
    bytes memory signature = signRewards(user, rewardsData, data);

    vm.prank(user);
    vm.expectRevert(
      abi.encodeWithSelector(
        Rewards.InsufficientBalance.selector, rewardsData.amountNAT, address(rewards).balance
      )
    );
    rewards.claim(rewardsData, signature, data);
  }

  function test_claim_revertTransferFailed() public {
    vm.deal(address(rewards), 10 ether);

    InvalidReceiver invalid = new InvalidReceiver();

    bytes32 nonce = keccak256("test_claim_revertTransferFailed");
    RewardsData memory rewardsData;
    rewardsData.amountNAT = address(rewards).balance; // rewards has not enough funds to reward the user
    rewardsData.nonces = new bytes32[](1);
    rewardsData.nonces[0] = nonce;
    string memory data = "";
    bytes memory signature = signRewards(address(invalid), rewardsData, data);

    vm.prank(address(invalid));
    vm.expectRevert(
      abi.encodeWithSelector(
        Rewards.TransferFailed.selector, address(invalid), rewardsData.amountNAT
      )
    );
    rewards.claim(rewardsData, signature, data);
  }

  function test_claim_passNAT() public {
    vm.deal(address(rewards), 10 ether);

    bytes32 nonce = keccak256("test_claim_passNAT");
    RewardsData memory rewardsData;
    rewardsData.amountNAT = address(rewards).balance; // rewards has not enough funds to reward the user
    rewardsData.nonces = new bytes32[](1);
    rewardsData.nonces[0] = nonce;
    string memory data = "";
    bytes memory signature = signRewards(address(user), rewardsData, data);

    vm.expectEmit(true, true, true, true, address(rewards));
    emit RewardsClaimed(user, rewardsData, data);

    vm.prank(user);
    rewards.claim(rewardsData, signature, data);
  }

  function test_claim_passPOK() public {
    bytes32 nonce = keccak256("test_claim_passPOK");
    RewardsData memory rewardsData;
    rewardsData.amountPOK = 100 ether;
    rewardsData.nonces = new bytes32[](1);
    rewardsData.nonces[0] = nonce;
    string memory data = "";
    bytes memory signature = signRewards(address(user), rewardsData, data);

    vm.expectEmit(true, true, true, true, address(rewards));
    emit RewardsClaimed(user, rewardsData, data);

    vm.prank(user);
    rewards.claim(rewardsData, signature, data);
  }

  function test_claim_passPookyballs() public {
    vm.deal(address(rewards), 10 ether);

    bytes32 nonce = keccak256("test_claim_passPookyballs");
    RewardsData memory rewardsData;
    rewardsData.pookyballs = new PookyballRarity[](2);
    rewardsData.pookyballs[0] = PookyballRarity.COMMON;
    rewardsData.pookyballs[1] = PookyballRarity.RARE;
    rewardsData.nonces = new bytes32[](1);
    rewardsData.nonces[0] = nonce;
    string memory data = "";
    bytes memory signature = signRewards(address(user), rewardsData, data);

    vm.expectEmit(true, true, true, true, address(rewards));
    emit RewardsClaimed(user, rewardsData, data);

    vm.prank(user);
    rewards.claim(rewardsData, signature, data);
  }

  function test_claim_passStickers() public {
    vm.deal(address(rewards), 10 ether);

    bytes32 nonce = keccak256("test_claim_passStickers");
    RewardsData memory rewardsData;
    rewardsData.stickers = new StickerRarity[](2);
    rewardsData.stickers[0] = StickerRarity.COMMON;
    rewardsData.stickers[1] = StickerRarity.RARE;
    rewardsData.nonces = new bytes32[](1);
    rewardsData.nonces[0] = nonce;
    string memory data = "";
    bytes memory signature = signRewards(address(user), rewardsData, data);

    vm.expectEmit(true, true, true, true, address(rewards));
    emit RewardsClaimed(user, rewardsData, data);

    vm.prank(user);
    rewards.claim(rewardsData, signature, data);
  }

  function test_claim_passAll() public {
    vm.deal(address(rewards), 10 ether);

    bytes32 nonce = keccak256("test_claim_passAll");
    RewardsData memory rewardsData;
    rewardsData.amountNAT = address(rewards).balance; // rewards has not enough funds to reward the user
    rewardsData.amountPOK = 100 ether;
    rewardsData.pookyballs = new PookyballRarity[](2);
    rewardsData.pookyballs[0] = PookyballRarity.COMMON;
    rewardsData.pookyballs[1] = PookyballRarity.RARE;
    rewardsData.stickers = new StickerRarity[](2);
    rewardsData.stickers[0] = StickerRarity.COMMON;
    rewardsData.stickers[1] = StickerRarity.RARE;
    rewardsData.nonces = new bytes32[](1);
    rewardsData.nonces[0] = nonce;
    string memory data = "";
    bytes memory signature = signRewards(address(user), rewardsData, data);

    vm.expectEmit(true, true, true, true, address(rewards));
    emit RewardsClaimed(user, rewardsData, data);

    vm.prank(user);
    rewards.claim(rewardsData, signature, data);
  }
}
