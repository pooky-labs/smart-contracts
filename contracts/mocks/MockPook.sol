// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "../Pook.sol";

contract MockPook is Pook {
    function mock_mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}