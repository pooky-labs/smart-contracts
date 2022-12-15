// SPDX-License-Identifier: MIT
// Pooky Game Contracts (GenesisMinter.sol)
pragma solidity ^0.8.17;

import "../interfaces/IPookyball.sol";
import "../interfaces/IWaitList.sol";
import "../types/PookyballRarity.sol";

struct Template {
  PookyballRarity rarity;
  uint256 luxury;
  uint256 supply;
  uint256 minted;
  uint256 price;
}

/**
 * @title GenesisMinter
 * @notice Mint contract for the Pooky "genesis" collection.
 */
contract GenesisMinter {
  IPookyball public immutable pookyball;
  address immutable treasury;

  uint256 nextTemplateId;
  mapping(uint256 => Template) public templates;

  IWaitList public immutable waitlist;
  uint waitlistTier;

  event Sale(address indexed account, uint256 indexed templateId, uint256 quantity, uint256 value);

  /// Thrown when an account is not eligible from the waitlist point of view.
  error NotEligible(address account);
  /// Thrown when a mint would exceed the template supply.
  error SoldOut(uint256 templateId, uint256 remaining);
  /// Thrown when the msg.value of the mint function does not cover the mint cost.
  error InsufficientValue(uint256 expected, uint256 actual);
  /// Thrown when the native transfer has failed.
  error TransferFailed(address recipient, uint256 amount);

  constructor(IPookyball _pookyball, IWaitList _waitlist, address _treasury, Template[] memory _templates) {
    pookyball = _pookyball;
    waitlist = _waitlist;
    treasury = _treasury;

    for (uint i = 0; i < _templates.length; i++) {
      templates[nextTemplateId++] = _templates[i];
    }
  }

  /**
   * @notice Mint one or more Pookyball token to a account.
   * @dev Requirements:
   * - template should exists (check with the SoldOut error)
   * - template should not have sold out
   * - enough native currency should be sent to cover the mint price
   */
  function mint(uint256 templateId, address recipient, uint256 quantity) external payable {
    if (!waitlist.isEligible(recipient)) {
      revert NotEligible(recipient);
    }

    Template memory template = templates[templateId];

    if (template.minted + quantity > template.supply) {
      revert SoldOut(templateId, template.supply - template.minted);
    }

    if (msg.value < quantity * template.price) {
      revert InsufficientValue(quantity * template.price, msg.value);
    }

    // Actual Pookyball token mint
    for (uint256 i = 0; i < quantity; i++) {
      pookyball.mint(recipient, template.rarity, template.luxury);
    }

    templates[templateId].minted += quantity;

    // Forward the funds to the treasury wallet
    (bool sent, ) = treasury.call{ value: msg.value }("");
    if (!sent) {
      revert TransferFailed(treasury, msg.value);
    }

    emit Sale(recipient, templateId, quantity, msg.value);
  }
}
