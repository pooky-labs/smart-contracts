// SPDX-License-Identifier: MIT
// Pooky Game Contracts (interfaces/IPOK.sol)
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title IPOK
 * Minimal $POK interface.
 */
interface IPOK is IERC20 {
  function mint(address to, uint256 amount) external;

  function burn(address to, uint256 amount) external;
}
