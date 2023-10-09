// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

import { Script } from "forge-std/Script.sol";
import { NonceRegistry } from "@/common/NonceRegistry.sol";
import { IPookyball } from "@/pookyball/IPookyball.sol";
import { PookyballReroll } from "@/pookyball/PookyballReroll.sol";

contract DeployPookyballReroll is Script {
  NonceRegistry nonces = NonceRegistry(0xB08Ee469Dcf9c40B77261d8665A8BbdFad22B818);
  IPookyball pookyball = IPookyball(0xb4859acd9B0A65CA4897c31e5cb5160D9Ff32C0A);
  address admin = 0x3CC4F4372F83ad3C577eD6e1Aae3D244A1b955D5;
  address signer = 0xCAFE3e690bf74Ec274210E1c448130c1f8228513;
  address treasury = 0x703662853D7F9ad9D8c44128222266a736741437;

  function run() public {
    bytes32 salt = keccak256(bytes(vm.envString("SALT")));
    uint256 deployerPK = vm.envUint("DEPLOYER_PK");

    vm.startBroadcast(deployerPK);
    new PookyballReroll{salt: salt}(pookyball, nonces, admin, signer, treasury);
    vm.stopBroadcast();
  }
}
