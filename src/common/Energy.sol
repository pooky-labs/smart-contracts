// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { ERC721A } from "ERC721A/ERC721A.sol";
import { ERC721ABurnable } from "ERC721A/extensions/ERC721ABurnable.sol";
import { ERC721AQueryable } from "ERC721A/extensions/ERC721AQueryable.sol";
import { IERC721A } from "ERC721A/IERC721A.sol";
import { OwnableRoles } from "solady/auth/OwnableRoles.sol";
import { Base64 } from "solady/utils/Base64.sol";
import { LibString } from "solady/utils/LibString.sol";
import { Treasury } from "@/common/Treasury.sol";

/// @title Energy
/// @author Mathieu Bour for Pooky Labs Ltd.
/// Allow players to purchase a voucher representing energy on the Pooky.gg game.
contract Energy is ERC721A, ERC721ABurnable, ERC721AQueryable, OwnableRoles, Treasury {
  using LibString for uint256;

  /// Role allowed to change the pricing
  uint256 public constant OPERATOR = _ROLE_0;

  /// How much cost 1 Energy point
  uint256 public pricing;

  /// How much Energy is worth each token
  mapping(uint256 => uint256) public values;

  constructor(address admin, address[] memory operators, address _treasury, uint256 _pricing)
    ERC721A("Pooky Energy", "PERG")
    Treasury(_treasury)
  {
    _initializeOwner(admin);
    for (uint256 i; i < operators.length;) {
      _grantRoles(operators[i], OPERATOR);
      unchecked {
        i++;
      }
    }

    pricing = _pricing;
  }

  /// @notice Change the Energy pricing
  function setPricing(uint256 _pricing) external onlyRolesOrOwner(OPERATOR) {
    pricing = _pricing;
  }

  /// @dev Voucher token IDs start at 1.
  function _startTokenId() internal pure override returns (uint256) {
    return 1;
  }

  /// @notice Generate the on-chain metadata
  /// @dev Expected pattern:
  /// ```
  /// {
  ///   "name": "Voucher {tokenId}",
  ///   "description": "Voucher granting XX Energy on Pooky.gg",
  ///   "attributes": [
  ///     { "trait_type": "Value", "value": XX }
  ///   ]
  /// }
  /// ```
  /// The function is deliberatly gas-inefficient, but far more clear.
  function tokenURI(uint256 tokenId)
    public
    view
    override(ERC721A, IERC721A)
    returns (string memory)
  {
    string memory value = values[tokenId].toString();
    bytes memory dataURI = abi.encodePacked(
      "{",
      abi.encodePacked('"name": "Voucher #', tokenId.toString(), '",'),
      abi.encodePacked('"description": "Voucher granting ', value, ' Energy on Pooky.gg",'),
      abi.encodePacked(
        '"attributes": [',
        abi.encodePacked('{ "trait_type": "Value", "value": ', value, " }"), // Energy attribute
        "]"
      ),
      "}"
    );

    return string(abi.encodePacked("data:application/json;base64,", Base64.encode(dataURI)));
  }

  /// Mint a new Energy voucher
  /// @param quantity The amount of Energy points
  /// @param recipient The address that should receive the voucher
  /// @dev Requirements
  /// - msg.value must be greater than pricing*quantity
  function mint(uint256 quantity, address recipient)
    external
    payable
    forwarder
    returns (uint256 tokenId)
  {
    uint256 expected = quantity * pricing;

    if (msg.value < expected) {
      revert InsufficientValue(expected, msg.value);
    }

    tokenId = _nextTokenId();
    _mint(recipient, 1);
    values[tokenId] = quantity;
  }
}
