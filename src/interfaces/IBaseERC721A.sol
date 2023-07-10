// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { IERC721A } from "ERC721A/IERC721A.sol";
import { IERC721ABurnable } from "ERC721A/extensions/IERC721ABurnable.sol";
import { IERC721AQueryable } from "ERC721A/extensions/IERC721AQueryable.sol";
import { IERC165 } from "openzeppelin/interfaces/IERC165.sol";
import { IERC2981 } from "openzeppelin/interfaces/IERC2981.sol";

interface IBaseERC721A is IERC165, IERC721A, IERC721ABurnable, IERC721AQueryable, IERC2981 {
  /// Fired when the seed of a Pookyball token is set by the VRFCoordinator,
  event SeedSet(uint256 indexed tokenId, uint256 seed);

  /// Thrown when the token {tokenId} does not exist.
  error NonExistentToken(uint256 tokenId);

  function supportsInterface(bytes4 interfaceId)
    external
    view
    override(IERC165, IERC721A)
    returns (bool);
}
