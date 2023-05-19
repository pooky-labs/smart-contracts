// SPDX-License-Identifier: MIT
// Pooky Game Contracts (interfaces/IStickersController.sol)
pragma solidity ^0.8.19;

import { IStickers } from "./IStickers.sol";
import { IPookyball } from "./IPookyball.sol";

interface IStickersController {
  error InvalidSticker(uint256 stickerId);

  function stickers() external view returns (IStickers);
  function pookyball() external view returns (IPookyball);

  /**
   * @notice Get the Pookyball token id linked to a Sticker.
   * @param stickerId The Sticker token id.
   */
  function attachedTo(uint256 stickerId) external view returns (uint256);

  /**
   * @notice Get the Stickers token ids attahced to a Pookyball.
   * @param pookyballId The Pookyball token id.
   */
  function slots(uint256 pookyballId) external view returns (uint256[] memory);

  /**
   * @notice Attach a sticker to a Pookyball.
   * @param stickerId The sticker token id.
   * @param pookyballId The Pookyball token id.
   * @dev Caution: no ownership checks are run.
   */
  function attach(uint256 stickerId, uint256 pookyballId) external;

  /**
   * @notice Replace a sticker from a Pookyball, burning the previous one.
   * @param stickerId The sticker token id.
   * @param previousStickerId The previous sticker token id that will be burned.
   * @param pookyballId The Pookyball token id.
   * @dev Caution: no ownership checks are run.
   */
  function replace(uint256 stickerId, uint256 previousStickerId, uint256 pookyballId) external;

  /**
   * @notice Detach (remove) a sticker from a Pookyball.
   * @param stickerId The Sstickerticker token id.
   * @param recepient The address when to send the detached sticker.
   */
  function detach(uint256 stickerId, address recepient) external;
}
