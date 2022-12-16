// SPDX-License-Identifier: MIT
// Pooky Game Contracts (Pookyball.sol)
pragma solidity ^0.8.17;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "operator-filter-registry/src/DefaultOperatorFilterer.sol";
import "../interfaces/IPookyball.sol";
import "../types/PookyballMetadata.sol";
import "../types/PookyballRarity.sol";

/**
 * @title Pookyball
 * @author Pooky Engineering Team
 *
 * @notice Pookyball is ERC721 token representing Pookyball NFTs. Balls are mintable by other Pooky game contracts.
 * This contract does not hold any aspect of the Pooky gameplay and only serves as Pookyball information storage.
 *
 * Roles:
 * - DEFAULT_ADMIN_ROLE can add/remove roles.
 * - MINTER role can mint new tokens.
 * - GAME role can change the mutable token metadata (level and PXP).
 */
contract Pookyball is IPookyball, ERC721, AccessControl, VRFConsumerBaseV2, DefaultOperatorFilterer {
  using Strings for uint256;

  // Roles
  bytes32 public constant MINTER = keccak256("MINTER");
  bytes32 public constant GAME = keccak256("GAME");

  string public baseURI;

  /**
   * @notice URI of the contract-level metadata.
   * Specified by OpenSea documentation (https://docs.opensea.io/docs/contract-level-metadata).
   */
  string public contractURI;

  uint256 public lastTokenId;
  mapping(uint256 => PookyballMetadata) _metadata;

  // VRF parameters
  VRFCoordinatorV2Interface vrfCoordinator;
  bytes32 public vrfKeyHash;
  uint64 public vrfSubId;
  uint16 public vrfMinimumRequestConfirmations;
  uint32 public vrfCallbackGasLimit;
  mapping(uint256 => uint256) vrfRequests;

  event SeedSet(uint256 indexed tokenId, uint256 seed);
  event LevelChanged(uint256 indexed tokenId, uint256 level);
  event PXPChanged(uint256 indexed tokenId, uint256 amount);

  constructor(
    string memory _baseURI,
    string memory _contractURI,
    address _vrfCoordinator,
    bytes32 _vrfKeyHash,
    uint64 _vrfSubId,
    uint16 _vrfMinimumRequestConfirmations,
    uint32 _vrfCallbackGasLimit
  ) ERC721("Pookyball", "PKYB") VRFConsumerBaseV2(_vrfCoordinator) {
    baseURI = _baseURI;
    contractURI = _contractURI;

    vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
    vrfKeyHash = _vrfKeyHash;
    vrfSubId = _vrfSubId;
    vrfMinimumRequestConfirmations = _vrfMinimumRequestConfirmations;
    vrfCallbackGasLimit = _vrfCallbackGasLimit;

    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
  }

  /**
   * @notice Set the URI of the contract-level metadata.
   * @dev We keep this function as an escape hatch in case of a migration to another token metadata platform.
   * Requirements:
   * - Only DEFAULT_ADMIN_ROLE role can set the contract URI.
   */
  function setContractURI(string memory newContractURI) external onlyRole(DEFAULT_ADMIN_ROLE) {
    contractURI = newContractURI;
  }

  /**
   * @notice Change the base URI of the tokens URI.
   * @dev We keep this function as an escape hatch in case of a migration to another token metadata platform.
   * Requirements:
   * - Only DEFAULT_ADMIN_ROLE role can set base URI.
   */
  function setBaseURI(string memory newBaseURI) external onlyRole(DEFAULT_ADMIN_ROLE) {
    baseURI = newBaseURI;
  }

  /**
   * @notice Metadata URI of the token {tokenId}.
   * @dev See {IERC721Metadata-tokenURI}.
   * Requirements:
   * - Ball {tokenId} should exist (minted and not burned).
   */
  function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
    _requireMinted(tokenId);
    return string(abi.encodePacked(baseURI, tokenId.toString()));
  }

  /**
   * @notice PookyballMetadata the token {tokenId}.
   * @dev Requirements:
   * - Pookyball {tokenId} should exist (minted and not burned).
   */
  function metadata(uint256 tokenId) external view returns (PookyballMetadata memory) {
    _requireMinted(tokenId);
    return _metadata[tokenId];
  }

  /**
   * @notice Mint a new Pookyball token with a given rarity and luxury. Level, PXP and seed are set to zero, entropy is
   * requested to the VRF coordinator.
   * @dev Requirements:
   * - sender must have the MINTER role.
   */
  function mint(address recipient, PookyballRarity rarity, uint256 luxury) external onlyRole(MINTER) returns (uint256) {
    _mint(recipient, ++lastTokenId);
    _metadata[lastTokenId] = PookyballMetadata(rarity, luxury, 0, 0, 0);

    uint256 requestId = vrfCoordinator.requestRandomWords(
      vrfKeyHash,
      vrfSubId,
      vrfMinimumRequestConfirmations,
      vrfCallbackGasLimit,
      1
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
  function setLevel(uint256 tokenId, uint256 newLevel) external onlyRole(GAME) {
    _requireMinted(tokenId);
    _metadata[tokenId].level = newLevel;
    emit LevelChanged(tokenId, newLevel);
  }

  /**
   * @notice Change the PXP of a Pookyball token.
   * @dev Requirements:
   * - sender must have the GAME role.
   * - Pookyball {tokenId} should exist (minted and not burned).
   */
  function setPXP(uint256 tokenId, uint256 newPXP) external onlyRole(GAME) {
    _requireMinted(tokenId);
    _metadata[tokenId].pxp = newPXP;
    emit PXPChanged(tokenId, newPXP);
  }

  /**
   * @notice Receive the entropy from the VRF coordinator.
   * @dev randomWords will only have one word as entropy is requested per token.
   */
  function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
    uint256 tokenId = vrfRequests[requestId];
    _metadata[tokenId].seed = randomWords[0];
    emit SeedSet(tokenId, randomWords[0]);
  }

  /**
   * @notice IERC165 declaration.
   */
  function supportsInterface(
    bytes4 interfaceId
  ) public view virtual override(IERC165, ERC721, AccessControl) returns (bool) {
    return super.supportsInterface(interfaceId);
  }

  // Operator Filter Registry implementation
  // ---
  // In order to enforce the creator fees on secondary sales, we chose to adhere to the Operator Filter Registry
  // standard that was initially developed by OpenSea.
  // See https://github.com/ProjectOpenSea/operator-filter-registry

  /**
   * @dev See {IERC721-setApprovalForAll}.
   */
  function setApprovalForAll(
    address operator,
    bool approved
  ) public override(ERC721, IERC721) onlyAllowedOperatorApproval(operator) {
    super.setApprovalForAll(operator, approved);
  }

  /**
   * @dev See {IERC721-approve}.
   */
  function approve(
    address operator,
    uint256 tokenId
  ) public override(ERC721, IERC721) onlyAllowedOperatorApproval(operator) {
    super.approve(operator, tokenId);
  }

  /**
   * @dev See {IERC721-transferFrom}.
   */
  function transferFrom(
    address from,
    address to,
    uint256 tokenId
  ) public override(ERC721, IERC721) onlyAllowedOperator(from) {
    super.transferFrom(from, to, tokenId);
  }

  /**
   * @dev See {IERC721-safeTransferFrom}.
   */
  function safeTransferFrom(
    address from,
    address to,
    uint256 tokenId
  ) public override(ERC721, IERC721) onlyAllowedOperator(from) {
    super.safeTransferFrom(from, to, tokenId);
  }

  /**
   * @dev See {IERC721-safeTransferFrom}.
   */
  function safeTransferFrom(
    address from,
    address to,
    uint256 tokenId,
    bytes memory data
  ) public override(ERC721, IERC721) onlyAllowedOperator(from) {
    super.safeTransferFrom(from, to, tokenId, data);
  }
}
