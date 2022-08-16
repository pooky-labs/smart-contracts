// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Errors} from "./types/Errors.sol";

contract Pook is ERC20Upgradeable, OwnableUpgradeable {

    mapping(address => bool) public pookyContracts;

    function initialize(
        string memory name_, 
        string memory symbol_
    ) public initializer {
        __ERC20_init(name_, symbol_);
        __Ownable_init();
    }

    function setPookyContract(address contractAddress, bool toSet) external onlyOwner {
        pookyContracts[contractAddress] = toSet;
    }

    modifier onlyPookyContracts {
        require(pookyContracts[msg.sender], Errors.ONLY_POOKY_CONTRACTS);
        _;
    } 

    function mint(address to, uint256 amount) external onlyPookyContracts {
        _mint(to, amount);
    }
}