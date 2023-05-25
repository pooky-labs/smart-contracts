// SPDX-License-Identifier: MIT
// Pooky Game Contracts (POK.sol)
pragma solidity ^0.8.20;

import { VRFCoordinatorV2Interface } from
  "chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import { VRFConsumerBaseV2 } from "chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import { ERC2981 } from "openzeppelin/token/common/ERC2981.sol";
import { IERC165 } from "openzeppelin/utils/introspection/IERC165.sol";
import { ERC721A } from "ERC721A/ERC721A.sol";
import { ERC721ABurnable } from "ERC721A/extensions/ERC721ABurnable.sol";
import { ERC721AQueryable } from "ERC721A/extensions/ERC721AQueryable.sol";
import { IERC721A } from "ERC721A/IERC721A.sol";
import { DefaultOperatorFilterer } from "operator-filter-registry/src/DefaultOperatorFilterer.sol";
import { OwnableRoles } from "solady/auth/OwnableRoles.sol";
import { IStickers, StickerMetadata, StickerRarity, StickerMint } from "../interfaces/IStickers.sol";
import { VRFConfig } from "../types/VRFConfig.sol";

contract Stickers is
  IStickers,
  ERC721ABurnable,
  ERC721AQueryable,
  ERC2981,
  OwnableRoles,
  VRFConsumerBaseV2,
  DefaultOperatorFilterer
{
  // Roles
  uint256 public constant OPERATOR = _ROLE_0;
  uint256 public constant MINTER = _ROLE_1;
  uint256 public constant GAME = _ROLE_2;

  /// Secondary sales royalties, over 10,000 (5%)
  uint96 public constant ROYALTY = 500;

  /**
   * @notice The prefix of all the Pookyball metadata.
   */
  string public baseURI = "https://metadata.pooky.gg/stickers/";

  /**
   * @notice URI of the contract-level metadata.
   * Specified by OpenSea documentation (https://docs.opensea.io/docs/contract-level-metadata).
   */
  string public contractURI = "https://metadata.pooky.gg/contracts/Stickers";

  /// Last minted tokenId, will always exist
  uint256 public lastTokenId;

  /// Tokens gameplay metadata, see {PookyballMetadata}
  mapping(uint256 => StickerMetadata) _metadata;

  // VRF parameters
  VRFConfig vrf;
  mapping(uint256 => uint256) vrfRequests;

  constructor(address admin, address _receiver, VRFConfig memory _vrf)
    ERC721A("Pooky Stickers", "STK")
    VRFConsumerBaseV2(address(_vrf.coordinator))
  {
    _initializeOwner(admin);
    _setDefaultRoyalty(_receiver, ROYALTY);
    vrf = _vrf;
  }

  modifier onlyExists(uint256 tokenId) {
    if (!_exists(tokenId)) {
      revert NonExistentToken(tokenId);
    }

    _;
  }

  // ----- ERC721A patches -----
  /**
   * @dev Stickers starts at token id 1.
   */
  function _startTokenId() internal view virtual override returns (uint256) {
    return 1;
  }

  /**
   * @dev This allow to iterate over the token ids.
   */
  function nextTokenId() external view returns (uint256) {
    return _nextTokenId();
  }

  // ----- Metadata -----
  /**
   * @notice Set the URI of the contract-level metadata.
   * @dev We keep this function as an escape hatch in case of a migration to another token metadata platform.
   * Requirements:
   * - Only owner can set the contract URI.
   */
  function setContractURI(string memory newContractURI) external onlyOwner {
    contractURI = newContractURI;
  }

  /**
   * @notice Override the ERC721A _baseURI with a state variable.
   */
  function _baseURI() internal view override returns (string memory) {
    return baseURI;
  }

  /**
   * @notice Change the base URI of the tokens URI.
   * @dev We keep this function as an escape hatch in case of a migration to another token metadata platform.
   * Requirements:
   * - Only owner can set can set base URI.
   */
  function setBaseURI(string memory newBaseURI) external onlyOwner {
    baseURI = newBaseURI;
  }

  /**
   * @notice PookyballMetadata of the token {tokenId}.
   * @dev Requirements:
   * - Pookyball {tokenId} should exist (minted and not burned).
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
   * @notice Change the secondary sale royalties receiver address.
   * @dev Requirements:
   * - Only owner can set can set base URI.
   */
  function setERC2981Receiver(address newReceiver) external onlyOwner {
    _setDefaultRoyalty(newReceiver, ROYALTY);
  }

  /**
   * @notice Mint a new Pookyball token with a given rarity. Level, PXP and seed are set to zero, entropy is
   * requested to the VRF coordinator.
   * @dev Requirements:
   * - sender must have the MINTER role or be the owner.
   */
  function mint(StickerMint[] memory requests) external onlyRolesOrOwner(MINTER) returns (uint256) {
    uint256 l = requests.length;

    for (uint256 i = 0; i < l;) {
      _mint(requests[i].recipient, ++lastTokenId);
      _metadata[lastTokenId] = StickerMetadata(0, 0, requests[i].rarity);

      unchecked {
        i++;
      }
    }

    uint256 requestId = vrf.coordinator.requestRandomWords(
      vrf.keyHash,
      vrf.subcriptionId,
      vrf.minimumRequestConfirmations,
      vrf.callbackGasLimit,
      uint32(l)
    );
    vrfRequests[requestId] = lastTokenId;

    return lastTokenId;
  }

  /**
   * @notice Change the level of a Pookyball token.
   * @dev Requirements:
   * - sender must have the GAME role.
   * - Pookyball {tokenId} should exist (minted and not burned).
   */
  function setLevel(uint256 tokenId, uint128 newLevel)
    external
    onlyExists(tokenId)
    onlyRolesOrOwner(GAME)
  {
    _metadata[tokenId].level = newLevel;
    emit LevelChanged(tokenId, newLevel);
  }

  /**
   * @notice Receive the entropy from the VRF coordinator.
   * @dev randomWords will only have one word as entropy is requested per token.
   */
  function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
    uint256 tokenId = vrfRequests[requestId];

    // Apply the random words
    for (uint256 i = 0; i < randomWords.length; i++) {
      _metadata[tokenId - i].seed = randomWords[i];
      emit SeedSet(tokenId - i, randomWords[i]);
    }
  }

  /**
   * Allow Pooky's privileged contracts to operate on Stickers with approbabtion.
   * This behavior might be revoked in the future.
   * @dev See {IERC721A-isApprovedForAll}.
   */
  function isApprovedForAll(address owner, address operator)
    public
    view
    override(ERC721A, IERC721A)
    returns (bool)
  {
    if (hasAllRoles(operator, OPERATOR)) {
      return true;
    }

    return super.isApprovedForAll(owner, operator);
  }

  // ---- Operator Filter Registry ----
  /**
   * Operator Filter Registry implementation.
   * @dev See {IERC721A-setApprovalForAll}.
   */
  function setApprovalForAll(address operator, bool approved)
    public
    override(ERC721A, IERC721A)
    onlyAllowedOperatorApproval(operator)
  {
    super.setApprovalForAll(operator, approved);
  }

  /**
   * Operator Filter Registry implementation.
   * @dev See {IERC721A-approve}.
   */
  function approve(address operator, uint256 tokenId)
    public
    payable
    override(ERC721A, IERC721A)
    onlyAllowedOperatorApproval(operator)
  {
    super.approve(operator, tokenId);
  }

  /**
   * Operator Filter Registry implementation.
   * @dev See {IERC721A-transferFrom}.
   */
  function transferFrom(address from, address to, uint256 tokenId)
    public
    payable
    override(ERC721A, IERC721A)
    onlyAllowedOperator(from)
  {
    super.transferFrom(from, to, tokenId);
  }

  /**
   * Operator Filter Registry implementation.
   * @dev See {IERC721A-safeTransferFrom}.
   */
  function safeTransferFrom(address from, address to, uint256 tokenId)
    public
    payable
    override(ERC721A, IERC721A)
    onlyAllowedOperator(from)
  {
    super.safeTransferFrom(from, to, tokenId);
  }

  /**
   * Operator Filter Registry implementation.
   * @dev See {IERC721A-safeTransferFrom}.
   */
  function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data)
    public
    payable
    override(ERC721A, IERC721A)
    onlyAllowedOperator(from)
  {
    super.safeTransferFrom(from, to, tokenId, data);
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
    override(ERC721A, IERC721A, ERC2981)
    returns (bool)
  {
    return super.supportsInterface(interfaceId) || ERC721A.supportsInterface(interfaceId);
  }
}
