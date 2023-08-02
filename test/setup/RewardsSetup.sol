// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { Ownable } from "solady/auth/Ownable.sol";
import { ECDSA } from "solady/utils/ECDSA.sol";
import { NonceRegistry } from "@/common/NonceRegistry.sol";
import { Rewards, RewardsData } from "@/common/Rewards.sol";
import { PookyballRarity } from "@/pookyball/IPookyball.sol";
import { StickerRarity } from "@/stickers/IStickers.sol";
import { BaseTest } from "@test/BaseTest.sol";
import { POKSetup } from "@test/setup/POKSetup.sol";
import { PookyballSetup } from "@test/setup/PookyballSetup.sol";
import { StickersSetup } from "@test/setup/StickersSetup.sol";
import { InvalidReceiver } from "@test/utils/InvalidReceiver.sol";

contract RewardsSetup is BaseTest, POKSetup, PookyballSetup, StickersSetup {
  using ECDSA for bytes32;

  NonceRegistry public registry;
  Rewards public rewards;

  address public admin = makeAddr("admin");
  address public operator = makeAddr("operator");
  address public rewarder;
  uint256 public privateKey;
  address public user = makeAddr("user");

  event RewardsClaimed(address indexed account, RewardsData rewards, string data);

  constructor() {
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
}
