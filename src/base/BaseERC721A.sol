// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { VRFConsumerBaseV2 } from "chainlink/vrf/VRFConsumerBaseV2.sol";
import { ERC721A } from "ERC721A/ERC721A.sol";
import { ERC721ABurnable } from "ERC721A/extensions/ERC721ABurnable.sol";
import { ERC721AQueryable } from "ERC721A/extensions/ERC721AQueryable.sol";
import { IERC721A } from "ERC721A/IERC721A.sol";
import { ERC2981 } from "openzeppelin/token/common/ERC2981.sol";
import { DefaultOperatorFilterer } from "operator-filter-registry/DefaultOperatorFilterer.sol";
import { Ownable } from "solady/auth/Ownable.sol";
import { IBaseERC721A } from "@/interfaces/IBaseERC721A.sol";
import { VRFConfig } from "@/types/VRFConfig.sol";

/// @title BaseERC721A
/// @author Mathieu Bour for Pooky Labs Ltd.
///
/// @notice Opiniated ERC721 implementation base on ERC721A
/// Features:
/// - `Ownable` via Solady.
/// - Chainlink VRF v2 to assign a random seed to each token id.
/// - Burnable, queryable via the ERC721A extensions.
/// - Royalties enforced on OpenSea using the `DefaultOperatorFilterer`.
contract BaseERC721A is
  ERC721A,
  ERC721ABurnable,
  ERC721AQueryable,
  ERC2981,
  DefaultOperatorFilterer,
  Ownable,
  VRFConsumerBaseV2,
  IBaseERC721A
{
  /// @notice The prefix URI of all the token metadata.
  string public baseURI;

  /// @notice URI of the contract-level metadata.
  /// Specified by OpenSea documentation (https://docs.opensea.io/docs/contract-level-metadata).
  string public contractURI;

  // VRF parameters
  VRFConfig public vrf;
  mapping(uint256 => uint256) public vrfRequests;

  /// The random numbers associated with the tokens: tokenId => randomWord.
  mapping(uint256 => uint256) public seeds;

  constructor(
    address admin,
    // ERC721
    string memory name_,
    string memory symbol_,
    string memory baseURI_,
    string memory _contractURI,
    // VRF
    VRFConfig memory _vrf,
    // ERC2981
    address _receiver,
    uint96 royalty
  ) ERC721A(name_, symbol_) VRFConsumerBaseV2(address(_vrf.coordinator)) {
    _initializeOwner(admin);
    baseURI = baseURI_;
    _contractURI = contractURI;
    vrf = _vrf;
    _setDefaultRoyalty(_receiver, royalty);
  }

  modifier onlyExists(uint256 tokenId) {
    if (!_exists(tokenId)) {
      revert NonExistentToken(tokenId);
    }

    _;
  }

  // ----- ERC721A patches -----
  /// @dev Collection starts at token id 1.
  function _startTokenId() internal view virtual override returns (uint256) {
    return 1;
  }

  /// @dev This allow to iterate over the token ids.
  function nextTokenId() external view returns (uint256) {
    return _nextTokenId();
  }

  // ----- Metadata -----
  /// @notice Change the base URI of the tokens URI.
  /// @dev We keep this function as an escape hatch in case of a migration to another token metadata platform.
  /// Requirements:
  /// - Only owner can set can set base URI.
  function setBaseURI(string memory newBaseURI) external onlyOwner {
    baseURI = newBaseURI;
  }

  /// @notice Set the URI of the contract-level metadata.
  /// @dev We keep this function as an escape hatch in case of a migration to another token metadata platform.
  /// Requirements:
  /// - Only owner can set the contract URI.

  function setContractURI(string memory newContractURI) external onlyOwner {
    contractURI = newContractURI;
  }

  /// @notice Override the ERC721A _baseURI with a state variable.
  function _baseURI() internal view override returns (string memory) {
    return baseURI;
  }

  // ---- Mint & VRF ----
  /// @notice Mint a new Pookyball token with a given rarity. Level, PXP and seed are set to zero, entropy is
  /// requested to the VRF coordinator.
  /// @dev Requirements:
  /// - sender must have the MINTER role or be the owner.
  function _mint(address to, uint256 quantity) internal virtual override {
    super._mint(to, quantity);

    uint256 requestId = vrf.coordinator.requestRandomWords(
      vrf.keyHash,
      vrf.subcriptionId,
      vrf.minimumRequestConfirmations,
      vrf.callbackGasLimit,
      uint32(quantity)
    );

    vrfRequests[requestId] = _totalMinted();
  }

  /// @notice Receive the entropy from the VRF coordinator.
  /// @dev randomWords will only have one word as entropy is requested per token.
  function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
    uint256 tokenId = vrfRequests[requestId];

    // Apply the random words
    for (uint256 i = 0; i < randomWords.length; i++) {
      seeds[tokenId - i] = randomWords[i];
      emit SeedSet(tokenId - i, randomWords[i]);
    }
  }

  // ---- ERC2981 ----
  /// @notice Change the default royalties and/or the address that will receive them.
  /// @param _receiver The new address that will receive the royalties.
  /// @param royalty The new default royalty over 10000.
  function setDefaultRoyalty(address _receiver, uint96 royalty) external onlyOwner {
    _setDefaultRoyalty(_receiver, royalty);
  }

  // ---- Operator Filter Registry ----
  /// Operator Filter Registry implementation.
  /// @dev See {IERC721A-setApprovalForAll}.
  function setApprovalForAll(address operator, bool approved)
    public
    override(ERC721A, IERC721A)
    onlyAllowedOperatorApproval(operator)
  {
    super.setApprovalForAll(operator, approved);
  }

  /// Operator Filter Registry implementation.
  /// @dev See {IERC721A-approve}.
  function approve(address operator, uint256 tokenId)
    public
    payable
    override(ERC721A, IERC721A)
    onlyAllowedOperatorApproval(operator)
  {
    super.approve(operator, tokenId);
  }

  /// Operator Filter Registry implementation.
  /// @dev See {IERC721A-transferFrom}.
  function transferFrom(address from, address to, uint256 tokenId)
    public
    payable
    override(ERC721A, IERC721A)
    onlyAllowedOperator(from)
  {
    super.transferFrom(from, to, tokenId);
  }

  /// Operator Filter Registry implementation.
  /// @dev See {IERC721A-safeTransferFrom}.
  function safeTransferFrom(address from, address to, uint256 tokenId)
    public
    payable
    override(ERC721A, IERC721A)
    onlyAllowedOperator(from)
  {
    super.safeTransferFrom(from, to, tokenId);
  }

  /// Operator Filter Registry implementation.
  /// @dev See {IERC721A-safeTransferFrom}.
  function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data)
    public
    payable
    override(ERC721A, IERC721A)
    onlyAllowedOperator(from)
  {
    super.safeTransferFrom(from, to, tokenId, data);
  }

  // ----- ERC165 -----
  /// @notice IERC165 declaration.
  /// @dev Supports the following `interfaceId`s:
  /// - IERC165: 0x01ffc9a7
  /// - IERC721: 0x80ac58cd
  /// - IERC721Metadata: 0x5b5e139f
  /// - IERC2981: 0x2a55205a
  function supportsInterface(bytes4 interfaceId)
    public
    view
    virtual
    override(IBaseERC721A, ERC721A, IERC721A, ERC2981)
    returns (bool)
  {
    return super.supportsInterface(interfaceId) || ERC721A.supportsInterface(interfaceId);
  }
}
