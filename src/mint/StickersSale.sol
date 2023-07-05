// SPDX-License-Identifier: MIT
// Pooky Game Contracts (mint/StickersSale.sol)
pragma solidity 0.8.20;

import { OwnableRoles } from "solady/auth/OwnableRoles.sol";
import { IStickers, StickerMint, StickerRarity } from "../interfaces/IStickers.sol";
import { Treasury } from "../utils/Treasury.sol";

struct Bundle {
  uint256 price;
  /// Supply of the current sale
  uint256 supply;
  /// Total number of tokens minted during all the sales
  uint256 minted;
  /// Total supply of all the sales
  uint256 totalSupply;
  BundleContent content;
}

struct BundleContent {
  /// How many common stickers are in the bundle.
  uint256 common;
  /// How many rare stickers are in the bundle.
  uint256 rare;
  /// How many epic stickers are in the bundle.
  uint256 epic;
  /// How many legendary stickers are in the bundle.
  uint256 legendary;
}

struct Refill {
  uint256 bundleId;
  /// The token price in native currency wei.
  uint256 price;
  /// The refill token quantity.
  uint256 quantity;
}

/**
 * @title StickersSale
 * @author Mathieu Bour
 */
contract StickersSale is OwnableRoles, Treasury {
  StickerRarity[] public rarities =
    [StickerRarity.COMMON, StickerRarity.RARE, StickerRarity.EPIC, StickerRarity.LEGENDARY];

  uint256 public constant SELLER = _ROLE_0;

  /// The Stickers contract address.
  IStickers public immutable stickers;

  /// The date when next mint window will open (compared to block.timestamp).
  uint256 public closedUntil;

  mapping(uint256 => Bundle) private bundles;
  /// The number of created bundles.
  uint256 size;

  /// Thrown when a mint is attempt before the sale opens.
  error Closed(uint256 closedUntil);
  /// Thrown when the passed bundle id is invalid (greter or equal than `size`).
  error InvalidBundle();
  /// Thrown when a mint would exceed the bundle supply.
  error InsufficientSupply(uint256 bundleId);
  /// Thrown when the msg.value of the mint function does not cover the mint cost.
  error InsufficientValue(uint256 actual, uint256 expected);
  /// Thrown when the native transfer has failed.
  error TransferFailed(address recipient, uint256 amount);

  constructor(IStickers _stickers, address admin, address _treasury, Bundle[] memory _bundles)
    Treasury(_treasury)
  {
    stickers = _stickers;
    _initializeOwner(admin);

    uint256 length = _bundles.length;
    for (uint256 i; i < length;) {
      _create(_bundles[i]);
      unchecked {
        i++;
      }
    }
  }

  /**
   * @notice List available bundles.
   */
  function getBundles() external view returns (Bundle[] memory) {
    Bundle[] memory output = new Bundle[](size);
    for (uint256 i; i < size;) {
      output[i] = bundles[i];
      unchecked {
        i++;
      }
    }

    return output;
  }

  /**
   * @notice Checks if the sale is open.
   */
  function isClosed() public view returns (bool) {
    return closedUntil == 0 || block.timestamp < closedUntil;
  }

  /**
   * @dev Internal unprotected bundle creation.
   */
  function _create(Bundle memory _bundle) internal {
    bundles[size++] = _bundle;
  }

  /**
   * @notice Create a new bundle.
   * @dev Requirements:
   * - Only owner can create new bundles.
   */
  function create(Bundle memory _bundle) external onlyOwner {
    _create(_bundle);
  }

  /**
   * @notice Purchase a Stickers bundle.
   * @dev Requirements:
   * - Sale mosut be open.
   * - Bundle ID must exist.
   * - Transaction value must be greater or equal than the bundle price.
   */
  function purchase(uint256 bundleId) external payable {
    if (isClosed()) {
      revert Closed(closedUntil);
    }

    if (bundleId >= size) {
      revert InvalidBundle();
    }

    Bundle memory bundle = bundles[bundleId];

    if (bundle.minted + 1 > bundle.totalSupply) {
      revert InsufficientSupply(bundleId);
    }

    if (msg.value < bundle.price) {
      revert InsufficientValue(msg.value, bundle.price);
    }

    uint256 quantity =
      bundle.content.common + bundle.content.rare + bundle.content.epic + bundle.content.legendary;

    StickerMint[] memory requests = new StickerMint[](quantity);

    uint256 requestId;
    for (uint256 i; i < bundle.content.common;) {
      requests[requestId++] = StickerMint(msg.sender, StickerRarity.COMMON);
      unchecked {
        i++;
      }
    }
    for (uint256 i; i < bundle.content.common;) {
      requests[requestId++] = StickerMint(msg.sender, StickerRarity.RARE);
      unchecked {
        i++;
      }
    }
    for (uint256 i; i < bundle.content.common;) {
      requests[requestId++] = StickerMint(msg.sender, StickerRarity.EPIC);
      unchecked {
        i++;
      }
    }
    for (uint256 i; i < bundle.content.common;) {
      requests[requestId++] = StickerMint(msg.sender, StickerRarity.LEGENDARY);
      unchecked {
        i++;
      }
    }

    stickers.mint(requests);
    bundles[bundleId].minted++;

    // Forward the funds to the treasury wallet
    (bool sent,) = treasury.call{ value: msg.value }("");
    if (!sent) {
      revert TransferFailed(treasury, msg.value);
    }
  }

  /**
   * @notice Restock the sale items.
   * @param refills Array of the modifications to apply.
   * @param _closedUntil Update the opening of the sale; a date in the past opens the sale immediately.
   * @dev Requirements:
   * - msg.sender must have the SELLER role or be the owner
   */
  function restock(Refill[] memory refills, uint256 _closedUntil) external onlyRolesOrOwner(SELLER) {
    uint256 length = refills.length;
    for (uint256 i = 0; i < length; i++) {
      Bundle memory current = bundles[refills[i].bundleId];
      current.price = refills[i].price;
      current.totalSupply = current.minted + refills[i].quantity;
      current.supply = refills[i].quantity;
      bundles[refills[i].bundleId] = current;
    }

    closedUntil = _closedUntil;
  }
}
