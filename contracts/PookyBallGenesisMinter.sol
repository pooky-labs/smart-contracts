// SPDX-License-Identifier: UNLICENSED
// Pooky Game Contracts (PookyBallGenesisMinter.sol)

pragma solidity ^0.8.9;

import "./interfaces/IPookyBall.sol";
import "./PookyBallMinter.sol";
import { BallRarity, MintTemplate, MintRandomRequest } from "./types/DataTypes.sol";

/**
 * @title PookyBallGenesisMinter
 * @author Pooky Engineering Team
 *
 * @notice Extension of PookyBallMinter that will only be used for the initial minting event.
 * This particular Minter also includes a basic tiered allowlist.
 *
 * @dev The zero tier means that the mint is public.
 *
 * Roles:
 *   DEFAULT_ADMIN_ROLE can add/remove roles.
 *   TECH role represents the Pooky Engineering team which is allowed to set account allowlist tier.
 *   BACKEND role represents backend which can mint to the player address.
 */
contract PookyBallGenesisMinter is PookyBallMinter {
  // Roles
  bytes32 public constant BACKEND = keccak256("BACKEND");

  /// The minimum required tier (inclusive) to mint a Pooky Ball token.
  uint256 public minTierToMint;
  /// The allowlist account => tier mapping.
  mapping(address => uint256) public accountTiers;
  /// The maximum mints allowed per account.
  uint256 public maxAccountMints;
  /// The account => number of minted balls
  mapping(address => uint256) accountMints;

  /// The total of balls with this contracts.
  uint256 public ballsMinted;
  /// The maximum mints that will be allowed in this contracts.
  uint256 public maxMintSupply;
  /// The revoke period in seconds.
  uint256 public revokePeriod;
  /// The treasury wallet where all the mint funds will be forwarded.
  address public treasuryWallet;

  /// Emitted when an account tier is set.
  event TierSet(address indexed account, uint256 tier);

  error ArgumentSizeMismatch(uint256 x, uint256 y);
  error InsufficientValue(uint256 required, uint256 actual);
  error TransferFailed(address from);
  error TierTooLow(uint256 required, uint256 actual);
  error MaxMintsReached(uint256 remaining, uint256 requested);
  error MaxSupplyReached(uint256 remaining, uint256 requested);

  function initialize(
    uint256 _startFromId,
    address _admin,
    address _treasuryWallet,
    uint256 _maxMintSupply,
    uint256 _maxBallsPerUser,
    uint256 _revokePeriod,
    address _vrfCoordinator,
    uint32 _callbackGasLimit,
    uint16 _requestConfirmations,
    bytes32 _keyHash,
    uint64 _subscriptionId
  ) public initializer {
    maxAccountMints = _maxBallsPerUser;
    maxMintSupply = _maxMintSupply;
    revokePeriod = _revokePeriod;
    treasuryWallet = _treasuryWallet;

    __PookyBallMinter_init(
      _startFromId,
      _admin,
      _vrfCoordinator,
      _callbackGasLimit,
      _requestConfirmations,
      _keyHash,
      _subscriptionId
    );
  }

  /**
   * @notice The allowed remaining mints for a given {account}.
   */
  function mintsLeft(address account) public view returns (uint256) {
    return maxAccountMints - accountMints[account];
  }

  /**
   * @notice Set the minimum allow list tier allowed to mint.
   * @dev Requirements:
   * - only TECH role can manage the allowlist.
   */
  function setMinTierToMint(uint256 _minTierToMint) external onlyRole(TECH) {
    minTierToMint = _minTierToMint;
  }

  /**
   * @notice Set the allowlist tier of multiple addresses.
   * @dev Requirements:
   * - only TECH role can manage the allowlist.
   */
  function setTierBatch(address[] memory accounts, uint256[] memory tiers) external onlyRole(TECH) {
    if (accounts.length != tiers.length) {
      revert ArgumentSizeMismatch(accounts.length, tiers.length);
    }

    for (uint256 i = 0; i < accounts.length; i++) {
      accountTiers[accounts[i]] = tiers[i];
      emit TierSet(accounts[i], tiers[i]);
    }
  }

  /**
   * @notice Set the maximum number of mintable balls per account.
   * @dev Pooky Balls balance might exceed this limit as Ball transfers are permitted.
   * Mints are tracked by {accountMints}.
   *
   * Requirements:
   * - only TECH role can change how many balls can be minted per account.
   */
  function setMaxAccountMints(uint256 _maxAccountsMints) external onlyRole(TECH) {
    maxAccountMints = _maxAccountsMints;
  }

  /**
   * @notice Set the revocable period duration in seconds.
   * @dev Requirements:
   * - only TECH role can manage the allowlist.
   */
  function setRevokePeriod(uint256 _revokePeriod) external onlyRole(TECH) {
    revokePeriod = _revokePeriod;
  }

  /**
   * @dev Internal function that mints multiple balls at once.
   * @param recipient The account address that will receive the Pooky Balls NFTs.
   * @param templateId The selected MintTemplate id.
   * @param amount The number of balls minted by the account.
   * @param revokeUntil The UNIX timestamp until the Pooky Ball are revocable.
   */
  function _mint(
    address recipient,
    uint256 templateId,
    uint256 amount,
    uint256 revokeUntil
  ) internal {
    if (accountTiers[recipient] < minTierToMint) {
      revert TierTooLow(minTierToMint, accountTiers[recipient]);
    }

    if (amount > mintsLeft(recipient)) {
      revert MaxMintsReached(amount, mintsLeft(recipient));
    }

    if (ballsMinted + amount > maxMintSupply) {
      revert MaxSupplyReached(amount, maxMintSupply - ballsMinted);
    }

    accountMints[recipient] += amount;
    ballsMinted += amount;

    for (uint256 i = 0; i < amount; i++) {
      _requestMintFromTemplate(recipient, templateId, revokeUntil);
    }
  }

  /**
   * @notice Public mint function that is callable by the external accounts.
   * @dev Since crypto payments cannot be disputed, revokeUntil parameter is zero.
   * Requirements:
   * - Transaction value must be equal to the ball price * amount.
   * - Native transfer to the {treasuryWallet} must succeed.
   * @param templateId The {MintTemplate} id.
   * @param amount The amount of balls to mint.
   */
  function mint(uint256 templateId, uint256 amount) external payable {
    uint256 totalPrice = mintTemplates[templateId].price * amount;

    if (msg.value < totalPrice) {
      revert InsufficientValue(totalPrice, msg.value);
    }

    _mint(msg.sender, templateId, amount, 0);

    // Forward the funds to the treasury wallet
    (bool sent, ) = treasuryWallet.call{ value: msg.value }("");
    if (!sent) {
      revert TransferFailed(msg.sender);
    }
  }

  /**
   * @notice Mint Pooky Balls from the back-end, following an off-chain payment (e.g. credit card).
   * Revoke period is set if there is dispute in the payment during this period.
   * @dev Requirements:
   * - only BACKEND role can manage the mint balls freely.
   * @param recipient The account address that will receive the Pooky Balls NFTs.
   * @param templateId The {MintTemplate} id.
   * @param amount The number of balls minted by the recipient.
   */
  function mintAuthorized(
    address recipient,
    uint256 templateId,
    uint256 amount
  ) external onlyRole(BACKEND) {
    _mint(recipient, templateId, amount, block.timestamp + revokePeriod);
  }

  /**
   * @notice Revoke a revocable Pookyball, in case of a payment dispute.
   * @dev Requirements:
   * - only BACKEND role can revoke balls
   */
  function revokeAuthorized(uint256 tokenId) external onlyRole(BACKEND) {
    pookyBall.revoke(tokenId);
  }
}
