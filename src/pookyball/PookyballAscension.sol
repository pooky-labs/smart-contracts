// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { OwnableRoles } from "solady/auth/OwnableRoles.sol";
import { Treasury } from "@/common/Treasury.sol";
import { Signer } from "@/common/Signer.sol";
import { IPookyball, PookyballMetadata, PookyballRarity } from "@/pookyball/IPookyball.sol";
import { IStickersController } from "@/stickers/IStickersController.sol";
import { IPOK } from "@/tokens/IPOK.sol";

/// @title PookyballAscension
/// @author Mathieu Bour for Pooky Labs Ltd.
///
/// @notice This contract allow Pooky players to upgrade their Pookyballs by merging two Pookyballs into a better single Pookyball.
/// @dev This contract requires the following roles:
/// - `Pookyball.MINTER`
/// - `StickersController.REMOVER` to unslot all Stickers attached to ascended Pookyballs.
contract PookyballAscension is OwnableRoles, Treasury, Signer {
  /// @notice Fired when a token is ascended.
  /// @param tokenId The new ascended token id.
  /// @param rarity The rarity of the new ascended token.
  /// @param left The first token id.
  /// @param right The second token id.
  event Ascended(
    uint256 indexed tokenId, PookyballRarity rarity, uint256 indexed left, uint256 indexed right
  );

  /// @notice Thrown when the `tokenId` is not eligible for the ascension.
  error Ineligible(uint256 tokenId);

  /// @notice Thrown when the rarities of the two source tokens do not match.
  error RarityMismatch(PookyballRarity left, PookyballRarity right);

  /// @notice Since Pookyball are not burnable by design, we will use the "0xdead" address instead.
  address public constant dead = 0x000000000000000000000000000000000000dEaD;

  /// @notice The Pookyball ERC-721 smart contract.
  IPookyball public immutable pookyball;
  IStickersController public immutable controller;

  /// @param _pookyball The Pookyball ERC-721 smart contract.
  /// @param admin The initial contract admin.
  /// @param _treasury The initial treasury.
  /// @param signer The initial signer.
  constructor(
    IPookyball _pookyball,
    IStickersController _controller,
    address admin,
    address signer,
    address _treasury
  ) Signer(signer) Treasury(_treasury) {
    _initializeOwner(admin);
    pookyball = _pookyball;
    controller = _controller;
  }

  /// @notice Check if the `tokenId` is at its maximum level.
  /// @param sender The account that want to ascend the stickers, used for ownership test.
  /// @param tokenId The token id to check.
  /// @return The ascended rarity.
  function ascendable(address sender, uint256 tokenId) public view returns (PookyballRarity) {
    if (pookyball.ownerOf(tokenId) != sender) {
      revert Ineligible(tokenId);
    }

    PookyballMetadata memory m = pookyball.metadata(tokenId);

    if (m.rarity == PookyballRarity.COMMON && m.level >= 40) {
      return PookyballRarity.RARE;
    }

    if (m.rarity == PookyballRarity.RARE && m.level >= 60) {
      return PookyballRarity.EPIC;
    }

    if (m.rarity == PookyballRarity.EPIC && m.level >= 80) {
      return PookyballRarity.LEGENDARY;
    }

    revert Ineligible(tokenId);
  }

  /// @notice Burn the Pookyball `tokenId` by sending it to the `dead` address.
  /// @dev This burn requires the owner to approve this contract as operator for the Pookyball collection.
  function _burn(uint256 tokenId) internal {
    uint256[] memory stickers = controller.slots(tokenId);
    address owner = pookyball.ownerOf(tokenId);

    for (uint256 i; i < stickers.length;) {
      controller.detach(stickers[i], owner);
      unchecked {
        ++i;
      }
    }

    pookyball.transferFrom(owner, dead, tokenId); // send Pookyball to dead address
  }

  /// @notice Mint the new ascended Pookyball.
  /// @param rarity The ascended Pookyball rarity.
  /// @param recipient The recipient of the Pookyball.
  /// @return The ascended Pookyball token id.
  function _mint(PookyballRarity rarity, address recipient) internal returns (uint256) {
    address[] memory recipients = new address[](1);
    recipients[0] = recipient;
    PookyballRarity[] memory rarities = new PookyballRarity[](1);
    rarities[0] = rarity;
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
    returns (uint256)
  {
    if (priceNAT > msg.value) {
      revert InsufficientValue(priceNAT, msg.value);
    }

    PookyballRarity rarity = ascendable(msg.sender, left);
    PookyballRarity rarity2 = ascendable(msg.sender, right);

    if (rarity != rarity2) {
      revert RarityMismatch(rarity, rarity2);
    }

    // Actual ascension: burn the two source Pookyballs and mint a new one.
    _burn(left);
    _burn(right);
    uint256 ascendedId = _mint(rarity, msg.sender);

    emit Ascended(ascendedId, rarity, left, right);
    return ascendedId;
  }
}
