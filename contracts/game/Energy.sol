// SPDX-License-Identifier: MIT
// Pooky Game Contracts (game/Energy.sol)
pragma solidity ^0.8.17;

import "../interfaces/IPOK.sol";

/**
 * @title Energy
 * @author Mathieu Bour
 * @notice Allow to recharge energy by spending $POK tokens and native currency.
 */
contract Energy {
  /// Price per energy point in native currency.
  uint256 public constant UNIT_NAT = 0.012e18;
  /// Price per energy point in $POK tokens.
  uint256 public constant UNIT_POK = 0.321e18;

  IPOK immutable pok;
  address immutable treasury;

  /// Emitted when the energy has been recharged.
  event EnergyRecharged(address account, uint8 amount);

  /// Thrown when the transaction exceeds the maximum value.
  error ExcessiveValue(uint256 maximum, uint256 actual);
  /// Thrown when the sender does own enough $POK tokens.
  error InsufficientPOK(uint256 expected, uint256 actual);
  /// Thrown when the native transfer has failed.
  error TransferFailed(address recipient, uint256 amount);

  constructor(IPOK _pok, address _treasury) {
    pok = _pok;
    treasury = _treasury;
  }

  /**
   * @notice Recharge the energy by spending $POK tokens and native currency.
   * @dev Split is determined by the message value in native currency.
   * Requirements:
   * - msg.value must not exceed the amount multiplied by the UNIT_NAT.
   * - sender should own enough $POK tokens.
   */
  function recharge(uint8 amount) external payable {
    uint256 amountNAT = msg.value / UNIT_NAT;
    if (amountNAT > amount) {
      revert ExcessiveValue(amount * UNIT_NAT, msg.value);
    }

    uint256 amountPOK = (amount - amountNAT) * UNIT_POK;
    if (amountPOK > pok.balanceOf(msg.sender)) {
      revert InsufficientPOK(amountPOK, pok.balanceOf(msg.sender));
    }

    if (amountPOK > 0) {
      pok.burn(msg.sender, amountPOK);
    }
    if (amountNAT > 0) {
      (bool sent, ) = address(treasury).call{ value: amountNAT }("");
      if (!sent) {
        revert TransferFailed(msg.sender, amountNAT);
      }
    }

    emit EnergyRecharged(msg.sender, amount);
  }
}
