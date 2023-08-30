// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

import { Script } from "forge-std/Script.sol";
import { NonceRegistry } from "@/common/NonceRegistry.sol";
import { Rewards } from "@/common/Rewards.sol";
import { Pookyball } from "@/pookyball/Pookyball.sol";
import { PookyballAscension } from "@/pookyball/PookyballAscension.sol";
import { PookyballLevelUp } from "@/pookyball/PookyballLevelUp.sol";
import { Stickers } from "@/stickers/Stickers.sol";
import { StickersAscension } from "@/stickers/StickersAscension.sol";
import { POK } from "@/tokens/POK.sol";

contract DeployAscension is Script {
  POK pok = POK(0x3aaB86a3FF752530BbE21a5b5a6A73005f11E348);
  Pookyball pookyball = Pookyball(0x3f64DD5BE5E19dD34744EFcC74c1935004aeB270);
  Stickers stickers = Stickers(0x34813041a976B03ABde279139E5B5D9a8AdB00De);
  NonceRegistry nonces = NonceRegistry(0xCD6d1949be58A4165718bD87EC35b0Ab8B956f55);

  address signer = 0xCAFE3e690bf74Ec274210E1c448130c1f8228513;
  address treasury = 0x2dfCa6e357a73D180B8e6aa8f7690A315a4395F7;

  function run() public {
    bytes32 salt = keccak256(bytes(vm.envString("SALT")));
    uint256 deployerPK = vm.envUint("DEPLOYER_PK");
    uint256 adminPK = vm.envUint("ADMIN_PK");
    address admin = vm.addr(adminPK);

    vm.startBroadcast(deployerPK);
    PookyballLevelUp levelUp =
      new PookyballLevelUp{salt: salt}(pookyball, pok, admin, signer, treasury);

    address[] memory rewarders = new address[](1);
    rewarders[0] = signer;
    Rewards rewards = new Rewards{salt: salt}(pok, pookyball, stickers, nonces, admin, rewarders);
    PookyballAscension pookyballAscension =
      new PookyballAscension{salt: salt}(pookyball, admin, signer, treasury);
    StickersAscension stickersAscension = new StickersAscension{salt: salt}(stickers, admin, signer);
    vm.stopBroadcast();

    vm.startBroadcast(adminPK);
    pok.grantRole(pok.BURNER(), address(levelUp));
    pok.grantRole(pookyball.MINTER(), address(rewards));
    pookyball.grantRole(pookyball.MINTER(), address(rewards));
    stickers.grantRoles(address(rewards), stickers.MINTER());
    nonces.grantRole(nonces.OPERATOR(), address(rewards));

    pookyball.grantRole(pookyball.MINTER(), address(pookyballAscension));
    stickers.grantRoles(address(stickersAscension), stickers.MINTER());
    vm.stopBroadcast();
  }
}
