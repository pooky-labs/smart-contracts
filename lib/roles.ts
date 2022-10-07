import { ethers } from 'hardhat';

/**
 * Shortcut for the solidity keccak256 function. Useful to hash the roles constants the same way as in the contracts.
 * @param role The role to hash in human-readable text.
 */
export default function hashRole(role: string): string {
  return ethers.utils.solidityKeccak256(['string'], [role]);
}

export const POOKY_CONTRACT = hashRole('POOKY_CONTRACT');
export const BE = hashRole('BE');
export const MOD = hashRole('MOD');
