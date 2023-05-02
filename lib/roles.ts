import { solidityPackedKeccak256 } from 'ethers';

/**
 * Shortcut for the solidity keccak256 function. Useful to hash the roles constants the same way as in the contracts.
 * @param role The role to hash in human-readable text.
 */
export default function hashRole(role: string): string {
  return solidityPackedKeccak256(['string'], [role]);
}

export const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';
export const MINTER = hashRole('MINTER');
export const BURNER = hashRole('BURNER');
export const GAME = hashRole('GAME');
export const REWARDER = hashRole('REWARDER');
export const OPERATOR = hashRole('OPERATOR');
export const SELLER = hashRole('SELLER');
