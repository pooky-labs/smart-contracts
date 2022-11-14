import { ZERO_ADDRESS } from '../constants';
import DeployConfig from '../typings/DeployConfig';
import templates from './templates';

/**
 * Deploy configuration for Polygon Mainnet.
 */
const mainnet: DeployConfig = {
  state: 'mainnet',
  verify: true,

  accounts: {
    treasury: ZERO_ADDRESS, // TBD
    tech: '0x3CC4F4372F83ad3C577eD6e1Aae3D244A1b955D5',
    backend: ZERO_ADDRESS, // TBD
  },

  metadata: {
    contractURI: 'https://contracts.pooky.gg/Pookyball.json',
    baseURI: 'https://tokens.pooky.gg/',
  },

  mint: {
    totalSupply: 20000,
    maxAccountsMints: 10,
    templates,
  },

  /**
   * Chainlink VRF configuration
   * @see https://vrf.chain.link/polygon
   */
  vrf: {
    gasLimit: 2500000, // Maximum allowed gas by VRFCoordinatorV2.getRequestConfig
    minimumConfirmations: 10,

    coordinator: '0xae975071be8f8ee67addbc1a82488f1c24858067',
    keyHash: '0xcc294a196eeeb44da2888d17c0625cc88d70d9760a69d58d853ba6581a9ab0cd', // 500 gwei/gas
    subscriptionId: 0, // TBD
  },
};

export default mainnet;
