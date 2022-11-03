// SPDX-License-Identifier: MIT
// Pooky Game Contracts (interfaces/IPOK.sol)

pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

/**
 * @title IPOK
 * Minimal $POK interface.
 */
interface IPOK is IERC20Upgradeable {
  function mint(address to, uint256 amount) external;

  function burn(uint256 amount) external;
}
