// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { Pookyball } from "@/pookyball/Pookyball.sol";
import { PookyballRarity } from "@/pookyball/IPookyball.sol";
import { BaseTest } from "@test/BaseTest.sol";
import { VRFCoordinatorV2Setup } from "@test/setup/VRFCoordinatorV2Setup.sol";

abstract contract PookyballSetup is BaseTest, VRFCoordinatorV2Setup {
  Pookyball public pookyball;

  constructor() {
    address admin = makeAddr("admin");

    vm.startPrank(admin);
    uint64 subscriptionId = vrf.createSubscription();
    pookyball = new Pookyball(
      "https://metadata.pooky.gg/pookyballs/",
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

  function randomPookyballRarity(uint8 seed) public view returns (PookyballRarity) {
    return randomPookyballRarity(seed, PookyballRarity.COMMON, PookyballRarity.MYTHIC);
  }

  function randomPookyballRarity(uint8 seed, PookyballRarity min, PookyballRarity max)
    public
    view
    returns (PookyballRarity)
  {
    return PookyballRarity(bound(uint8(seed), uint8(min), uint8(max)));
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

  function setPookyballLevel(uint256 tokenId, uint256 level) internal {
    vm.prank(makeAddr("game"));
    pookyball.setLevel(tokenId, level);
  }
}
