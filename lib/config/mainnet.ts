import { constants } from 'ethers';
import Config from '../types/Config';
import templates from './templates';

/**
 * Deploy configuration for Polygon Mainnet.
 */
const mainnet: Config = {
  confirmations: 5,
  verify: true,

  accounts: {
    treasury: '0x96224b6a800294f40c547f7ec0952ea222526040',
    tech: '0x3CC4F4372F83ad3C577eD6e1Aae3D244A1b955D5',
    backend: constants.AddressZero, // TBD
  },

  metadata: {
    contractURI: 'https://static.pooky.gg/contracts/Pookyball.json',
    baseURI: 'https://tokens.pooky.gg/',
  },

  mint: {
    totalSupply: 20000,
    templates,
  },

  /**
   * Chainlink VRF configuration
   * @see https://vrf.chain.link/polygon
   */
  vrf: {
    gasLimit: 2500000, // Maximum allowed gas by VRFCoordinatorV2.getRequestConfig
    minimumRequestConfirmations: 10,

    coordinator: '0xae975071be8f8ee67addbc1a82488f1c24858067',
    keyHash: '0xcc294a196eeeb44da2888d17c0625cc88d70d9760a69d58d853ba6581a9ab0cd', // 500 gwei/gas
    subId: 0, // TBD
  },
};

export default mainnet;
