// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Test } from "forge-std/Test.sol";
import { StickerMint, StickerRarity } from "../../src/interfaces/IStickers.sol";
import { Stickers } from "../../src/tokens/Stickers.sol";
import { VRFConfig } from "../../src/types/VRFConfig.sol";
import { VRFCoordinatorV2Setup } from "./VRFCoordinatorV2Setup.sol";

abstract contract StickersSetup is Test, VRFCoordinatorV2Setup {
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
    return StickerRarity(bound(uint256(seed), uint256(StickerRarity.COMMON), uint256(StickerRarity.MYTHIC)));
  }

  function mintSticker(address recipient, StickerRarity rarity) public returns (uint256) {
    StickerMint[] memory requests = new StickerMint[](1);
    requests[0] = StickerMint(recipient, rarity);

    vm.prank(makeAddr("minter"));
    stickers.mint(requests);
    return stickers.nextTokenId() - 1;
  }
}
