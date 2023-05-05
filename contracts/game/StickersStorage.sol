// SPDX-License-Identifier: MIT
// Pooky Game Contracts (game/StickersStorage.sol)
pragma solidity ^0.8.18;

import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { OwnableRoles } from "solady/src/auth/OwnableRoles.sol";
import { IPookyball } from "../interfaces/IPookyball.sol";
import { IStickers } from "../interfaces/IStickers.sol";
import { IStickersStorage } from "../interfaces/IStickersStorage.sol";

/**
 * @title StickersStorage
 * @author Mathieu Bour
 * @notice This contract contains the relationship data between the Pookyballs and the Stickers.
 * @dev This contract only handles the Pookyball <=> Sticker association and does not run any check.
 * It also have the {Stickers-OPERATOR} role, allowing to freely move the Stickers tokens.
 * When a Sticker is linked to a Pookyball, the Sticker is transfered to this contract so the original
 * owner cannot sell the token anymore on any platform.
 */
contract StickersStorage is IStickersStorage, OwnableRoles {
  using EnumerableSet for EnumerableSet.UintSet;

  // Roles
  uint256 public constant LINKER = _ROLE_0;
  uint256 public constant REMOVER = _ROLE_1;

  mapping(uint256 => uint256) private _links;
  mapping(uint256 => EnumerableSet.UintSet) private _slots;

  IPookyball public pookyball;
  IStickers public stickers;

  constructor(IPookyball _pookyball, IStickers _stickers, address admin) {
    pookyball = _pookyball;
    stickers = _stickers;

    _initializeOwner(admin);
  }

  /**
   * @notice Get the Pookyball token id linked to a Sticker.
   * @param stickerId The Sticker token id.
   */
  function attachedTo(uint256 stickerId) external view returns (uint256) {
    return _links[stickerId];
  }

  /**
   * @notice Get the Stickers token ids attahced to a Pookyball.
   * @param pookyballId The Pookyball token id.
   */
  function slots(uint256 pookyballId) external view returns (uint256[] memory) {
    return _slots[pookyballId].values();
  }

  /**
   * @notice Attach a Sticker to a Pookyball.
   * @param stickerId The Sticker token id.
   * @param pookyballId The Pookyball token id.
   * @dev Caution: no ownership checks are run.
   */
  function attach(uint256 stickerId, uint256 pookyballId) external onlyRolesOrOwner(LINKER) {
    _slots[pookyballId].add(stickerId);
    _links[stickerId] = pookyballId;
    stickers.transferFrom(stickers.ownerOf(stickerId), address(this), stickerId);
  }

  /**
   * @notice Detach (remove) a sticker from a Pookyball.
   * @param stickerId The Sticker token id.
   * @param recepient The address when to send the detached sticker.
   * If the address is the zero address, the Sticker is burned instead.
   */
  function detach(uint256 stickerId, address recepient) external onlyRolesOrOwner(REMOVER) {
    uint256 pookyballId = _links[stickerId];
    _slots[pookyballId].remove(stickerId);
    delete _links[stickerId];

    if (recepient != address(0)) {
      stickers.transferFrom(address(this), recepient, stickerId);
    } else {
      stickers.burn(stickerId);
    }
  }
}
