// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {Errors} from "./types/Errors.sol";

/**
 * @notice POK is ERC20 token used inside of the game.
 * @notice   Mintable by other Pooky game contracts.
 * @notice   Non-transferable in the beginning, until transfering is enabled by admin.
 *
 * @notice Roles:
 * @notice   DEFAULT_ADMIN_ROLE can add/remove roles, can enable/disable token transfers. 
 * @notice   POOKY_CONTRACT role can mint new tokens, can receive/send tokens while transfers are disabled.
 */
contract POK is ERC20Upgradeable, AccessControlUpgradeable {
    event SetTransferEnabled(bool transferEnabled);

    bytes32 public constant POOKY_CONTRACT = keccak256("POOKY_CONTRACT");

    bool public transferEnabled;

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
     * @notice only POOKY_CONTRACT role can mint tokens
     */
    function mint(address to, uint256 amount) external onlyRole(POOKY_CONTRACT) {
        _mint(to, amount);
    }

    /**
     * @notice enable or disable transfers of tokens between users
     * @notice only DEFAULT_ADMIN_ROLE role can call this function
     */
    function setTransferEnabled(bool _transferEnabled) external onlyRole(DEFAULT_ADMIN_ROLE) {
        transferEnabled = _transferEnabled;
        emit SetTransferEnabled(_transferEnabled);
    }

    /**
     * @dev don't allow transfer if disabled
     * @dev if transfers are disabled it's still posible to mint/burn tokens, 
     * @dev and send it to, or receive from, pooky game contracts
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) override internal {
        if (transferEnabled) return;
        if (from == address(0) || to == address(0)) return;
        if (hasRole(POOKY_CONTRACT, from) || hasRole(POOKY_CONTRACT, to)) return;

        revert(Errors.POK_TRANSFER_NOT_ENABLED);
    }
}