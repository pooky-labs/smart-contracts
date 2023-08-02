// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import { IAccessControl } from "openzeppelin/access/IAccessControl.sol";
import { IERC20 } from "openzeppelin/token/ERC20/IERC20.sol";

/// @title IPOK
/// @author Mathieu Bour, Dusan Zdravkovic for Pooky Labs Ltd.
///
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
