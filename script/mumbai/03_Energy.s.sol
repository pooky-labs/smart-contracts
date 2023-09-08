// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

import { Script } from "forge-std/Script.sol";
import { Energy } from "@/common/Energy.sol";

contract DeployEnergy is Script {
  // address admin = 0xF00Db2f08D1F6b3f6089573085B5826Bb358e319;
  // address treasury = 0x2dfCa6e357a73D180B8e6aa8f7690A315a4395F7;
  address admin = 0x3CC4F4372F83ad3C577eD6e1Aae3D244A1b955D5; // Mainnet
  address treasury = 0x96224B6a800294F40c547f7Ec0952eA222526040; // Mainnet

  function run() public {
    bytes32 salt = keccak256(bytes(vm.envString("SALT")));
    uint256 deployerPK = vm.envUint("DEPLOYER_PK");

    vm.startBroadcast(deployerPK);
    address[] memory operators = new address[](1);
    operators[0] = 0x481074326aC46C7BC52f0b25D2F7Aaf40f586472;
    new Energy{salt: salt}(admin, operators, treasury, 5.88 ether);
    vm.stopBroadcast();
  }
}
