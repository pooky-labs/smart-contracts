// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {Errors} from "./types/Errors.sol";

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

    function mint(address to, uint256 amount) external onlyRole(POOKY_CONTRACT) {
        _mint(to, amount);
    }

    function setTransferEnabled(bool _transferEnabled) external onlyRole(DEFAULT_ADMIN_ROLE) {
        transferEnabled = _transferEnabled;
        emit SetTransferEnabled(_transferEnabled);
    }

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