// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { OwnableRoles } from "solady/auth/OwnableRoles.sol";
import { Ascension } from "@/common/Ascension.sol";
import { Treasury } from "@/common/Treasury.sol";
import { Signer } from "@/common/Signer.sol";
import { IPookyball, PookyballMetadata, PookyballRarity } from "@/pookyball/IPookyball.sol";
import { IPOK } from "@/tokens/IPOK.sol";

/// @title PookyballAscension
/// @author Mathieu Bour for Pooky Labs Ltd.
///
/// @notice This contract allow Pooky players to upgrade their Pookyballs by merging two Pookyballs into a better single Pookyball.
/// @dev This contract requires the following roles:
/// - `Pookyball.MINTER`
/// - `StickersController.REMOVER` to unslot all Stickers attached to ascended Pookyballs.
contract PookyballAscension is OwnableRoles, Ascension, Treasury, Signer {
  /// @notice Since Pookyball are not burnable by design, we will use the "0xdead" address instead.
  address public constant dead = 0x000000000000000000000000000000000000dEaD;

  /// @notice The Pookyball ERC-721 smart contract.
  IPookyball public immutable pookyball;

  /// @param _pookyball The Pookyball ERC-721 smart contract.
  /// @param admin The initial contract admin.
  /// @param _treasury The initial treasury.
  /// @param signer The initial signer.
  constructor(IPookyball _pookyball, address admin, address _treasury, address signer)
    Treasury(_treasury)
    Signer(signer)
  {
    _initializeOwner(admin);
    pookyball = _pookyball;
  }

  /// @notice Check if the `tokenId` is at its maximum level.
  /// @param sender The account that want to ascend the stickers, used for ownership test.
  /// @param tokenId The token id to check.
  /// @return The ascended rarity.
  function ascendable(address sender, uint256 tokenId) public view override returns (uint8) {
    if (pookyball.ownerOf(tokenId) != sender) {
      revert Ineligible(tokenId);
    }

    PookyballMetadata memory m = pookyball.metadata(tokenId);

    if (m.rarity == PookyballRarity.COMMON && m.level >= 40) {
      return uint8(PookyballRarity.RARE);
    }

    if (m.rarity == PookyballRarity.RARE && m.level >= 60) {
      return uint8(PookyballRarity.EPIC);
    }

    if (m.rarity == PookyballRarity.EPIC && m.level >= 80) {
      return uint8(PookyballRarity.LEGENDARY);
    }

    revert Ineligible(tokenId);
  }

  /// @notice Burn the Pookyball `tokenId` by sending it to the `dead` address.
  /// @dev This burn requires the use to approve this contract as operator for the Pookyball collection.
  function _burn(uint256 tokenId) internal override {
    pookyball.transferFrom(msg.sender, dead, tokenId);
  }

  /// @notice Mint the new ascended Pookyball.
  /// @param rarity The ascended Pookyball rarity.
  /// @param recipient The recipient of the Pookyball.
  /// @return The ascended Pookyball token id.
  function _mint(uint8 rarity, address recipient) internal override returns (uint256) {
    address[] memory recipients = new address[](1);
    recipients[0] = recipient;
    PookyballRarity[] memory rarities = new PookyballRarity[](1);
    rarities[0] = PookyballRarity(rarity);
    return pookyball.mint(recipients, rarities);
  }

  /// @notice Ascend Pookyballs `left` and `right` into a new Pookyball.
  /// @dev The signer has all autority on the pricing, since the formula requires off-chain data.
  /// @param left The first Pookyball token id.
  /// @param right The second Pookyball token id.
  /// @param priceNAT The price in native currency.
  /// @param proof The proof of `abi.encode(left, right, priceNAT)`.
  function ascend(uint256 left, uint256 right, uint256 priceNAT, bytes calldata proof)
    external
    payable
    onlyVerify(abi.encode(left, right, priceNAT), proof)
    forwarder
  {
    if (priceNAT > msg.value) {
      revert InsufficientValue(priceNAT, msg.value);
    }

    _ascend(left, right);
  }
}
