// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

import { VRFCoordinatorV2Interface } from "chainlink/interfaces/VRFCoordinatorV2Interface.sol";
import { Script } from "forge-std/Script.sol";
import { INonceRegistry } from "@/common/INonceRegistry.sol";
import { IPookyball } from "@/pookyball/IPookyball.sol";
import { Stickers } from "@/stickers/Stickers.sol";
import { StickersController } from "@/stickers/StickersController.sol";
import { StickersLevelUp } from "@/stickers/StickersLevelUp.sol";
import { StickersManager } from "@/stickers/StickersManager.sol";
import { StickersSale, Pack, PackContent } from "@/stickers/StickersSale.sol";
import { POK } from "@/tokens/POK.sol";
import { VRFConfig } from "@/types/VRFConfig.sol";

struct StickersConfig {
  VRFConfig vrf;
  Pack[] packs;
  address tSale;
  address tERC2981;
  address tLevelUp;
}

struct Config {
  IPookyball pookyball;
  POK pok;
  address admin;
  address signer;
  StickersConfig st;
}

contract DeployStickers is Script {
  function polygon() internal pure returns (Config memory) {
    Pack[] memory packs = new Pack[](4);
    packs[0] = Pack({
      price: 14 ether,
      supply: 0,
      minted: 0,
      totalSupply: 0,
      content: PackContent({ common: 2, rare: 0, epic: 0, legendary: 0 })
    });
    packs[1] = Pack({
      price: 49 ether,
      supply: 0,
      minted: 0,
      totalSupply: 0,
      content: PackContent({ common: 3, rare: 1, epic: 0, legendary: 0 })
    });
    packs[2] = Pack({
      price: 196,
      supply: 0,
      minted: 0,
      totalSupply: 0,
      content: PackContent({ common: 8, rare: 1, epic: 1, legendary: 0 })
    });
    packs[3] = Pack({
      price: 749,
      supply: 0,
      minted: 0,
      totalSupply: 0,
      content: PackContent({ common: 15, rare: 3, epic: 1, legendary: 1 })
    });

    return Config({
      pookyball: IPookyball(0xb4859acd9B0A65CA4897c31e5cb5160D9Ff32C0A),
      pok: POK(0x7b7E3B03f34b17d70C276C4886467D58867Bbc94),
      admin: 0x3CC4F4372F83ad3C577eD6e1Aae3D244A1b955D5,
      signer: 0xCAFE3e690bf74Ec274210E1c448130c1f8228513,
      st: StickersConfig({
        vrf: VRFConfig({
          coordinator: VRFCoordinatorV2Interface(0xAE975071Be8F8eE67addBC1A82488F1C24858067),
          keyHash: 0xcc294a196eeeb44da2888d17c0625cc88d70d9760a69d58d853ba6581a9ab0cd,
          subcriptionId: 586,
          minimumRequestConfirmations: 10,
          callbackGasLimit: 2500000
        }),
        packs: packs,
        tSale: 0x96224B6a800294F40c547f7Ec0952eA222526040,
        tERC2981: 0x598895F50951186eFdCB160764a538f353894027,
        tLevelUp: 0x703662853D7F9ad9D8c44128222266a736741437
      })
    });
  }

  function run() external {
    bytes32 salt = keccak256(bytes(vm.envString("SALT")));
    uint256 deployerPK = vm.envUint("DEPLOYER_PK");
    address deployer = vm.addr(deployerPK);

    vm.startBroadcast(deployerPK);
    Config memory c = polygon();

    Stickers stickers = new Stickers{salt: salt}(deployer, c.st.tERC2981, c.st.vrf);
    StickersController controller =
      new StickersController{salt: salt}(c.pookyball, stickers, deployer);
    StickersManager manager = new StickersManager{salt: salt}(controller);
    new StickersLevelUp{salt: salt}(stickers, c.pok, c.admin, c.signer, c.st.tLevelUp);
    StickersSale stickersSale =
      new StickersSale{salt: salt}(stickers, c.admin, c.st.tSale, c.st.packs);

    // StickersManager
    controller.grantRoles(address(manager), controller.LINKER() | controller.REPLACER());
    controller.transferOwnership(c.admin);

    // StickersSale
    stickers.grantRoles(address(stickersSale), stickers.MINTER());
    stickers.transferOwnership(c.admin);

    vm.stopBroadcast();
  }
}
