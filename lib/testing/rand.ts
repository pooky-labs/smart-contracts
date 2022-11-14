import { randomBytes } from 'crypto';
import { BigNumber, ethers } from 'ethers';

/**
 * Generate a random uint256.
 */
export function randUint256(): BigNumber {
  return BigNumber.from(ethers.utils.keccak256(randomBytes(32)));
}

/**
 * Generate a random wallet address.
 */
export function randAccount(): string {
  return ethers.Wallet.createRandom().address;
}
