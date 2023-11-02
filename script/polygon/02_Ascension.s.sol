// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

import { Script } from "forge-std/Script.sol";
import { NonceRegistry } from "@/common/NonceRegistry.sol";
import { Rewards } from "@/common/Rewards.sol";
import { Pookyball } from "@/pookyball/Pookyball.sol";
import { PookyballAscension } from "@/pookyball/PookyballAscension.sol";
import { PookyballLevelUp } from "@/pookyball/PookyballLevelUp.sol";
import { Stickers } from "@/stickers/Stickers.sol";
import { IStickersController } from "@/stickers/IStickersController.sol";
import { StickersAscension } from "@/stickers/StickersAscension.sol";
import { POK } from "@/tokens/POK.sol";

contract DeployAscension is Script {
  Pookyball pookyball = Pookyball(0xb4859acd9B0A65CA4897c31e5cb5160D9Ff32C0A);
  IStickersController controller = IStickersController(0x75cc3c6329930758659eD87338B926c90e16d05F);

  address signer = 0xCAFE3e690bf74Ec274210E1c448130c1f8228513;
  address admin = 0x3CC4F4372F83ad3C577eD6e1Aae3D244A1b955D5;
  address treasury = 0x703662853D7F9ad9D8c44128222266a736741437;

  function run() public {
    uint256 deployerPK = vm.envUint("DEPLOYER_PK");

    vm.startBroadcast(deployerPK);
    new PookyballAscension(pookyball, controller, admin, signer, treasury);
    vm.stopBroadcast();

    // Need to grant the Pookyball.MINTER and StickersController.REMOVER role to PookyballAscension
  }
}
