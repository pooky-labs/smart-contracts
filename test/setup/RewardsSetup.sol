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
