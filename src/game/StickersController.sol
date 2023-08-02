// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { EnumerableSet } from "openzeppelin/utils/structs/EnumerableSet.sol";
import { OwnableRoles } from "solady/auth/OwnableRoles.sol";
import { IPookyball } from "@/interfaces/IPookyball.sol";
import { IStickers } from "@/interfaces/IStickers.sol";
import { IStickersController } from "@/interfaces/IStickersController.sol";

/// @title StickersController
/// @author Mathieu Bour for Pooky Labs Ltd.
///
/// @notice This contract contains the relationship data between the Pookyballs and the Stickers.
/// @dev This contract only handles the Pookyball <=> Sticker association and does not run any check.
/// It also have the {Stickers-OPERATOR} role, allowing to freely move the Stickers tokens.
/// When a Sticker is linked to a Pookyball, the Sticker is transfered to this contract so the original
/// owner cannot sell the token anymore on any platform.
contract StickersController is IStickersController, OwnableRoles {
  using EnumerableSet for EnumerableSet.UintSet;

  // Roles
  uint256 public constant LINKER = _ROLE_0;
  uint256 public constant REPLACER = _ROLE_1;
  uint256 public constant REMOVER = _ROLE_2;

  mapping(uint256 => uint256) private _links;
  mapping(uint256 => EnumerableSet.UintSet) private _slots;

  IPookyball public immutable pookyball;
  IStickers public immutable stickers;

  constructor(IPookyball _pookyball, IStickers _stickers, address admin) {
    pookyball = _pookyball;
    stickers = _stickers;

    _initializeOwner(admin);
  }

  /// @notice Get the Pookyball token id linked to a Sticker.
  /// @param stickerId The Sticker token id.
  function attachedTo(uint256 stickerId) external view returns (uint256) {
    return _links[stickerId];
  }

  /// @notice Get the Sticker token ids attached to a Pookyball.
  /// @param pookyballId The Pookyball token id.
  function slots(uint256 pookyballId) external view returns (uint256[] memory) {
    return _slots[pookyballId].values();
  }

  /// @notice Attach a Sticker to a Pookyball (internal).
  /// @param stickerId The Sticker token id.
  /// @param pookyballId The Pookyball token id.
  /// @dev Caution: no role/ownership checks are run.
  function _attach(uint256 stickerId, uint256 pookyballId) internal {
    _slots[pookyballId].add(stickerId);
    _links[stickerId] = pookyballId;
    stickers.transferFrom(stickers.ownerOf(stickerId), address(this), stickerId);
  }

  /// @notice Attach a Sticker to a Pookyball.
  /// @param stickerId The Sticker token id.
  /// @param pookyballId The Pookyball token id.
  /// @dev Caution: no token ownership checks are run.
  function attach(uint256 stickerId, uint256 pookyballId) public onlyRolesOrOwner(LINKER) {
    _attach(stickerId, pookyballId);
    emit StickerAttached(stickerId, pookyballId);
  }

  /// @notice Replace a sticker from a Pookyball, burning the previous one.
  /// @param stickerId The Sticker token id.
  /// @param previousStickerId The previous Sticker token id that will be burned.
  /// @param pookyballId The Pookyball token id.
  /// @dev Caution: no token ownership checks are run.
  function replace(uint256 stickerId, uint256 previousStickerId, uint256 pookyballId)
    public
    onlyRolesOrOwner(REPLACER)
  {
    if (!_slots[pookyballId].contains(previousStickerId)) {
      revert InvalidSticker(previousStickerId);
    }

    _slots[pookyballId].remove(previousStickerId);
    delete _links[previousStickerId];
    stickers.burn(previousStickerId);
    _attach(stickerId, pookyballId);
    emit StickerReplaced(stickerId, previousStickerId, pookyballId);
  }

  /// @notice Detach (remove) a Sticker from a Pookyball.
  /// @param stickerId The Sticker token id.
  /// @param recepient The address when to send the detached Sticker.
  /// @dev Caution: no token ownership checks are run.
  function detach(uint256 stickerId, address recepient) external onlyRolesOrOwner(REMOVER) {
    uint256 pookyballId = _links[stickerId];
    _slots[pookyballId].remove(stickerId);
    delete _links[stickerId];
    stickers.transferFrom(address(this), recepient, stickerId);
    emit StickerDetached(stickerId, pookyballId);
  }
}
