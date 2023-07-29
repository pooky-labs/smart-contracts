// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

import { VRFCoordinatorV2Interface } from
  "chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import { Script } from "forge-std/Script.sol";
import { Rewards } from "../src/game/Rewards.sol";
import { StickersController } from "../src/game/StickersController.sol";
import { StickersLevelUp } from "../src/game/StickersLevelUp.sol";
import { StickersManager } from "../src/game/StickersManager.sol";
import { INonceRegistry } from "../src/interfaces/INonceRegistry.sol";
import { Pookyball } from "../src/tokens/Pookyball.sol";
import { POK } from "../src/tokens/POK.sol";
import { Stickers } from "../src/tokens/Stickers.sol";
import { VRFConfig } from "../src/types/VRFConfig.sol";

/**
 * @notice This is a temporary script to speed up the deployments on Mumbai.
 * This code should not be used on production in any way.
 */
contract DeployStickers is Script {
  address constant admin = 0xF00Db2f08D1F6b3f6089573085B5826Bb358e319;
  address constant rewarder = 0xCAFE3e690bf74Ec274210E1c448130c1f8228513;
  address constant treasury_secondary = 0x2dfCa6e357a73D180B8e6aa8f7690A315a4395F7;
  address constant treasury_level_up = 0x2dfCa6e357a73D180B8e6aa8f7690A315a4395F7;

  INonceRegistry nonces = INonceRegistry(0xCD6d1949be58A4165718bD87EC35b0Ab8B956f55);
  POK constant pok = POK(0x3aaB86a3FF752530BbE21a5b5a6A73005f11E348);
  Pookyball constant pookyball = Pookyball(0x3f64DD5BE5E19dD34744EFcC74c1935004aeB270);

  VRFCoordinatorV2Interface coordinator =
    VRFCoordinatorV2Interface(0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed);

  function vrf() internal view returns (VRFConfig memory) {
    return VRFConfig({
      coordinator: coordinator,
      keyHash: 0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f,
      subcriptionId: 2307,
      minimumRequestConfirmations: 10,
      callbackGasLimit: 2500000
    });
  }

  function run() external {
    uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PK");
    vm.startBroadcast(deployerPrivateKey);

    VRFConfig memory vrfConfig = vrf();
    Stickers stickers = new Stickers(admin, treasury_secondary, vrfConfig);
    StickersController controller = new StickersController(pookyball, stickers, admin);
    StickersManager manager = new StickersManager(controller);
    StickersLevelUp stickersLevelUp = new StickersLevelUp(stickers, pok, admin, treasury_level_up);

    address[] memory rewarders = new address[](1);
    rewarders[0] = rewarder;
    Rewards rewards = new Rewards(pok, pookyball, stickers, nonces, admin, rewarders);
    vm.stopBroadcast();
  }
}
