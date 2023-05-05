// SPDX-License-Identifier: MIT
// Pooky Game Contracts (game/StickersStorage.sol)
pragma solidity ^0.8.18;

interface IStickersStorage {
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
   * @notice Attach a Sticker to a Pookyball.
   * @param stickerId The Sticker token id.
   * @param pookyballId The Pookyball token id.
   * @dev Caution: no ownership checks are run.
   */
  function attach(uint256 stickerId, uint256 pookyballId) external;

  /**
   * @notice Detach (remove) a sticker from a Pookyball.
   * @param stickerId The Sticker token id.
   * @param recepient The address when to send the detached sticker.
   * If the address is the zero address, the Sticker is burned instead.
   */
  function detach(uint256 stickerId, address recepient) external;
}
