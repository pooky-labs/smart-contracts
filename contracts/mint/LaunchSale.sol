// SPDX-License-Identifier: MIT
// Pooky Game Contracts (LaunchSale.sol)
pragma solidity ^0.8.17;

import "../interfaces/IPookyball.sol";
import "../types/PookyballRarity.sol";

struct Template {
  PookyballRarity rarity;
  uint256 supply;
  uint256 minted;
  uint256 price;
}

/*
 * @title LaunchSale
 * @author Mathieu Bour
 * @notice Extended Sale contract to celebrate Pooky Play-to-Earn launch.
 */
contract LaunchSale {
  // Contracts
  IPookyball public immutable pookyball;

  /// Where the mint funds will be forwarded
  address immutable treasury;

  /// The lasted assigned template id, useful to iterate over the templates.
  uint256 public nextTemplateId;
  mapping(uint256 => Template) public templates;

  /// Fired when a sale is made
  event Sale(address indexed account, uint256 indexed templateId, uint256 quantity, uint256 value);

  /// Thrown when a mint would exceed the template supply.
  error InsufficientSupply(uint256 templateId, uint256 remaining);
  /// Thrown when the msg.value of the mint function does not cover the mint cost.
  error InsufficientValue(uint256 expected, uint256 actual);
  /// Thrown when the native transfer has failed.
  error TransferFailed(address recipient, uint256 amount);

  /**
   * @param _pookyball The Pookyball ERC721 contract address.
   * @param _treasury The account which will receive all the funds.
   * @param _templates The available mint templates.
   */
  constructor(IPookyball _pookyball, address _treasury, Template[] memory _templates) {
    pookyball = _pookyball;
    treasury = _treasury;

    for (uint i = 0; i < _templates.length; i++) {
      templates[nextTemplateId++] = _templates[i];
    }
  }

  /**
   * @return The available mint templates (the same as the ones passed in the constructor).
   */
  function getTemplates() external view returns (Template[] memory) {
    Template[] memory _templates = new Template[](nextTemplateId);

    for (uint i = 0; i < nextTemplateId; i++) {
      _templates[i] = templates[i];
    }

    return _templates;
  }

  /**
   * @notice Mint one or more Pookyball token to a account.
   * @dev Requirements:
   * - template should exists (check with the InsufficientSupply error)
   * - template should have enough supply
   * - enough native currency should be sent to cover the mint price
   */
  function mint(uint256 templateId, address recipient, uint256 quantity) external payable {
    Template memory template = templates[templateId];

    if (template.minted + quantity > template.supply) {
      revert InsufficientSupply(templateId, template.supply - template.minted);
    }

    if (msg.value < quantity * template.price) {
      revert InsufficientValue(quantity * template.price, msg.value);
    }

    // Build the arrays for the batched mint
    address[] memory recipients = new address[](quantity);
    PookyballRarity[] memory rarities = new PookyballRarity[](quantity);

    for (uint256 i = 0; i < quantity; i++) {
      recipients[i] = recipient;
      rarities[i] = template.rarity;
    }

    // Actual Pookyball token mint
    pookyball.mint(recipients, rarities);

    templates[templateId].minted += quantity;

    // Forward the funds to the treasury wallet
    (bool sent, ) = treasury.call{ value: msg.value }("");
    if (!sent) {
      revert TransferFailed(treasury, msg.value);
    }

    emit Sale(recipient, templateId, quantity, msg.value);
  }

  /**
   * @notice return the ineligibility reason of a set of parameters.
   * Required for Paper.xyz custom contract integrations.
   * See https://docs.withpaper.com/reference/eligibilitymethod
   * @return The reason why the parameters are invalid; empty string if teh parameters are valid.
   */
  function ineligibilityReason(uint256 templateId, uint256 quantity) external view returns (string memory) {
    if (templates[templateId].minted + quantity > templates[templateId].supply) {
      return "insufficient supply";
    }

    return "";
  }
}
