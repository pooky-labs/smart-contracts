// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { StickerMint, StickerRarity } from "@/stickers/IStickers.sol";
import { Stickers } from "@/stickers/Stickers.sol";
import { VRFConfig } from "@/types/VRFConfig.sol";
import { VRFCoordinatorV2Setup } from "@test/setup/VRFCoordinatorV2Setup.sol";
import { BaseTest } from "@test/BaseTest.sol";

abstract contract StickersSetup is BaseTest, VRFCoordinatorV2Setup {
  Stickers public stickers;

  constructor() {
    address admin = makeAddr("admin");
    vm.startPrank(admin);
    uint64 subscriptionId = vrf.createSubscription();
    stickers = new Stickers(
      admin,
      makeAddr("treasury"),
      VRFConfig(vrf, keccak256("foobar"), subscriptionId, 10, 2500000)
    );
    vrf.addConsumer(subscriptionId, address(stickers));

    stickers.grantRoles(makeAddr("minter"), stickers.MINTER());
    stickers.grantRoles(makeAddr("game"), stickers.GAME());
    vm.stopPrank();
  }

  function randomStickerRarity(uint256 seed) public view returns (StickerRarity) {
    return StickerRarity(
      bound(uint256(seed), uint256(StickerRarity.COMMON), uint256(StickerRarity.MYTHIC))
    );
  }

  function mintSticker(address recipient, StickerRarity rarity) public returns (uint256) {
    StickerRarity[] memory rarities = new StickerRarity[](1);
    rarities[0] = rarity;

    vm.prank(makeAddr("minter"));
    stickers.mint(recipient, rarities);
    return stickers.nextTokenId() - 1;
  }

  function mintSticker(address recipient) public returns (uint256) {
    return mintSticker(recipient, StickerRarity.COMMON);
  }
}
