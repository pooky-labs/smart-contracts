// SPDX-License-Identifier: MIT
// Pooky Game Contracts (interfaces/IPOK.sol)
pragma solidity ^0.8.17;

import "openzeppelin/access/IAccessControl.sol";
import "openzeppelin/token/ERC20/IERC20.sol";

/// @title IPOK
/// @author Mathieu Bour
/// @notice Minimal $POK ERC20 token interface.
interface IPOK is IAccessControl, IERC20 {
  /// @notice Mint an arbitrary amount of $POK to an account.
  /// @dev Requirements:
  /// - only MINTER role can mint $POK tokens
  function mint(address to, uint256 amount) external;

  /// @notice Burn an arbitrary amount of $POK of an sender account.
  /// It is acknowledged that burning directly from the user wallet is anti-pattern
  /// but since $POK is soulbounded, this allow to skip the ERC20 approve call.
  /// @dev Requirements:
  /// - only BURNER role can burn $POK tokens
  function burn(address to, uint256 amount) external;
}
