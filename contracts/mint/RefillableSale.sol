// SPDX-License-Identifier: MIT
// Pooky Game Contracts (mint/RefillableSale.sol)
pragma solidity ^0.8.18;

import { AccessControlEnumerable } from "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import { IPookyball } from "../interfaces/IPookyball.sol";
import { PookyballRarity } from "../types/PookyballRarity.sol";

struct Item {
  uint256 supply;
  uint256 minted;
  uint256 price;
}

struct Refill {
  PookyballRarity rarity;
  uint256 quantity;
  uint256 price;
}

/**
 * @title RefillableSale
 * @author Mathieu Bour
 * @notice Allow Pookyball players to mint one or multiple Pookyball tokens.
 * This contract is refillable, meaning that an authorized SELLER account is allowed to change the available
 * balls/rarities.
 * The sale might also be closed at some point, see `closedUntil` for the next mint window!
 */
contract RefillableSale is AccessControlEnumerable {
  bytes32 public constant SELLER = keccak256("SELLER");

  /// The available mintable items mapped by rarity.
  mapping(PookyballRarity => Item) public items;

  /// The Pookyball ERC721 token (cannot be changed).
  IPookyball immutable pookyball;
  /// The address of Pooky's treasury (cannot be changed).
  address public immutable treasury;
  /// The date when next mint window will open (compared to block.timestamp).
  uint256 public closedUntil;

  /// Fired when a sale is made
  event Sale(address indexed account, PookyballRarity indexed rarity, uint256 quantity, uint256 value);

  /// Thrown when a mint is attempt before the sale opens.
  error Closed(uint256 closedUntil);
  /// Thrown when a mint would exceed the template supply.
  error InsufficientSupply(PookyballRarity rarity, uint256 remaining);
  /// Thrown when the msg.value of the mint function does not cover the mint cost.
  error InsufficientValue(uint256 expected, uint256 actual);
  /// Thrown when the native transfer has failed.
  error TransferFailed(address recipient, uint256 amount);

  /**
   * @param _pookyball The Pookyball ERC721 token address.
   * @param _treasury The Pooky's treasury address.
   * @param admin The AccessControl admin address.
   * @param sellers The initial SELLER addresses.
   */
  constructor(IPookyball _pookyball, address _treasury, address admin, address[] memory sellers) {
    pookyball = _pookyball;
    treasury = _treasury;
    _grantRole(DEFAULT_ADMIN_ROLE, admin);

    uint256 l = sellers.length;
    for (uint256 i = 0; i < l; i++) {
      _grantRole(SELLER, sellers[i]);
    }

    items[PookyballRarity.COMMON] = Item(0, 0, 20 ether);
    items[PookyballRarity.RARE] = Item(0, 0, 80 ether);
    items[PookyballRarity.EPIC] = Item(0, 0, 320 ether);
    items[PookyballRarity.LEGENDARY] = Item(0, 0, 1280 ether);
  }

  /**
   * @notice return the ineligibility reason of a set of parameters.
   * Required for Paper.xyz custom contract integrations.
   * See https://docs.withpaper.com/reference/eligibilitymethod
   * @return The reason why the parameters are invalid; empty string if teh parameters are valid.
   */
  function eligible(PookyballRarity rarity, uint256 quantity) external view returns (string memory) {
    if (items[rarity].minted + quantity > items[rarity].supply) {
      return "insufficient supply";
    }

    return "";
  }

  /**
   * @notice Mint one or more Pookyball token to a account.
   * @dev Requirements:
   * - sale must be open
   * - item should exists (check with the InsufficientSupply error)
   * - item should have enough supply
   * - enough native currency should be sent to cover the mint price
   */
  function mint(PookyballRarity rarity, address recipient, uint256 quantity) external payable {
    if (closedUntil == 0 || block.timestamp < closedUntil) {
      revert Closed(closedUntil);
    }

    Item memory item = items[rarity];

    if (item.minted + quantity > item.supply) {
      revert InsufficientSupply(rarity, item.supply - item.minted);
    }

    if (msg.value < quantity * item.price) {
      revert InsufficientValue(quantity * item.price, msg.value);
    }

    // Build the arrays for the batched mint
    address[] memory recipients = new address[](quantity);
    PookyballRarity[] memory rarities = new PookyballRarity[](quantity);

    for (uint256 i = 0; i < quantity; i++) {
      recipients[i] = recipient;
      rarities[i] = rarity;
    }

    // Actual Pookyball token mint
    pookyball.mint(recipients, rarities);

    items[rarity].minted += quantity;

    // Forward the funds to the treasury wallet
    (bool sent, ) = treasury.call{ value: msg.value }("");
    if (!sent) {
      revert TransferFailed(treasury, msg.value);
    }

    emit Sale(recipient, rarity, quantity, msg.value);
  }

  /**
   * @notice Restock the sale items.
   * @param refills Array of the modifications to apply.
   * @param _closedUntil Update the opening of the sale; a date in the past opens the sale immediately.
   * @dev Requirements:
   * - msg.sender must have the SELLER role
   */
  function restock(Refill[] memory refills, uint256 _closedUntil) external onlyRole(SELLER) {
    uint256 len = refills.length;
    for (uint256 i = 0; i < len; i++) {
      PookyballRarity rarity = refills[i].rarity;
      items[rarity].supply = items[rarity].minted + refills[i].quantity;
      items[rarity].price = refills[i].price;
    }

    closedUntil = _closedUntil;
  }
}
