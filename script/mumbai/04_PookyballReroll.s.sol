// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

import { Script } from "forge-std/Script.sol";
import { NonceRegistry } from "@/common/NonceRegistry.sol";
import { IPookyball } from "@/pookyball/IPookyball.sol";
import { PookyballReroll } from "@/pookyball/PookyballReroll.sol";

contract DeployPookyballReroll is Script {
  NonceRegistry nonces = NonceRegistry(0xCD6d1949be58A4165718bD87EC35b0Ab8B956f55);
  IPookyball pookyball = IPookyball(0x3f64DD5BE5E19dD34744EFcC74c1935004aeB270);
  address signer = 0xCAFE3e690bf74Ec274210E1c448130c1f8228513;
  address treasury = 0x2dfCa6e357a73D180B8e6aa8f7690A315a4395F7;

  function run() public {
    bytes32 salt = keccak256(bytes(vm.envString("SALT")));
    uint256 deployerPK = vm.envUint("DEPLOYER_PK");
    uint256 adminPK = vm.envUint("ADMIN_PK");
    address admin = vm.addr(adminPK);

    vm.startBroadcast(deployerPK);
    PookyballReroll reroll =
      new PookyballReroll{salt: salt}(pookyball, nonces, admin, signer, treasury);
    vm.stopBroadcast();

    vm.startBroadcast(adminPK);
    nonces.grantRole(nonces.OPERATOR(), address(reroll));
    vm.stopBroadcast();
  }
}
