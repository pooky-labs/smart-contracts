import { ethers } from 'hardhat';

/**
 * Shortcut for the solidity keccak256 function. Useful to hash the roles constants the same way as in the contracts.
 * @param role The role to hash in human-readable text.
 */
export default function hashRole(role: string): string {
  return ethers.utils.solidityKeccak256(['string'], [role]);
}

export const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';
export const POOKY_CONTRACT = hashRole('POOKY_CONTRACT');
export const REWARD_SIGNER = hashRole('REWARD_SIGNER');
export const TECH = hashRole('TECH');
