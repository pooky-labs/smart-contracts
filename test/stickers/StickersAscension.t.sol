// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { IERC721A } from "ERC721A/IERC721A.sol";
import { ECDSA } from "solady/utils/ECDSA.sol";
import { ITreasury } from "@/common/ITreasury.sol";
import { Signer } from "@/common/Signer.sol";
import { StickerMetadata, StickerRarity } from "@/stickers/IStickers.sol";
import { StickersAscension } from "@/stickers/StickersAscension.sol";
import { BaseTest } from "@test/BaseTest.sol";
import { StickersSetup } from "@test/setup/StickersSetup.sol";

contract StickersAscensionTest is BaseTest, StickersSetup {
  using ECDSA for bytes32;

  address public admin = makeAddr("admin");
  address public user = makeAddr("user");
  address public user2 = makeAddr("user2");

  address internal signer;
  uint256 internal privateKey;

  StickersAscension ascension;

  struct AscendablePass {
    StickerRarity input;
    StickerRarity output;
    uint248 level;
  }

  AscendablePass[] pass;

  function setUp() public {
    (signer, privateKey) = makeAddrAndKey("signer");
    ascension = new StickersAscension(stickers, admin, signer);

    vm.startPrank(admin);
    stickers.grantRoles(address(ascension), stickers.MINTER());
    vm.stopPrank();

    vm.prank(user);
    stickers.setApprovalForAll(address(ascension), true);

    pass.push(AscendablePass(StickerRarity.COMMON, StickerRarity.RARE, 40));
    pass.push(AscendablePass(StickerRarity.RARE, StickerRarity.EPIC, 60));
    pass.push(AscendablePass(StickerRarity.EPIC, StickerRarity.LEGENDARY, 80));
    pass.push(AscendablePass(StickerRarity.LEGENDARY, StickerRarity.MYTHIC, 100));
  }

  function test_isLevelMax() public {
    assertFalse(ascension.isLevelMax(StickerMetadata(39, StickerRarity.COMMON)));
    assertTrue(ascension.isLevelMax(StickerMetadata(40, StickerRarity.COMMON)));

    assertFalse(ascension.isLevelMax(StickerMetadata(59, StickerRarity.RARE)));
    assertTrue(ascension.isLevelMax(StickerMetadata(60, StickerRarity.RARE)));

    assertFalse(ascension.isLevelMax(StickerMetadata(79, StickerRarity.EPIC)));
    assertTrue(ascension.isLevelMax(StickerMetadata(80, StickerRarity.EPIC)));

    assertFalse(ascension.isLevelMax(StickerMetadata(99, StickerRarity.LEGENDARY)));
    assertTrue(ascension.isLevelMax(StickerMetadata(100, StickerRarity.LEGENDARY)));
  }

  function test_nextRarity_revertUnsupportedRarity() public {
    vm.expectRevert(
      abi.encodeWithSelector(StickersAscension.UnsupportedRarity.selector, StickerRarity.MYTHIC)
    );
    ascension.nextRarity(StickerRarity.MYTHIC);
  }

  function test_nextRarity_pass() public {
    assertTrue(ascension.nextRarity(StickerRarity.COMMON) == StickerRarity.RARE);
    assertTrue(ascension.nextRarity(StickerRarity.RARE) == StickerRarity.EPIC);
    assertTrue(ascension.nextRarity(StickerRarity.EPIC) == StickerRarity.LEGENDARY);
    assertTrue(ascension.nextRarity(StickerRarity.LEGENDARY) == StickerRarity.MYTHIC);
  }

  // ascend with two identical Stickers
  // ----------------------------------
  function _sign(uint256 sourceId, uint256 otherId) internal view returns (bytes memory) {
    bytes32 hash =
      keccak256(abi.encode(sourceId, otherId, address(ascension))).toEthSignedMessageHash();
    (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKey, hash);
    return abi.encodePacked(r, s, v);
  }

  function test_ascend_identical_revertSourceNotMax() public {
    uint256 sourceId = mintSticker(user, StickerRarity.COMMON);
    setStickerLevel(sourceId, 39);
    uint256 otherId = mintSticker(user, StickerRarity.COMMON);
    setStickerLevel(otherId, 40);

    vm.prank(user);
    vm.expectRevert(abi.encodeWithSelector(StickersAscension.Ineligible.selector, sourceId));
    ascension.ascend(sourceId, otherId, _sign(sourceId, otherId));
  }

  function test_ascend_identical_revertSourceNotOwner() public {
    uint256 sourceId = mintSticker(user2, StickerRarity.COMMON);
    setStickerLevel(sourceId, 40);
    uint256 otherId = mintSticker(user, StickerRarity.COMMON);
    setStickerLevel(otherId, 40);

    vm.prank(user);
    vm.expectRevert(abi.encodeWithSelector(StickersAscension.Ineligible.selector, sourceId));
    ascension.ascend(sourceId, otherId, _sign(sourceId, otherId));
  }

  function test_ascend_identical_revertOtherNotMax() public {
    uint256 sourceId = mintSticker(user, StickerRarity.COMMON);
    setStickerLevel(sourceId, 40);
    uint256 otherId = mintSticker(user, StickerRarity.COMMON);
    setStickerLevel(otherId, 39);

    vm.prank(user);
    vm.expectRevert(abi.encodeWithSelector(StickersAscension.Ineligible.selector, otherId));
    ascension.ascend(sourceId, otherId, _sign(sourceId, otherId));
  }

  function test_ascend_identical_revertOtherNotOwner() public {
    uint256 sourceId = mintSticker(user, StickerRarity.COMMON);
    setStickerLevel(sourceId, 40);
    uint256 otherId = mintSticker(user2, StickerRarity.COMMON);
    setStickerLevel(otherId, 40);

    vm.prank(user);
    vm.expectRevert(abi.encodeWithSelector(StickersAscension.Ineligible.selector, otherId));
    ascension.ascend(sourceId, otherId, _sign(sourceId, otherId));
  }

  function test_ascend_identical_revertRarityMismatch() public {
    uint256 sourceId = mintSticker(user, StickerRarity.COMMON);
    setStickerLevel(sourceId, 40);
    uint256 otherId = mintSticker(user, StickerRarity.RARE);
    setStickerLevel(otherId, 60);

    vm.prank(user);
    vm.expectRevert(
      abi.encodeWithSelector(
        StickersAscension.RarityMismatch.selector, StickerRarity.COMMON, StickerRarity.RARE
      )
    );
    ascension.ascend(sourceId, otherId, _sign(sourceId, otherId));
  }

  function test_ascend_identical_revertInvalidSignature() public {
    uint256 sourceId = mintSticker(user, StickerRarity.COMMON);
    setStickerLevel(sourceId, 40);
    uint256 otherId = mintSticker(user, StickerRarity.RARE);
    setStickerLevel(otherId, 40);

    vm.prank(user);
    vm.expectRevert(Signer.InvalidSignature.selector);
    ascension.ascend(sourceId, otherId, _sign(sourceId, 1000));
  }

  function test_ascend_identical_pass() public {
    for (uint256 i; i < pass.length; i++) {
      uint256 sourceId = mintSticker(user, pass[i].input);
      setStickerLevel(sourceId, pass[i].level);

      uint256 otherId = mintSticker(user, pass[i].input);
      setStickerLevel(otherId, pass[i].level);

      vm.prank(user);
      uint256 ascendedId = ascension.ascend(sourceId, otherId, _sign(sourceId, otherId));

      assertEq(stickers.ownerOf(ascendedId), user);

      vm.expectRevert(IERC721A.OwnerQueryForNonexistentToken.selector);
      stickers.ownerOf(sourceId);
      vm.expectRevert(IERC721A.OwnerQueryForNonexistentToken.selector);
      stickers.ownerOf(otherId);
    }
  }

  // ascend with three maxed Stickers
  // --------------------------------
  function test_ascend_three_revertSourceNotMax() public {
    uint256 sourceId = mintSticker(user, StickerRarity.COMMON);
    setStickerLevel(sourceId, 39);

    uint256[2] memory parts;
    for (uint256 i; i < parts.length; i++) {
      parts[i] = mintSticker(user, StickerRarity.COMMON);
      setStickerLevel(parts[i], 40);
    }

    vm.prank(user);
    vm.expectRevert(abi.encodeWithSelector(StickersAscension.Ineligible.selector, sourceId));
    ascension.ascend(sourceId, parts);
  }

  function test_ascend_three_revertSourceNotOwner() public {
    uint256 sourceId = mintSticker(user2, StickerRarity.COMMON);
    setStickerLevel(sourceId, 40);

    uint256[2] memory parts;
    for (uint256 i; i < parts.length; i++) {
      parts[i] = mintSticker(user, StickerRarity.COMMON);
      setStickerLevel(parts[i], 40);
    }

    vm.prank(user);
    vm.expectRevert(abi.encodeWithSelector(StickersAscension.Ineligible.selector, sourceId));
    ascension.ascend(sourceId, parts);
  }

  function test_ascend_three_revertPartsNotMax() public {
    uint256 sourceId = mintSticker(user, StickerRarity.COMMON);
    setStickerLevel(sourceId, 40);

    uint256[2] memory parts;
    for (uint256 i; i < parts.length; i++) {
      parts[i] = mintSticker(user, StickerRarity.COMMON);
      setStickerLevel(parts[i], 40);
    }

    setStickerLevel(parts[0], 39);

    vm.prank(user);
    vm.expectRevert(abi.encodeWithSelector(StickersAscension.Ineligible.selector, parts[0]));
    ascension.ascend(sourceId, parts);
  }

  function test_ascend_three_revertOtherNotOwner() public {
    uint256 sourceId = mintSticker(user, StickerRarity.COMMON);
    setStickerLevel(sourceId, 40);

    uint256[2] memory parts;
    for (uint256 i; i < parts.length; i++) {
      parts[i] = mintSticker(user, StickerRarity.COMMON);
      setStickerLevel(parts[i], 40);
    }

    vm.prank(user);
    stickers.transferFrom(user, user2, parts[0]);

    vm.prank(user);
    vm.expectRevert(abi.encodeWithSelector(StickersAscension.Ineligible.selector, parts[0]));
    ascension.ascend(sourceId, parts);
  }

  function test_ascend_three_revertRarityMismatch() public {
    uint256 sourceId = mintSticker(user, StickerRarity.COMMON);
    setStickerLevel(sourceId, 40);

    uint256[2] memory parts;
    parts[0] = mintSticker(user, StickerRarity.COMMON);
    setStickerLevel(parts[0], 40);
    parts[1] = mintSticker(user, StickerRarity.RARE);
    setStickerLevel(parts[1], 60);

    vm.prank(user);
    vm.expectRevert(
      abi.encodeWithSelector(
        StickersAscension.RarityMismatch.selector, StickerRarity.COMMON, StickerRarity.RARE
      )
    );
    ascension.ascend(sourceId, parts);
  }

  function test_ascend_three_pass() public {
    for (uint256 i; i < pass.length; i++) {
      uint256 sourceId = mintSticker(user, pass[i].input);
      setStickerLevel(sourceId, pass[i].level);

      uint256[2] memory parts = [mintSticker(user, pass[i].input), mintSticker(user, pass[i].input)];

      setStickerLevel(parts[0], pass[i].level);
      setStickerLevel(parts[1], pass[i].level);

      vm.prank(user);
      uint256 ascendedId = ascension.ascend(sourceId, parts);

      assertEq(stickers.ownerOf(ascendedId), user);

      vm.expectRevert(IERC721A.OwnerQueryForNonexistentToken.selector);
      stickers.ownerOf(sourceId);
      vm.expectRevert(IERC721A.OwnerQueryForNonexistentToken.selector);
      stickers.ownerOf(parts[0]);
      vm.expectRevert(IERC721A.OwnerQueryForNonexistentToken.selector);
      stickers.ownerOf(parts[1]);
    }
  }

  // ascend with three maxed Stickers
  // --------------------------------
  function test_ascend_sixe_revertSourceNotMax() public {
    uint256 sourceId = mintSticker(user, StickerRarity.COMMON);
    setStickerLevel(sourceId, 39);

    uint256[5] memory parts;
    for (uint256 i; i < parts.length; i++) {
      parts[i] = mintSticker(user, StickerRarity.COMMON);
      setStickerLevel(parts[i], 40);
    }

    vm.prank(user);
    vm.expectRevert(abi.encodeWithSelector(StickersAscension.Ineligible.selector, sourceId));
    ascension.ascend(sourceId, parts);
  }

  function test_ascend_six_revertSourceNotOwner() public {
    uint256 sourceId = mintSticker(user2, StickerRarity.COMMON);
    setStickerLevel(sourceId, 40);

    uint256[5] memory parts;
    for (uint256 i; i < parts.length; i++) {
      parts[i] = mintSticker(user, StickerRarity.COMMON);
      setStickerLevel(parts[i], 40);
    }

    vm.prank(user);
    vm.expectRevert(abi.encodeWithSelector(StickersAscension.Ineligible.selector, sourceId));
    ascension.ascend(sourceId, parts);
  }

  function test_ascend_six_revertOtherNotOwner() public {
    uint256 sourceId = mintSticker(user, StickerRarity.COMMON);
    setStickerLevel(sourceId, 40);

    uint256[5] memory parts;
    for (uint256 i; i < parts.length; i++) {
      parts[i] = mintSticker(user, StickerRarity.COMMON);
      setStickerLevel(parts[i], 40);
    }

    vm.prank(user);
    stickers.transferFrom(user, user2, parts[0]);

    vm.prank(user);
    vm.expectRevert(abi.encodeWithSelector(StickersAscension.Ineligible.selector, parts[0]));
    ascension.ascend(sourceId, parts);
  }

  function test_ascend_six_revertRarityMismatch() public {
    uint256 sourceId = mintSticker(user, StickerRarity.COMMON);
    setStickerLevel(sourceId, 40);

    uint256[5] memory parts;
    parts[0] = mintSticker(user, StickerRarity.RARE);
    setStickerLevel(parts[0], 60);
    for (uint256 i = 1; i < parts.length; i++) {
      parts[i] = mintSticker(user, StickerRarity.COMMON);
      setStickerLevel(parts[i], 40);
    }

    vm.prank(user);
    vm.expectRevert(
      abi.encodeWithSelector(
        StickersAscension.RarityMismatch.selector, StickerRarity.COMMON, StickerRarity.RARE
      )
    );
    ascension.ascend(sourceId, parts);
  }

  function test_ascend_six_pass() public {
    for (uint256 i; i < pass.length; i++) {
      uint256 sourceId = mintSticker(user, pass[i].input);
      setStickerLevel(sourceId, pass[i].level);

      uint256[5] memory parts;
      for (uint256 j; j < 5; j++) {
        parts[j] = mintSticker(user, pass[i].input);
        setStickerLevel(parts[j], pass[i].level);
      }

      vm.prank(user);
      uint256 ascendedId = ascension.ascend(sourceId, parts);

      assertEq(stickers.ownerOf(ascendedId), user);

      vm.expectRevert(IERC721A.OwnerQueryForNonexistentToken.selector);
      stickers.ownerOf(sourceId);

      for (uint256 j; j < 5; j++) {
        vm.expectRevert(IERC721A.OwnerQueryForNonexistentToken.selector);
        stickers.ownerOf(parts[j]);
      }
    }
  }
}