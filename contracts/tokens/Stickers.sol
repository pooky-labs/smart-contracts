// SPDX-License-Identifier: MIT
// Pooky Game Contracts (POK.sol)
pragma solidity =0.8.18;

import { VRFCoordinatorV2Interface } from "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import { VRFConsumerBaseV2 } from "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import { ERC2981 } from "@openzeppelin/contracts/token/common/ERC2981.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { ERC721A } from "erc721a/contracts/ERC721A.sol";
import { ERC721ABurnable } from "erc721a/contracts/extensions/ERC721ABurnable.sol";
import { ERC721AQueryable } from "erc721a/contracts/extensions/ERC721AQueryable.sol";
import { IERC721A } from "erc721a/contracts/IERC721A.sol";
import { DefaultOperatorFilterer } from "operator-filter-registry/src/DefaultOperatorFilterer.sol";
import { OwnableRoles } from "solady/src/auth/OwnableRoles.sol";
import { IStickers } from "../interfaces/IStickers.sol";
import { StickerMetadata } from "../types/StickerMetadata.sol";
import { StickerRarity } from "../types/StickerRarity.sol";

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
  string public baseURI = "https://metadata.pooky.gg/stickers";

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
  VRFCoordinatorV2Interface vrfCoordinator;
  bytes32 public vrfKeyHash;
  uint64 public vrfSubId;
  uint16 public vrfMinimumRequestConfirmations;
  uint32 public vrfCallbackGasLimit;
  mapping(uint256 => uint256) vrfRequests;

  constructor(
    address admin,
    address _receiver,
    address _vrfCoordinator,
    bytes32 _vrfKeyHash,
    uint64 _vrfSubId,
    uint16 _vrfMinimumRequestConfirmations,
    uint32 _vrfCallbackGasLimit
  ) ERC721A("Pooky Stickers", "STK") VRFConsumerBaseV2(_vrfCoordinator) {
    vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
    vrfKeyHash = _vrfKeyHash;
    vrfSubId = _vrfSubId;
    vrfMinimumRequestConfirmations = _vrfMinimumRequestConfirmations;
    vrfCallbackGasLimit = _vrfCallbackGasLimit;

    _setDefaultRoyalty(_receiver, ROYALTY);
    _initializeOwner(admin);
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
  function metadata(uint256 tokenId) external view onlyExists(tokenId) returns (StickerMetadata memory) {
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
   * - `recipients` and `rarities` arguments must have the same size
   */
  function mint(
    address[] memory recipients,
    StickerRarity[] memory rarities
  ) external onlyRolesOrOwner(MINTER) returns (uint256) {
    uint256 l = recipients.length;
    // Check the arguments length
    if (l != rarities.length) {
      revert ArgumentSizeMismatch(l, rarities.length);
    }

    for (uint i = 0; i < l; ) {
      _mint(recipients[i], ++lastTokenId);
      _metadata[lastTokenId] = StickerMetadata(0, 0, rarities[i]);

      unchecked {
        i++;
      }
    }

    uint256 requestId = vrfCoordinator.requestRandomWords(
      vrfKeyHash,
      vrfSubId,
      vrfMinimumRequestConfirmations,
      vrfCallbackGasLimit,
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
  function setLevel(uint256 tokenId, uint128 newLevel) external onlyExists(tokenId) onlyRolesOrOwner(GAME) {
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
    for (uint i = 0; i < randomWords.length; i++) {
      _metadata[tokenId - i].seed = randomWords[i];
      emit SeedSet(tokenId - i, randomWords[i]);
    }
  }

  /**
   * Allow Pooky's privileged contracts to operate on Stickers with approbabtion.
   * This behavior might be revoked in the future.
   * @dev See {IERC721A-isApprovedForAll}.
   */
  function isApprovedForAll(address owner, address operator) public view override(ERC721A, IERC721A) returns (bool) {
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
  function setApprovalForAll(
    address operator,
    bool approved
  ) public override(ERC721A, IERC721A) onlyAllowedOperatorApproval(operator) {
    super.setApprovalForAll(operator, approved);
  }

  /**
   * Operator Filter Registry implementation.
   * @dev See {IERC721A-approve}.
   */
  function approve(
    address operator,
    uint256 tokenId
  ) public payable override(ERC721A, IERC721A) onlyAllowedOperatorApproval(operator) {
    super.approve(operator, tokenId);
  }

  /**
   * Operator Filter Registry implementation.
   * @dev See {IERC721A-transferFrom}.
   */
  function transferFrom(
    address from,
    address to,
    uint256 tokenId
  ) public payable override(ERC721A, IERC721A) onlyAllowedOperator(from) {
    super.transferFrom(from, to, tokenId);
  }

  /**
   * Operator Filter Registry implementation.
   * @dev See {IERC721A-safeTransferFrom}.
   */
  function safeTransferFrom(
    address from,
    address to,
    uint256 tokenId
  ) public payable override(ERC721A, IERC721A) onlyAllowedOperator(from) {
    super.safeTransferFrom(from, to, tokenId);
  }

  /**
   * Operator Filter Registry implementation.
   * @dev See {IERC721A-safeTransferFrom}.
   */
  function safeTransferFrom(
    address from,
    address to,
    uint256 tokenId,
    bytes memory data
  ) public payable override(ERC721A, IERC721A) onlyAllowedOperator(from) {
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
  function supportsInterface(
    bytes4 interfaceId
  ) public view virtual override(ERC721A, IERC721A, ERC2981) returns (bool) {
    return super.supportsInterface(interfaceId);
  }
}
