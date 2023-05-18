// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Test } from "forge-std/Test.sol";
import { StickerMint, StickerRarity } from "../../src/interfaces/IStickers.sol";
import { StickersSetup } from "../setup/StickersSetup.sol";

contract StickersTest is Test, StickersSetup {
  address public admin;
  address public minter = makeAddr("minter");
  address public game = makeAddr("game");
  address public user = makeAddr("user");

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
