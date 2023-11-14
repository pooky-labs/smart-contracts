// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

import { Script } from "forge-std/Script.sol";
import { Stickers } from "@/stickers/Stickers.sol";
import { StickersController } from "@/stickers/StickersController.sol";
import { StickersAscension } from "@/stickers/StickersAscension.sol";

contract DeployPookyballAscension is Script {
  StickersController controller = StickersController(0x430288ee1c16B4e8b6B5DD6a76d24cA4d1Dfe8C7);
  Stickers stickers = Stickers(address(controller.stickers()));

  address signer = 0xCAFE3e690bf74Ec274210E1c448130c1f8228513;

  function run() public {
    bytes32 salt = keccak256(bytes(vm.envString("SALT")));
    uint256 deployerPK = vm.envUint("DEPLOYER_PK");
    uint256 adminPK = vm.envUint("ADMIN_PK");
    address admin = vm.addr(adminPK);

    vm.startBroadcast(deployerPK);
    StickersAscension ascension = new StickersAscension{salt: salt}(controller, admin, signer);
    vm.stopBroadcast();

    vm.startBroadcast(adminPK);
    stickers.grantRoles(address(ascension), stickers.MINTER());
    controller.grantRoles(address(ascension), controller.REMOVER());
    vm.stopBroadcast();
  }
}
