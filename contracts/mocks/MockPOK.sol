// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import '../POK.sol';

/**
 * @notice Mock POK contract used for testing which allows everybody to mint new tokens
 */
contract MockPOK is POK {
  function mock_mint(address to, uint256 amount) external {
    _mint(to, amount);
  }
}
