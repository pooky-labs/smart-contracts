// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Test } from "forge-std/Test.sol";
import "forge-std/console.sol";
import { Strings } from "openzeppelin/utils/Strings.sol";
import { ECDSA } from "openzeppelin/utils/cryptography/ECDSA.sol";
import { NonceRegistry } from "../../src/game/NonceRegistry.sol";
import { Rewards, RewardsData, RewardsPXP } from "../../src/game/Rewards.sol";
import { PookyballRarity } from "../../src/types/PookyballRarity.sol";
import { POKSetup } from "../setup/POKSetup.sol";
import { PookyballSetup } from "../setup/PookyballSetup.sol";

contract RewardsTest is Test, POKSetup, PookyballSetup {
  using ECDSA for bytes32;

  NonceRegistry registry;
  Rewards rewards;

  address admin = makeAddr("admin");
  address operator = makeAddr("operator");
  address rewarder;
  uint256 privateKey;
  address user = makeAddr("user");

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

  function signRewards(address to, RewardsData memory rewardsData) public view returns (bytes memory) {
    bytes32 hash = keccak256(abi.encode(to, rewardsData, "")).toEthSignedMessageHash();
    (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKey, hash);
    return abi.encodePacked(r, s, v);
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

  function test_withdraw_pass(uint256 amount) public {
    deal(address(rewards), amount);

    hoax(admin, 0);
    uint256 balanceBefore = admin.balance;
    rewards.withdraw();

    assertEq(admin.balance, balanceBefore + amount);
  }

  function test_claim_revertInvalidSignature(uint256 amountNAT, uint256 amountPOK, uint256 amountPXP, bytes32 nonce)
    public
  {
    uint256 tokenId = mintPookyball(user);

    RewardsPXP[] memory pxp = new RewardsPXP[](1);
    pxp[0] = RewardsPXP(tokenId, amountPXP);

    PookyballRarity[] memory pookyballs = new PookyballRarity[](0);

    bytes32[] memory nonces = new bytes32[](1);
    nonces[0] = nonce;

    RewardsData memory rewardsData = RewardsData(amountNAT, amountPOK, pxp, pookyballs, nonces);
    bytes memory signature = signRewards(user, rewardsData);

    bytes32 hash = keccak256(abi.encode(user, rewardsData, "")).toEthSignedMessageHash();

    deal(address(rewards), amountNAT);

    assertEq(hash.recover(signature), rewarder);
    assertTrue(rewards.hasRole(rewards.REWARDER(), rewarder));

    vm.prank(user);
    rewards.claim(rewardsData, signature, "");
  }
}
