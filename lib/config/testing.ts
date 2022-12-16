import { ethers } from 'hardhat';
import Config from '../types/Config';
import mainnet from './mainnet';

/**
 * Testing configuration: it should be as close as possible as the mainnet config.
 */
const testing: Omit<Config, 'accounts'> = {
  ...mainnet,
  log: false,
  confirmations: 0,
  verify: false,

  vrf: {
    ...mainnet.vrf,
    keyHash: ethers.utils.solidityKeccak256(['string'], ['RANDOM_KEY_HASH']),
  },
};

export default testing;
