import Config from '../types/Config';
import mainnet from './mainnet';
import { ethers } from 'hardhat';

/**
 * Testing configuration: it should be as close as possible as the mainnet config.
 */
const testing: Omit<Config, 'accounts'> = {
  ...mainnet,
  log: false,
  verify: false,
  vrf: {
    ...mainnet.vrf,
    keyHash: ethers.utils.solidityKeccak256(['string'], ['RANDOM_KEY_HASH']),
  },
};

export default testing;
