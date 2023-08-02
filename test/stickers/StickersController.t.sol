// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { IERC721A } from "ERC721A/IERC721A.sol";
import { IStickersController } from "@/stickers/IStickersController.sol";
import { StickersController } from "@/stickers/StickersController.sol";
import { IStickers } from "@/stickers/IStickers.sol";
import { BaseTest } from "@test/BaseTest.sol";
import { StickersControllerSetup } from "@test/setup/StickersControllerSetup.sol";

contract StickersControllerTest is BaseTest, StickersControllerSetup {
  address public user = makeAddr("user");

  event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

  function testFuzz_attach(uint256 stickerRaritySeed, uint8 pookyballRaritySeed) public {
    uint256 stickerId = mintSticker(user, randomStickerRarity(stickerRaritySeed));
    uint256 pookyballId = mintPookyball(user, randomPookyballRarity(pookyballRaritySeed));

    assertEq(controller.slots(pookyballId), new uint[](0));

    vm.prank(user);
    stickers.setApprovalForAll(address(controller), true);

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

  function testFuzz_detach(uint256 stickerRaritySeed, uint8 pookyballRaritySeed) public {
    uint256 stickerId = mintSticker(user, randomStickerRarity(stickerRaritySeed));
    uint256 pookyballId = mintPookyball(user, randomPookyballRarity(pookyballRaritySeed));

    vm.prank(user);
    stickers.setApprovalForAll(address(controller), true);

    vm.prank(linker);
    controller.attach(stickerId, pookyballId);
    assertEq(stickers.ownerOf(stickerId), address(controller));

    vm.prank(remover);
    controller.detach(stickerId, user);
    assertEq(stickers.ownerOf(stickerId), user);
  }

  function testFuzz_replace_revertInvalidSticker(
    uint256 stickerSeed1,
    uint256 stickerSeed2,
    uint8 pookyballSeed
  ) public {
    uint256 stickerId1 = mintSticker(user, randomStickerRarity(stickerSeed1));
    uint256 stickerId2 = mintSticker(user, randomStickerRarity(stickerSeed2));
    uint256 pookyballId = mintPookyball(user, randomPookyballRarity(pookyballSeed));

    vm.expectRevert(abi.encodeWithSelector(IStickersController.InvalidSticker.selector, stickerId1));
    vm.prank(replacer);
    controller.replace(stickerId2, stickerId1, pookyballId);
  }

  function testFuzz_replace_pass(uint256 stickerRaritySeed, uint8 pookyballRaritySeed) public {
    uint256 stickerId1 = mintSticker(user, randomStickerRarity(stickerRaritySeed));
    uint256 stickerId2 =
      mintSticker(user, randomStickerRarity(stickerRaritySeed & pookyballRaritySeed));
    uint256 pookyballId = mintPookyball(user, randomPookyballRarity(pookyballRaritySeed));

    vm.prank(user);
    stickers.setApprovalForAll(address(controller), true);

    vm.prank(linker);
    controller.attach(stickerId1, pookyballId);
    assertEq(stickers.ownerOf(stickerId1), address(controller));

    vm.prank(replacer);
    controller.replace(stickerId2, stickerId1, pookyballId);

    // Assert that stickerId1 was burned
    vm.expectRevert(IERC721A.OwnerQueryForNonexistentToken.selector);
    stickers.ownerOf(stickerId1);
  }
}
