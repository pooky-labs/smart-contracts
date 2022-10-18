// SPDX-License-Identifier: UNLICENSED
// Pooky Game Contracts (mocks/POKMock.sol)

pragma solidity ^0.8.9;

import "../POK.sol";

/**
 * @title PookyBall
 * @author Pooky Engineering Team
 *
 * @notice POKMock is used for testing: everybody is allowed mint new $POK tokens.
 */
contract POKMock is POK {
    function mock_mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
