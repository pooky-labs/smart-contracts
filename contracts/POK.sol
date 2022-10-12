// SPDX-License-Identifier: UNLICENSED
// Pooky Game Contracts (POK.sol)

pragma solidity ^0.8.9;

import '@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol';

/**
 * @title PookyBall
 * @author Pooky Engineering Team
 *
 * @notice POK is ERC20 token used inside of the game.
 * Mintable by other Pooky game contracts.
 * $POK is soul-bounded during first gaming phase, where the Pooky team will balance the rewards.
 * Transfers will later be enabled by the Pooky team.
 *
 * @dev Roles:
 * - DEFAULT_ADMIN_ROLE can add/remove roles, can enable/disable token transfers.
 * - POOKY_CONTRACT role can mint new tokens, can receive/send tokens while transfers are disabled.
 */
contract POK is ERC20Upgradeable, AccessControlUpgradeable {
  // Roles
  bytes32 public constant POOKY_CONTRACT = keccak256('POOKY_CONTRACT');

  bool public transferEnabled;

  event SetTransferEnabled(bool transferEnabled);

  error TransfersDisabled();

  function initialize(
    string memory _name,
    string memory _symbol,
    address _admin
  ) public initializer {
    __ERC20_init(_name, _symbol);
    __AccessControl_init();
    _setupRole(DEFAULT_ADMIN_ROLE, _admin);
  }

  /**
   * @notice Mint an arbitrary amount of $POK to an account.
   * @dev Requirements:
   * - only POOKY_CONTRACT role can mint $POK tokens
   */
  function mint(address to, uint256 amount) external onlyRole(POOKY_CONTRACT) {
    _mint(to, amount);
  }

  /**
   * @notice Burn an arbitrary amount of $POK of an account.
   * @dev Requirements:
   * - only POOKY_CONTRACT role can mint $POK tokens
   */
  function burn(address from, uint256 amount) external onlyRole(POOKY_CONTRACT) {
    _burn(from, amount);
  }

  /**
   * @notice Enable/disable transfers of $POK tokens between users.
   * @dev Requirements:
   * - only POOKY_CONTRACT role can mint $POK tokens
   */
  function setTransferEnabled(bool _transferEnabled) external onlyRole(DEFAULT_ADMIN_ROLE) {
    transferEnabled = _transferEnabled;
    emit SetTransferEnabled(_transferEnabled);
  }

  /**
   * @dev Restrict the $POK transfers between accounts.
   * - Do not allow transfer between users if they are disabled, see {POK-setTransferEnabled}.
   * - Mints and burns are always allowed.
   * - POOKY_CONTRACT can always send and receive tokens.
   */
  function _beforeTokenTransfer(
    address from,
    address to,
    uint256
  ) internal view override {
    if (transferEnabled) return;
    if (from == address(0) || to == address(0)) return;
    if (hasRole(POOKY_CONTRACT, from) || hasRole(POOKY_CONTRACT, to)) return;

    revert TransfersDisabled();
  }
}
