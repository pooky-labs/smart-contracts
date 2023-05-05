// SPDX-License-Identifier: MIT
// Pooky Game Contracts (POK.sol)
pragma solidity ^0.8.17;

import "openzeppelin/token/ERC20/ERC20.sol";
import "openzeppelin/access/AccessControl.sol";
import "../interfaces/IPOK.sol";

/**
 * @title Pookyball
 * @author Mathieu Bour, Dusan Zdravkovic
 *
 * @notice POK is ERC20 token used inside of the game, $POK is soul-bounded and serves as in-game currency.
 * Mintable by other Pooky game contracts.
 *
 * @dev Implemented roles:
 * - DEFAULT_ADMIN_ROLE can add/remove roles, it will be granted to the deployer and then quickly transferred to a
 *   Gnosis Safe multi-signature wallet.
 * - MINTER role can freely mint new $POK tokens.
 * - BURNER role can freely burning existing $POK tokens.
 */
contract POK is IPOK, ERC20, AccessControl {
    /// Role that allows to freely mint new $POK tokens
    bytes32 public constant MINTER = keccak256("MINTER");
    /// Role that allows to freely burning existing $POK tokens
    bytes32 public constant BURNER = keccak256("BURNER");

    /// Thrown when a POK transfer is attempted.
    error Soulbounded();

    constructor() ERC20("POK", "POK") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @notice Mint an arbitrary amount of $POK to an account.
     * @dev Requirements:
     * - only MINTER role can mint $POK tokens
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER) {
        _mint(to, amount);
    }

    /**
     * @notice Burn an arbitrary amount of $POK of an sender account.
     * It is acknowledged that burning directly from the user wallet is anti-pattern
     * but since $POK is soulbounded, this allow to skip the ERC20 approve call.
     * @dev Requirements:
     * - only BURNER role can burn $POK tokens
     */
    function burn(address to, uint256 amount) external onlyRole(BURNER) {
        _burn(to, amount);
    }

    /**
     * @dev Restrict the $POK transfers between accounts.
     * Requirements:
     * - Transfer between accounts if they are disabled.
     * - Mints and burns are always allowed.
     */
    function _beforeTokenTransfer(address from, address to, uint256) internal pure override {
        if (from == address(0) || to == address(0)) return;
        revert Soulbounded();
    }
}
