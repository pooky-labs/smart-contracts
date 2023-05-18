// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Test } from "forge-std/Test.sol";
import { StickersController } from "../../src/game/StickersController.sol";
import { IStickers } from "../../src/interfaces/IStickers.sol";
import { IERC721A } from "ERC721A/IERC721A.sol";
import { StickersControllerSetup } from "../setup/StickersControllerSetup.t.sol";

contract StickersControllerTest is Test, StickersControllerSetup {
  address public user = makeAddr("user");

  event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

  function test_attach(uint256 stickerRaritySeed, uint256 pookyballRaritySeed) public {
    uint256 stickerId = mintSticker(user, randomStickerRarity(stickerRaritySeed));
    uint256 pookyballId = mintPookyball(user, randomPookyballRarity(pookyballRaritySeed));

    assertEq(controller.slots(pookyballId), new uint[](0));

    vm.prank(linker);

    vm.expectEmit(true, true, true, true, address(stickers));
    emit Transfer(user, address(controller), stickerId);

    controller.attach(stickerId, pookyballId);

    assertEq(stickers.ownerOf(stickerId), address(controller));
    uint256[] memory slots = new uint[](1);
    slots[0] = stickerId;
    assertEq(controller.slots(pookyballId), slots);
    assertEq(controller.attachedTo(stickerId), pookyballId);
  }

  function test_detach(uint256 stickerRaritySeed, uint256 pookyballRaritySeed) public {
    uint256 stickerId = mintSticker(user, randomStickerRarity(stickerRaritySeed));
    uint256 pookyballId = mintPookyball(user, randomPookyballRarity(pookyballRaritySeed));

    vm.prank(linker);
    controller.attach(stickerId, pookyballId);
    assertEq(stickers.ownerOf(stickerId), address(controller));

    vm.prank(remover);
    controller.detach(stickerId, user);
    assertEq(stickers.ownerOf(stickerId), user);
  }

  function test_replace(uint256 stickerRaritySeed, uint256 pookyballRaritySeed) public {
    uint256 stickerId1 = mintSticker(user, randomStickerRarity(stickerRaritySeed));
    uint256 stickerId2 = mintSticker(user, randomStickerRarity(stickerRaritySeed & pookyballRaritySeed));
    uint256 pookyballId = mintPookyball(user, randomPookyballRarity(pookyballRaritySeed));

    vm.prank(linker);
    controller.attach(stickerId1, pookyballId);
    assertEq(stickers.ownerOf(stickerId1), address(controller));

    vm.prank(replacer);
    controller.replace(stickerId2, stickerId1, pookyballId);

    // // Assert that stickerId1 was burned
    // vm.expectRevert(IERC721A.OwnerQueryForNonexistentToken.selector);
    // stickers.ownerOf(stickerId1);
  }
}
