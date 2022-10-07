import { ONE } from './constants';
import { randomBytes } from 'crypto';
import { BigNumber, ethers } from 'ethers';

/**
 * Generate a random integer between 0 and n (inclusive).
 * @param n
 */
export function randInt(n: number) {
  return Math.ceil(Math.random() * (n - ONE) + ONE);
}

/**
 * Generate a random uint256.
 */
export function randUint256(): BigNumber {
  return BigNumber.from(ethers.utils.keccak256(randomBytes(32)));
}
