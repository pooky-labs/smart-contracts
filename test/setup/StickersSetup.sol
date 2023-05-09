// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Test } from "forge-std/Test.sol";
import { console2 } from "forge-std/console2.sol";
import { Stickers } from "../../src/tokens/Stickers.sol";
import { VRFConfig } from "../../src/types/VRFConfig.sol";
import { VRFCoordinatorV2Setup } from "./VRFCoordinatorV2Setup.sol";

abstract contract StickersSetup is Test, VRFCoordinatorV2Setup {
  Stickers stickers;

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
}
