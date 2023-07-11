// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Ownable } from "solady/auth/Ownable.sol";
import { ECDSA } from "solady/utils/ECDSA.sol";
import { NonceRegistry } from "../../src/game/NonceRegistry.sol";
import { Rewards, RewardsData } from "../../src/game/Rewards.sol";
import { PookyballRarity } from "../../src/interfaces/IPookyball.sol";
import { StickerRarity } from "../../src/interfaces/IStickers.sol";
import { BaseTest } from "../BaseTest.sol";
import { POKSetup } from "../setup/POKSetup.sol";
import { PookyballSetup } from "../setup/PookyballSetup.sol";
import { StickersSetup } from "../setup/StickersSetup.sol";
import { InvalidReceiver } from "../utils/InvalidReceiver.sol";

contract RewardsTest is BaseTest, POKSetup, PookyballSetup, StickersSetup {
  using ECDSA for bytes32;

  NonceRegistry public registry;
  Rewards public rewards;

  address public admin = makeAddr("admin");
  address public operator = makeAddr("operator");
  address public rewarder;
  uint256 public privateKey;
  address public user = makeAddr("user");

  event RewardsClaimed(address indexed account, RewardsData rewards, string data);

  function setUp() public {
    (rewarder, privateKey) = makeAddrAndKey("rewarder");

    address[] memory admins = new address[](1);
    admins[0] = admin;
    address[] memory operators = new address[](1);
    operators[0] = operator;
    registry = new NonceRegistry(admins, operators);

    address[] memory rewarders = new address[](1);
    rewarders[0] = rewarder;
    rewards = new Rewards(pok, pookyball, stickers, registry, admin, rewarders);

    vm.startPrank(admin);
    pok.grantRole(pok.MINTER(), address(rewards));
    pookyball.grantRole(pookyball.MINTER(), address(rewards));
    stickers.grantRoles(address(rewards), stickers.MINTER());
    registry.grantRole(registry.OPERATOR(), address(rewards));
    vm.stopPrank();
  }

  function signRewards(address to, RewardsData memory rewardsData, string memory data)
    public
    view
    returns (bytes memory)
  {
    bytes32 hash = keccak256(abi.encode(to, rewardsData, data)).toEthSignedMessageHash();
    (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKey, hash);
    return abi.encodePacked(r, s, v);
  }

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

  function test_roles() public {
    assertEq(rewards.owner(), admin);
    assertTrue(rewards.hasAllRoles(rewarder, rewards.REWARDER()));
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
