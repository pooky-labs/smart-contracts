// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

contract POOK is ERC20, Ownable {

    mapping(address => bool) public pookyContracts;

    constructor(string memory name_, string memory symbol_) ERC20(name_, symbol_) Ownable() {

    }

    function setPookyContract(address contractAddress, bool toSet) external onlyOwner {
        pookyContracts[contractAddress] = toSet;
    }

    modifier onlyPookyContracts {
        require(pookyContracts[msg.sender], "E");
        _;
    } 

    function mint(address to, uint256 amount) external onlyPookyContracts {
        _mint(to, amount);
    }
}