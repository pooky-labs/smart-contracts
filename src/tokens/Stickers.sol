// SPDX-License-Identifier: MIT
// Pooky Game Contracts (tokens/POK.sol)
pragma solidity ^0.8.20;

import { ERC721A } from "ERC721A/ERC721A.sol";
import { IERC721A } from "ERC721A/IERC721A.sol";
import { OwnableRoles } from "solady/auth/OwnableRoles.sol";
import { BaseERC721A } from "../base/BaseERC721A.sol";
import { IBaseERC721A } from "../interfaces/IBaseERC721A.sol";
import { IStickers, StickerMetadata, StickerRarity, StickerMint } from "../interfaces/IStickers.sol";
import { VRFConfig } from "../types/VRFConfig.sol";

contract Stickers is IStickers, BaseERC721A, OwnableRoles {
  // Roles
  uint256 public constant OPERATOR = _ROLE_0;
  uint256 public constant MINTER = _ROLE_1;
  uint256 public constant GAME = _ROLE_2;

  /// Tokens gameplay metadata, see {PookyballMetadata}
  mapping(uint256 => StickerMetadata) _metadata;

  constructor(address admin, address _receiver, VRFConfig memory _vrf)
    BaseERC721A(
      admin,
      "Pooky Stickers",
      "STK",
      "https://metadata.pooky.gg/stickers/",
      "https://metadata.pooky.gg/contracts/Stickers.json",
      _vrf,
      _receiver,
      500 // 5% royalties by default
    )
  { }

  /**
   * @param owner The token owner.
   * @param operator The operator.
   */
  function isApprovedForAll(address owner, address operator)
    public
    view
    override(ERC721A, IERC721A)
    returns (bool)
  {
    return hasAllRoles(operator, OPERATOR) || super.isApprovedForAll(owner, operator);
  }

  /**
   * @notice PookyballMetadata of the token {tokenId}.
   * @dev Requirements:
   * - Sticker {tokenId} should exist (minted and not burned).
   */
  function metadata(uint256 tokenId)
    external
    view
    onlyExists(tokenId)
    returns (StickerMetadata memory)
  {
    return _metadata[tokenId];
  }

  /**
   * @notice Change the level of a Pookyball token.
   * @dev Requirements:
   * - sender must have the GAME role or be the owner.
   * - Sticker {tokenId} should exist (minted and not burned).
   */
  function setLevel(uint256 tokenId, uint248 newLevel)
    external
    onlyExists(tokenId)
    onlyRolesOrOwner(GAME)
  {
    _metadata[tokenId].level = newLevel;
    emit LevelChanged(tokenId, newLevel);
  }

  /**
   * @notice Mint a new Pookyball token with a given rarity.
   * Level and seed are set to zero, entropy is requested to the VRF coordinator.
   * @dev Requirements:
   * - sender must have the MINTER role or be the owner.
   */
  function mint(address recipient, StickerRarity[] memory rarities)
    external
    onlyRolesOrOwner(MINTER)
  {
    uint256 quantity = rarities.length;
    uint256 start = _nextTokenId();

    _mint(recipient, quantity);

    for (uint256 i = 0; i < quantity;) {
      _metadata[start + i] = StickerMetadata(
        0, // Stickers are level 0 by default
        rarities[i]
      );

      unchecked {
        i++;
      }
    }
  }

  // ----- ERC165 -----
  /**
   * @notice IERC165 declaration.
   * @dev Supports the following `interfaceId`s:
   * - IERC165: 0x01ffc9a7
   * - IERC721: 0x80ac58cd
   * - IERC721Metadata: 0x5b5e139f
   * - IERC2981: 0x2a55205a
   */
  function supportsInterface(bytes4 interfaceId)
    public
    view
    virtual
    override(BaseERC721A, IBaseERC721A)
    returns (bool)
  {
    return super.supportsInterface(interfaceId);
  }
}
