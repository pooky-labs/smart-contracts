// SPDX-License-Identifier: MIT
// Pooky Game Contracts (test/tokens/Stickers.t.sol)
pragma solidity ^0.8.19;

import { Test } from "forge-std/Test.sol";
import { console2 } from "forge-std/console2.sol";
import { StickerMint, StickerRarity } from "../../src/interfaces/IStickers.sol";
import { StickersSetup } from "../setup/StickersSetup.sol";

contract StickersTest is Test, StickersSetup {
  address admin;
  address minter = makeAddr("minter");
  address game = makeAddr("game");
  address user = makeAddr("user");

  function setUp() public {
    admin = stickers.owner();
  }

  function testMintOneCommon() public {
    vm.prank(minter);
    StickerMint[] memory requests = new StickerMint[](1);
    requests[0] = StickerMint(user, StickerRarity.COMMON);
    stickers.mint(requests);
  }
}
