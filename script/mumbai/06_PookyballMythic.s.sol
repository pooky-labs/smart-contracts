// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

import { Script } from "forge-std/Script.sol";
import { NonceRegistry } from "@/common/NonceRegistry.sol";
import { Rewards } from "@/common/Rewards.sol";
import { Pookyball } from "@/pookyball/Pookyball.sol";
import { PookyballAscension } from "@/pookyball/PookyballAscension.sol";
import { StickersController } from "@/stickers/StickersController.sol";

contract DeployAscension is Script {
  Pookyball pookyball = Pookyball(0x3f64DD5BE5E19dD34744EFcC74c1935004aeB270);
  StickersController controller = StickersController(0x430288ee1c16B4e8b6B5DD6a76d24cA4d1Dfe8C7);

  address signer = 0xCAFE3e690bf74Ec274210E1c448130c1f8228513;
  address treasury = 0x2dfCa6e357a73D180B8e6aa8f7690A315a4395F7;

  function run() public {
    bytes32 salt = keccak256(bytes(vm.envString("SALT")));
    uint256 deployerPK = vm.envUint("DEPLOYER_PK");
    uint256 adminPK = vm.envUint("ADMIN_PK");
    address admin = vm.addr(adminPK);

    vm.startBroadcast(deployerPK);
    PookyballAscension pookyballAscension =
      new PookyballAscension{salt: salt}(pookyball, controller, admin, signer, treasury);
    vm.stopBroadcast();

    vm.startBroadcast(adminPK);
    pookyball.grantRole(pookyball.MINTER(), address(pookyballAscension));
    controller.grantRoles(address(pookyballAscension), controller.REMOVER());
    vm.stopBroadcast();
  }
}
