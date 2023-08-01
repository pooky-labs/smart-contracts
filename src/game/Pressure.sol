// SPDX-License-Identifier: MIT
// Pooky Game Contracts (game/Pressure.sol)
pragma solidity ^0.8.17;

import "../interfaces/IPOK.sol";

/// @title Pressure
/// @author Mathieu Bour
/// @notice Gameplay contract that allow to inflate/repair Pookyball tokens by spending $POK tokens and native currency.
/// @dev This contract has the POK.BURNER role.
contract Pressure {
  // Constants
  uint8[] public floors = [10, 20, 30, 40, 50, 60, 75, 100];
  uint256[] public floorsNAT =
    [0.064e18, 0.0538e18, 0.0452e18, 0.0379e18, 0.0319e18, 0.0268e18, 0.0225e18, 0.0189e18];
  uint256[] public floorsPOK =
    [2.286e18, 1.92e18, 1.613e18, 1.355e18, 1.138e18, 0.956e18, 0.803e18, 0.674e18];

  // Contracts
  IPOK immutable pok;
  address immutable treasury;

  /// Emitted when the Pookyball has been inflated.
  event Inflated(uint256 indexed tokenId, uint8 current, uint8 amount);

  /// Thrown when the inflate parameters greater than 100
  error InvalidParameters(uint256 current, uint256 amount);
  /// Thrown when the msg.value of the inflate function does not cover the inflate cost.
  error InsufficientValue(uint256 expected, uint256 actual);
  /// Thrown when the sender does own enough $POK tokens.
  error InsufficientPOK(uint256 expected, uint256 actual);
  /// Thrown when the native transfer has failed.
  error TransferFailed(address recipient, uint256 amount);

  constructor(IPOK _pok, address _treasury) {
    pok = _pok;
    treasury = _treasury;
  }

  /// @notice Compute the cost using the floors.
  /// @param current The current token pressure.
  /// @param amount The desired pressure increase.
  /// @param values The floor values.
  function compute(uint8 current, uint8 amount, uint256[] memory values)
    internal
    view
    returns (uint256)
  {
    if (current + amount > 100) {
      revert InvalidParameters(current, amount);
    }

    uint256 sum = 0;

    for (uint256 i = 0; i < floors.length; i++) {
      if (amount == 0) break;
      if (current > floors[i]) continue;

      uint8 size = floors[i] + 1 - current;
      uint8 delta = size > amount ? amount : size;

      sum += values[i] * delta;
      current += delta;
      amount -= delta;
    }

    return sum;
  }

  /// @notice Get the price to inflate a Pookyball token in native currency.
  /// @param current The current token pressure.
  /// @param amount The desired pressure increase.
  function priceNAT(uint8 current, uint8 amount) public view returns (uint256) {
    return compute(current, amount, floorsNAT);
  }

  /// @notice Get the price to inflate a Pookyball token in $POK tokens.
  /// @param current The current token pressure.
  /// @param amount The desired pressure increase.
  function pricePOK(uint8 current, uint8 amount) public view returns (uint256) {
    return compute(current, amount, floorsPOK);
  }

  /// @notice Compute the cost using the floors.
  /// @param tokenId The Pookyball token id to inflate.
  /// @param current The current token pressure.
  /// @param amount The desired pressure increase.
  function inflate(uint256 tokenId, uint8 current, uint8 amount) external payable {
    if (msg.value > 0) {
      // Sender is paying with native currency
      uint256 amountNAT = priceNAT(current, amount);

      if (msg.value < amountNAT) {
        revert InsufficientValue(msg.value, amountNAT);
      }

      (bool sent,) = address(treasury).call{ value: amountNAT }("");
      if (!sent) {
        revert TransferFailed(msg.sender, amountNAT);
      }
    } else {
      // Sender is paying with $POK tokens
      uint256 amountPOK = pricePOK(current, amount);

      if (pok.balanceOf(msg.sender) < amountPOK) {
        revert InsufficientPOK(pok.balanceOf(msg.sender), amountPOK);
      }

      pok.burn(msg.sender, amountPOK);
    }

    emit Inflated(tokenId, current, amount);
  }
}
