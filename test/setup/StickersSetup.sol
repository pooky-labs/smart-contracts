// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Test } from "forge-std/Test.sol";
import { console2 } from "forge-std/console2.sol";
import { Stickers } from "../../src/tokens/Stickers.sol";
import { VRFConfig } from "../../src/types/VRFConfig.sol";
import { VRFCoordinatorV2Setup } from "./VRFCoordinatorV2Setup.sol";

abstract contract StickersSetup is Test, VRFCoordinatorV2Setup {
  Stickers stickers;

  function setUp() public virtual override(VRFCoordinatorV2Setup) {
    super.setUp();

    vm.prank(makeAddr("admin"));
    uint64 subscriptionId = vrf.createSubscription();
    stickers = new Stickers(
      makeAddr("admin"),
      makeAddr("treasury"),
      VRFConfig(vrf, keccak256("foobar"), subscriptionId, 10, 2500000)
    );

    vm.prank(makeAddr("admin"));
    vrf.addConsumer(subscriptionId, address(stickers));
  }
}
