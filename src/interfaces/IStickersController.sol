// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { IStickers } from "@/interfaces/IStickers.sol";
import { IPookyball } from "@/interfaces/IPookyball.sol";

/// @author Mathieu Bour for Pooky Labs Ltd.
interface IStickersController {
  /// @notice Fired when a sticker is attached to a Pookyball.
  event StickerAttached(uint256 stickerId, uint256 pookyballId);
  /// @notice Fired when a sticker is replace from a Pookyball.
  event StickerReplaced(uint256 stickerId, uint256 previousStickerId, uint256 pookyballId);
  /// @notice Fired when a sticker is detached from a Pookyball.
  event StickerDetached(uint256 stickerId, uint256 pookyballId);

  /// @notice Thrown when a sticker is invalid.
  error InvalidSticker(uint256 stickerId);

  /// @notice The Stickers ERC-721 contract.
  function stickers() external view returns (IStickers);

  /// @notice The Pookyball ERC-721 contract.
  function pookyball() external view returns (IPookyball);

  /// @notice Get the Pookyball token id linked to a Sticker.
  /// @param stickerId The Sticker token id.
  function attachedTo(uint256 stickerId) external view returns (uint256);

  /// @notice Get the Stickers token ids attahced to a Pookyball.
  /// @param pookyballId The Pookyball token id.
  function slots(uint256 pookyballId) external view returns (uint256[] memory);

  /// @notice Attach a sticker to a Pookyball.
  /// @param stickerId The sticker token id.
  /// @param pookyballId The Pookyball token id.
  /// @dev Caution: no ownership checks are run.
  function attach(uint256 stickerId, uint256 pookyballId) external;

  /// @notice Replace a sticker from a Pookyball, burning the previous one.
  /// @param stickerId The sticker token id.
  /// @param previousStickerId The previous sticker token id that will be burned.
  /// @param pookyballId The Pookyball token id.
  /// @dev Caution: no ownership checks are run.
  function replace(uint256 stickerId, uint256 previousStickerId, uint256 pookyballId) external;

  /// @notice Detach (remove) a sticker from a Pookyball.
  /// @param stickerId The Sstickerticker token id.
  /// @param recepient The address when to send the detached sticker.
  function detach(uint256 stickerId, address recepient) external;
}
