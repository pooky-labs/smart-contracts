// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Test } from "forge-std/Test.sol";
import { Pookyball } from "../../src/tokens/Pookyball.sol";
import { PookyballRarity } from "../../src/types/PookyballRarity.sol";
import { VRFCoordinatorV2Setup } from "./VRFCoordinatorV2Setup.sol";

abstract contract PookyballSetup is Test, VRFCoordinatorV2Setup {
  Pookyball pookyball;

  constructor() {
    address admin = makeAddr("admin");

    vm.startPrank(admin);
    uint64 subscriptionId = vrf.createSubscription();
    pookyball = new Pookyball(
      "https://metadata.pooky.gg/pookyballs",
      "https://metadata.pooky.gg/contracts/Pookyball",
      makeAddr("treasury"),
      address(vrf),
      keccak256("foobar"),
      subscriptionId,
      10,
      2500000
    );
    vrf.addConsumer(subscriptionId, address(pookyball));

    pookyball.grantRole(pookyball.MINTER(), makeAddr("minter"));
    pookyball.grantRole(pookyball.GAME(), makeAddr("game"));
    vm.stopPrank();
  }

  function randomPookyballRarity(uint256 seed) public view returns (PookyballRarity) {
    return PookyballRarity(bound(uint256(seed), uint256(PookyballRarity.COMMON), uint256(PookyballRarity.MYTHIC)));
  }

  function mintPookyball(address recipient, PookyballRarity rarity) public returns (uint256) {
    address[] memory recipients = new address[](1);
    recipients[0] = recipient;
    PookyballRarity[] memory rarities = new PookyballRarity[](1);
    rarities[0] = rarity;

    vm.prank(makeAddr("minter"));
    pookyball.mint(recipients, rarities);
    return pookyball.lastTokenId();
  }

  function mintPookyball(address recipient) public returns (uint256) {
    return mintPookyball(recipient, PookyballRarity.COMMON);
  }
}
