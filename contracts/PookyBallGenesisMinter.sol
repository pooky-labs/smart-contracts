// SPDX-License-Identifier: UNLICENSED
// Pooky Game Contracts (PookyBallGenesisMinter.sol)

pragma solidity ^0.8.9;

import './interfaces/IPookyBall.sol';
import './PookyBallMinter.sol';
import { BallRarity, MintTemplate, MintRandomRequest } from './types/DataTypes.sol';

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
 *   DEFAULT_ADMIN_ROLE can add/remove roles
 *   TECH role represents backend which can mint to the user address
 */
contract PookyBallGenesisMinter is PookyBallMinter {
  // Allowlist state
  uint256 public minTierToBuy;
  mapping(address => uint256) public userTiers;

  // Maximum mints state
  uint256 public maxBallsPerUser;
  mapping(address => uint256) userBallsMinted;

  uint256 public ballsMinted;
  uint256 public maxMintSupply;
  uint256 public revokePeriod;
  address public treasuryWallet;

  event UserTierSet(address indexed user, uint256 tier);

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
    treasuryWallet = _treasuryWallet;
    maxMintSupply = _maxMintSupply;
    maxBallsPerUser = _maxBallsPerUser;
    revokePeriod = _revokePeriod;

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
    return maxBallsPerUser - userBallsMinted[account];
  }

  /**
   * @notice Set the minimum allow list tier allowed to mint.
   * @dev Requirements:
   * - only MOD role can manage the allowlist.
   */
  function setMinTierToBuy(uint256 _minTierToBuy) external onlyRole(TECH) {
    minTierToBuy = _minTierToBuy;
  }

  /**
   * @notice Set the maximum number of mintable balls per account.
   * @dev Pooky Balls balance might exceed this limit as Ball transfers are permitted.
   * Mints are tracked by {userBallsMinted}.
   *
   * Requirements:
   * - only MOD role can manage the allowlist.
   */
  function setMaxBallsPerUser(uint256 _maxBallsPerUser) external onlyRole(TECH) {
    maxBallsPerUser = _maxBallsPerUser;
  }

  /**
   * @notice Set the revocable period duration in seconds.
   * @dev Requirements:
   * - only MOD role can manage the allowlist.
   */
  function setRevokePeriod(uint256 _revokePeriod) external onlyRole(TECH) {
    revokePeriod = _revokePeriod;
  }

  /**
   * @notice Set the allowlist tier of multiple addresses.
   * @dev Requirements:
   * - only MOD role can manage the allowlist.
   */
  function setTierBatch(address[] memory accounts, uint256[] memory tiers) external onlyRole(TECH) {
    if (accounts.length != tiers.length) {
      revert ArgumentSizeMismatch(accounts.length, tiers.length);
    }

    for (uint256 i = 0; i < accounts.length; i++) {
      userTiers[accounts[i]] = tiers[i];
      emit UserTierSet(accounts[i], tiers[i]);
    }
  }

  /**
   * @dev Internal function that mints multiple balls at once.
   * @param recipient The account address that will receive the Pooky Balls NFTs.
   * @param amount The number of balls minted by the user.
   * @param templateId The selected MintTemplate id.
   * @param revokeUntil The UNIX timestamp until the Pooky Ball are revocable.
   */
  function _mint(
    address recipient,
    uint256 templateId,
    uint256 amount,
    uint256 revokeUntil
  ) internal {
    if (userTiers[recipient] < minTierToBuy) {
      revert TierTooLow(minTierToBuy, userTiers[recipient]);
    }

    if (amount > mintsLeft(recipient)) {
      revert MaxMintsReached(amount, mintsLeft(recipient));
    }

    if (ballsMinted + amount > maxMintSupply) {
      revert MaxSupplyReached(amount, maxMintSupply - ballsMinted);
    }

    userBallsMinted[recipient] += amount;
    ballsMinted += amount;

    for (uint256 i = 0; i < amount; i++) {
      _requestMintFromTemplate(recipient, templateId, revokeUntil);
    }
  }

  /**
   * @notice Public mint function that is callable by the users.
   * @dev Since crypto payments cannot be disputed, revokeUntil parameter is zero.
   * Requirements:
   * - Transaction value must be equal to the ball price * amount.
   */
  function mint(uint256 templateId, uint256 amount) external payable {
    uint256 totalPrice = mintTemplates[templateId].price * amount;

    if (msg.value < totalPrice) {
      revert InsufficientValue(totalPrice, msg.value);
    }

    _mint(msg.sender, templateId, amount, 0);

    // Forward the funds to the treasury wallet
    (bool sent, ) = treasuryWallet.call{ value: msg.value }('');
    if (!sent) {
      revert TransferFailed(msg.sender);
    }
  }

  /**
   * @notice Mint Pooky Balls from the back-end, following an off-chain payment (e.g. credit card).
   * Revoke period is set if there is dispute in the payment during this period.
   * @dev Requirements:
   * - only TECH role can manage the mint balls freely.
   * @param recipient The account address that will receive the Pooky Balls NFTs.
   * @param amount The number of balls minted by the user.
   * @param templateId The selected MintTemplate id.
   */
  function mintAuthorized(
    address recipient,
    uint256 templateId,
    uint256 amount
  ) external onlyRole(TECH) {
    _mint(recipient, templateId, amount, block.timestamp + revokePeriod);
  }

  /**
   * @notice function called by backend to revoke the ball.
   * @notice This function is used when there is dispute in the payment.
   * @notice only TECH role can call this function
   */
  function revokeAuthorized(uint256 tokenId) external onlyRole(TECH) {
    pookyBall.revoke(tokenId);
  }
}
