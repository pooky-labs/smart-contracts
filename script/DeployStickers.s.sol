// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

import { VRFCoordinatorV2Interface } from
  "chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import { Script } from "forge-std/Script.sol";
import { PookyballLevelUp } from "@/game/PookyballLevelUp.sol";
import { Rewards } from "@/game/Rewards.sol";
import { StickersController } from "@/game/StickersController.sol";
import { StickersLevelUp } from "@/game/StickersLevelUp.sol";
import { StickersManager } from "@/game/StickersManager.sol";
import { StickersSale, Pack, PackContent } from "@/mint/StickersSale.sol";
import { INonceRegistry } from "@/interfaces/INonceRegistry.sol";
import { Pookyball } from "@/tokens/Pookyball.sol";
import { POK } from "@/tokens/POK.sol";
import { Stickers } from "@/tokens/Stickers.sol";
import { VRFConfig } from "@/types/VRFConfig.sol";

struct StickersConfig {
  VRFConfig vrf;
  Pack[] packs;
  address tSale;
  address tERC2981;
  address tLevelUp;
}

struct Config {
  Pookyball pookyball;
  POK pok;
  address admin;
  address signer;
  StickersConfig st;
}

/**
 * @notice This is a temporary script to speed up the deployments on Mumbai.
 * This code should not be used on production in any way.
 *
 * Usage:
 * SALT=mysalt forge script ./script/DeployStickers.s.sol --rpc-url mumbai --broadcast --verify
 */
contract DeployStickers is Script {
  function mumbai() internal pure returns (Config memory) {
    Pack[] memory packs = new Pack[](4);
    packs[0] = Pack({
      price: 8 ether,
      supply: 45,
      minted: 0,
      totalSupply: 0,
      content: PackContent({ common: 2, rare: 0, epic: 0, legendary: 0 })
    });
    packs[1] = Pack({
      price: 28 ether,
      supply: 40,
      minted: 0,
      totalSupply: 0,
      content: PackContent({ common: 3, rare: 1, epic: 0, legendary: 0 })
    });
    packs[2] = Pack({
      price: 112 ether,
      supply: 12,
      minted: 0,
      totalSupply: 0,
      content: PackContent({ common: 8, rare: 1, epic: 1, legendary: 0 })
    });
    packs[3] = Pack({
      price: 416 ether,
      supply: 3,
      minted: 0,
      totalSupply: 0,
      content: PackContent({ common: 16, rare: 2, epic: 1, legendary: 1 })
    });

    return Config({
      pookyball: Pookyball(0x3f64DD5BE5E19dD34744EFcC74c1935004aeB270),
      pok: POK(0x3aaB86a3FF752530BbE21a5b5a6A73005f11E348),
      admin: 0xF00Db2f08D1F6b3f6089573085B5826Bb358e319,
      signer: 0xCAFE3e690bf74Ec274210E1c448130c1f8228513,
      st: StickersConfig({
        vrf: VRFConfig({
          coordinator: VRFCoordinatorV2Interface(0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed),
          keyHash: 0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f,
          subcriptionId: 2307,
          minimumRequestConfirmations: 10,
          callbackGasLimit: 2500000
        }),
        packs: packs,
        tSale: 0x2dfCa6e357a73D180B8e6aa8f7690A315a4395F7,
        tERC2981: 0x2dfCa6e357a73D180B8e6aa8f7690A315a4395F7,
        tLevelUp: 0x2dfCa6e357a73D180B8e6aa8f7690A315a4395F7
      })
    });
  }

  function run() external {
    bytes32 salt = keccak256(bytes(vm.envString("SALT")));
    uint256 deployerPK = vm.envUint("DEPLOYER_PK");

    vm.startBroadcast(deployerPK);
    Config memory c = mumbai();

    Stickers stickers = new Stickers{salt: salt}(c.admin, c.st.tERC2981, c.st.vrf);
    StickersController controller =
      new StickersController{salt: salt}(c.pookyball, stickers, c.admin);
    StickersManager manager = new StickersManager{salt: salt}(controller);
    StickersLevelUp stickersLevelUp =
      new StickersLevelUp{salt: salt}(stickers, c.pok, c.admin, c.signer, c.st.tLevelUp);

    StickersSale stickersSale =
      new StickersSale{salt: salt}(stickers, c.admin, c.st.tSale, c.st.packs);
    vm.stopBroadcast();

    // Admin actions (mumbai only)
    uint256 adminPK = 0;
    adminPK = vm.envOr("ADMIN_PK", adminPK);
    if (adminPK == 0) {
      return;
    }

    vm.startBroadcast(adminPK);
    // Stickers
    c.st.vrf.coordinator.addConsumer(c.st.vrf.subcriptionId, address(stickers));

    // StickersManager
    controller.grantRoles(address(manager), controller.LINKER() | controller.REPLACER());

    // StickersSale
    stickers.grantRoles(address(stickersSale), stickers.MINTER());

    // StickersLevelUp
    c.pok.grantRole(c.pok.BURNER(), address(stickersLevelUp));
    vm.stopBroadcast();
  }
}
