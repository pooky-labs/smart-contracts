// SPDX-License-Identifier: MIT
// Pooky Game Contracts (GenesisMinter.sol)
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
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

contract GenesisMinter is AccessControl {
  IPookyball public immutable pookyball;
  IWaitList public immutable waitlist;
  address immutable treasury;

  uint256 nextTemplateId;
  mapping(uint256 => Template) templates;

  error TemplateDisabled(uint256 templateId);
  error TemplateSoldOut(uint256 templateId, uint256 remaining);
  error InsufficientValue(uint256 expected, uint256 actual);
  /// Thrown when the native transfer has failed.
  error TransferFailed(address recipient, uint256 amount);

  constructor(IPookyball _pookyball, IWaitList _waitlist, address _treasury) {
    pookyball = _pookyball;
    waitlist = _waitlist;
    treasury = _treasury;
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
  }

  function createTemplate(
    PookyballRarity rarity,
    uint256 luxury,
    uint256 supply,
    uint256 minted,
    uint256 price
  ) external onlyRole(DEFAULT_ADMIN_ROLE) {
    uint256 templateId = nextTemplateId++;
    templates[templateId] = Template(rarity, luxury, supply, minted, price);
  }

  function template(uint256 templateId) external view returns (Template memory) {
    return templates[templateId];
  }

  function mint(uint256 templateId, address recipient, uint256 quantity) external payable {
    Template memory _template = templates[templateId];

    if (msg.value < quantity * _template.price) {
      revert InsufficientValue(quantity * _template.price, msg.value);
    }

    for (uint256 i = 0; i < quantity; i++) {
      pookyball.mint(recipient, _template.rarity, _template.luxury);
    }

    templates[templateId].minted += quantity;

    // Forward the funds to the treasury wallet
    (bool sent, ) = treasury.call{ value: msg.value }("");
    if (!sent) {
      revert TransferFailed(treasury, msg.value);
    }
  }
}
