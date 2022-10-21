// SPDX-License-Identifier: UNLICENSED
// Pooky Game Contracts (PookyBall.sol)

pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import "./interfaces/IPookyBall.sol";
import { BallRarity, BallRarity, BallInfo } from "./types/DataTypes.sol";

/**
 * @title PookyBall
 * @author Pooky Engineering Team
 *
 * @notice PookyBall is ERC721 token representing Pooky Ball NFTs. Balls are mintable by other Pooky game contracts.
 * This contract does not hold any aspect of the Pooky gameplay and only serves as Pooky Ball information storage.
 *
 * Pooky Balls NFT have the following features (see {BallInfo}):
 * - `rarity`
 * - `randomEntropy` the ball random entropy (provided by Chainlink VRF v2) which is used to generate the ball image and
 *   in-game boosts.
 * - `level` the ball level
 * - `pxp` the ball PXP (experience points)
 *
 * Leveling up:
 * Pooky Balls NFT gain PXP when used to place prediction on the Pooky game. Balls cannot loose PXP.
 * Once a ball has acquired enough PXP, it can be leveled up in exchange of a certain amount of $POK token (see {POK}).
 *
 * Roles:
 * - DEFAULT_ADMIN_ROLE can add/remove roles.
 * - POOKY_CONTRACT role can mint new tokens.
 */
contract PookyBall is IPookyBall, ERC721Upgradeable, AccessControlUpgradeable {
  using StringsUpgradeable for uint256;

  // Roles
  bytes32 public constant POOKY_CONTRACT = keccak256("POOKY_CONTRACT");

  string public baseURI_;
  string public _contractURI;
  uint256 public lastTokenId;

  mapping(uint256 => BallInfo) public balls;

  event BallRandomEntropySet(uint256 indexed tokenId, uint256 randomEntropy);
  event BallLevelUpdated(uint256 indexed tokenId, uint256 level);
  event BallPXPUpdated(uint256 indexed tokenId, uint256 amount);

  /// Thrown when the entropy of a ball has been already
  error EntropyAlreadySet(uint256 tokenId);

  function initialize(
    string memory _name,
    string memory _symbol,
    string memory _baseURI_,
    string memory contractURI_,
    address _admin
  ) public initializer {
    __ERC721_init(_name, _symbol);
    __AccessControl_init();
    _setupRole(DEFAULT_ADMIN_ROLE, _admin);

    baseURI_ = _baseURI_;
    _contractURI = contractURI_;
  }

  /**
   * @notice URI of the contract-level metadata.
   * Specified by OpenSea documentation (https://docs.opensea.io/docs/contract-level-metadata).
   */
  function contractURI() public view returns (string memory) {
    return _contractURI;
  }

  /**
   * @notice Set the URI of the contract-level metadata.
   * @dev Requirements:
   * - Only DEFAULT_ADMIN_ROLE role can set the contract URI.
   */
  function setContractURI(string memory contractURI_) external onlyRole(DEFAULT_ADMIN_ROLE) {
    _contractURI = contractURI_;
  }

  /**
   * @notice Metadata URI of the token {tokenId}.
   * @dev See {IERC721Metadata-tokenURI}.
   * Requirements:
   * - Ball {tokenId} should exist (minted and not burned).
   */
  function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
    _requireMinted(tokenId);
    return bytes(baseURI_).length > 0 ? string(abi.encodePacked(baseURI_, tokenId.toString(), ".json")) : "";
  }

  /**
   * @notice Ball information of a particular Pooky Ball.
   * @dev Requirements:
   * - Ball {tokenId} should exist (minted and not burned).
   */
  function getBallInfo(uint256 tokenId) external view returns (BallInfo memory) {
    _requireMinted(tokenId);
    return balls[tokenId];
  }

  /**
   * @notice Sets the random entropy of the Pooky Ball with id {tokenId}.
   * @dev Requirements:
   * - Only POOKY_CONTRACT role can increase Pooky Balls levels.
   * - Ball {tokenId} should exist (minted and not burned).
   * - Previous entropy should be zero.
   */
  function setRandomEntropy(uint256 tokenId, uint256 _randomEntropy) external onlyRole(POOKY_CONTRACT) {
    _requireMinted(tokenId);

    if (balls[tokenId].randomEntropy != 0) {
      revert EntropyAlreadySet(tokenId);
    }

    balls[tokenId].randomEntropy = _randomEntropy;
    emit BallRandomEntropySet(tokenId, _randomEntropy);
  }

  /**
   * @notice Change the PXP (Experience points) of the Pooky Ball with id {tokenId}.
   * @dev Requirements:
   * - Only POOKY_CONTRACT role can increase Pooky Balls PXP.
   * - Ball {tokenId} should exist (minted and not burned).
   * @param tokenId The Pooky Ball NFT id.
   * @param amount The PXP amount to add the to Pooky Ball.
   */
  function changePXP(uint256 tokenId, uint256 amount) external onlyRole(POOKY_CONTRACT) {
    _requireMinted(tokenId);

    balls[tokenId].pxp = amount;
    emit BallPXPUpdated(tokenId, amount);
  }

  /**
   * @notice Change the level of the Pooky Ball with id {tokenId} to the {newLevel}
   * @dev Requirements:
   * - Only POOKY_CONTRACT role can increase Pooky Balls levels.
   * - Ball {tokenId} should exist (minted and not burned).
   * @param tokenId The Pooky Ball NFT id.
   * @param newLevel The new Ball level.
   */
  function changeLevel(uint256 tokenId, uint256 newLevel) external onlyRole(POOKY_CONTRACT) {
    _requireMinted(tokenId);

    balls[tokenId].level = newLevel;
    emit BallLevelUpdated(tokenId, newLevel);
  }

  /**
   * @dev Internal function that can mint any ball without any restriction; it keeps track of the lastTokenId.
   */
  function _mintBall(address to, BallInfo memory ballInfo) internal returns (uint256) {
    lastTokenId++;

    _mint(to, lastTokenId);
    balls[lastTokenId] = ballInfo;

    return lastTokenId;
  }

  /**
   * @notice Mint a ball with a specific {BallRarity} and {BallLuxury} with all other Ball parameters set to default.
   * @dev Requirements:
   * - Only POOKY_CONTRACT role can mint Pooky Balls.
   * @param to The address which will own the minted Pooky Ball.
   * @param rarity The Pooky Ball rarity.
   * @param luxury The Pooky Ball luxury.
   */
  function mint(
    address to,
    BallRarity rarity,
    BallLuxury luxury
  ) external onlyRole(POOKY_CONTRACT) returns (uint256) {
    return _mintBall(to, BallInfo({ rarity: rarity, luxury: luxury, randomEntropy: 0, level: 0, pxp: 0 }));
  }

  /**
   * IERC165 declaration.
   */
  function supportsInterface(bytes4 interfaceId)
    public
    view
    virtual
    override(ERC721Upgradeable, IERC165Upgradeable, AccessControlUpgradeable)
    returns (bool)
  {
    return super.supportsInterface(interfaceId);
  }
}
