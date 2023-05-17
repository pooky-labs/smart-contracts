// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Test } from "forge-std/Test.sol";
import { Strings } from "openzeppelin/utils/Strings.sol";
import { ECDSA } from "openzeppelin/utils/cryptography/ECDSA.sol";
import { NonceRegistry } from "../../src/game/NonceRegistry.sol";
import { Rewards, RewardsData, RewardsPXP } from "../../src/game/Rewards.sol";
import { PookyballRarity } from "../../src/types/PookyballRarity.sol";
import { POKSetup } from "../setup/POKSetup.sol";
import { PookyballSetup } from "../setup/PookyballSetup.sol";
import { InvalidReceiver } from "../utils/InvalidReceiver.sol";

contract RewardsTest is Test, POKSetup, PookyballSetup {
  using ECDSA for bytes32;

  NonceRegistry registry;
  Rewards rewards;

  address admin = makeAddr("admin");
  address operator = makeAddr("operator");
  address rewarder;
  uint256 privateKey;
  address user = makeAddr("user");

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
    rewards = new Rewards(pok, pookyball, registry, admin, rewarders);

    vm.startPrank(admin);
    pok.grantRole(pok.MINTER(), address(rewards));
    pookyball.grantRole(pookyball.MINTER(), address(rewards));
    pookyball.grantRole(pookyball.GAME(), address(rewards));
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
    uint256 amountPXP,
    bytes32 nonce,
    string memory data
  ) public returns (RewardsData memory rewardsData, bytes memory signature) {
    uint256 tokenId = mintPookyball(to, PookyballRarity.COMMON);

    RewardsPXP[] memory pxp = new RewardsPXP[](1);
    pxp[0] = RewardsPXP(tokenId, amountPXP);

    PookyballRarity[] memory pookyballs = new PookyballRarity[](1);
    pookyballs[0] = PookyballRarity.COMMON;

    bytes32[] memory nonces = new bytes32[](1);
    nonces[0] = nonce;

    rewardsData = RewardsData(amountNAT, amountPOK, pxp, pookyballs, nonces);
    signature = signRewards(to, rewardsData, data);
  }

  function test_roles() public {
    assertTrue(rewards.hasRole(rewards.DEFAULT_ADMIN_ROLE(), admin));
    assertTrue(rewards.hasRole(rewards.REWARDER(), rewarder));
  }

  function test_withdraw_revertNonAdmin(uint256 amount) public {
    deal(address(rewards), amount);

    vm.expectRevert(
      abi.encodePacked(
        "AccessControl: account ",
        Strings.toHexString(user),
        " is missing role ",
        Strings.toHexString(uint256(registry.DEFAULT_ADMIN_ROLE()), 32)
      )
    );

    hoax(user);
    uint256 balanceBefore = user.balance;
    rewards.withdraw();

    assertEq(user.balance, balanceBefore);
  }

  function test_withdraw_revertInvalidReceiver(uint256 amountNAT) public {
    vm.assume(amountNAT > 0);
    deal(address(rewards), amountNAT);

    InvalidReceiver receiver = new InvalidReceiver();
    vm.startPrank(admin);
    rewards.grantRole(rewards.DEFAULT_ADMIN_ROLE(), address(receiver));
    vm.stopPrank();

    vm.expectRevert(abi.encodeWithSelector(Rewards.TransferFailed.selector, address(receiver), amountNAT));
    vm.prank(address(receiver));
    rewards.withdraw();
  }

  function test_withdraw_pass(uint256 amount) public {
    deal(address(rewards), amount);

    hoax(admin, 0);
    uint256 balanceBefore = admin.balance;
    rewards.withdraw();

    assertEq(admin.balance, balanceBefore + amount);
  }

  function test_claim_revertInvalidSignature(
    uint256 amountNAT,
    uint256 amountPOK,
    uint256 amountPXP,
    bytes32 nonce,
    string memory data
  ) public {
    vm.assume(amountNAT < 100000000e18);

    (RewardsData memory rewardsData, bytes memory signature) =
      createRewards(user, amountNAT, amountPOK, amountPXP, nonce, data);

    rewardsData.amountNAT += 100;

    deal(address(rewards), amountNAT); // Ensure the rewards contract has enough native currency

    vm.expectRevert(Rewards.InvalidSignature.selector);
    vm.prank(user);
    rewards.claim(rewardsData, signature, data);
  }

  function test_claim_revertInsufficientBalance(
    uint256 amountNAT,
    uint256 missingNAT,
    uint256 amountPOK,
    uint256 amountPXP,
    bytes32 nonce,
    string memory data
  ) public {
    vm.assume(amountNAT > 0);
    missingNAT = bound(missingNAT, 1, amountNAT);

    (RewardsData memory rewardsData, bytes memory signature) =
      createRewards(user, amountNAT, amountPOK, amountPXP, nonce, data);

    deal(address(rewards), amountNAT - missingNAT);

    vm.expectRevert(abi.encodeWithSelector(Rewards.InsufficientBalance.selector, amountNAT, amountNAT - missingNAT));
    vm.prank(user);
    rewards.claim(rewardsData, signature, data);
  }

  function test_claim_revertAlreadyClaimedNonce(
    uint256 amountNAT,
    uint256 amountPOK,
    uint256 amountPXP,
    bytes32 nonce,
    string memory data
  ) public {
    (RewardsData memory rewardsData, bytes memory signature) =
      createRewards(user, amountNAT, amountPOK, amountPXP, nonce, data);

    deal(address(rewards), amountNAT); // Ensure the rewards contract has enough native currency

    vm.prank(operator);
    registry.set(nonce, true);

    vm.expectRevert(abi.encodeWithSelector(Rewards.AlreadyClaimed.selector, nonce));

    vm.prank(user);
    rewards.claim(rewardsData, signature, data);
  }

  function test_claim_revertTransferFailed(
    uint256 amountNAT,
    uint256 amountPOK,
    uint256 amountPXP,
    bytes32 nonce,
    string memory data
  ) public {
    vm.assume(amountNAT > 0);

    InvalidReceiver receiver = new InvalidReceiver();
    vm.startPrank(admin);
    rewards.grantRole(rewards.DEFAULT_ADMIN_ROLE(), address(receiver));
    vm.stopPrank();

    (RewardsData memory rewardsData, bytes memory signature) =
      createRewards(address(receiver), amountNAT, amountPOK, amountPXP, nonce, data);

    deal(address(rewards), amountNAT); // Ensure the rewards contract has enough native currency

    vm.expectRevert(abi.encodeWithSelector(Rewards.TransferFailed.selector, address(receiver), amountNAT));
    vm.prank(address(receiver));
    rewards.claim(rewardsData, signature, data);
  }

  function test_claim_pass(uint256 amountNAT, uint256 amountPOK, uint256 amountPXP, bytes32 nonce, string memory data)
    public
  {
    (RewardsData memory rewardsData, bytes memory signature) =
      createRewards(user, amountNAT, amountPOK, amountPXP, nonce, data);

    deal(address(rewards), amountNAT); // Ensure the rewards contract has enough native currency

    vm.expectEmit(true, false, false, false, address(rewards));
    emit RewardsClaimed(user, rewardsData, data);

    vm.prank(user);
    rewards.claim(rewardsData, signature, data);
  }
}
