import { network } from 'hardhat';
import Config from '../types/Config';
import mainnet from './mainnet';
import mumbai from './mumbai';

/**
 * Get the configuration personalized for the current Hardhat network.
 */
export default function getConfig(): Config {
  switch (network.name) {
    case 'hardhat':
      return { ...mainnet, verify: false, confirmations: 0 };
    case 'local':
      return { ...mumbai, verify: false, confirmations: 0 };
    case 'mumbai':
      return mumbai;
    default:
      return mainnet;
  }
}
