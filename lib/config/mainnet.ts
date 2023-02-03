import Config from '../types/Config';
import parseEther from '../utils/parseEther';

/**
 * Deploy configuration for Polygon Mainnet.
 */
const mainnet: Config = {
  confirmations: 5,
  verify: true,

  accounts: {
    admin: '0x3CC4F4372F83ad3C577eD6e1Aae3D244A1b955D5',
    treasury: {
      primary: '0x96224b6a800294f40c547f7ec0952ea222526040',
      secondary: '0x598895F50951186eFdCB160764a538f353894027',
      ingame: '0x703662853D7F9ad9D8c44128222266a736741437',
    },
    backend: '0xCAFE3e690bf74Ec274210E1c448130c1f8228513',
    operators: [
      '0xe73b648f6de254101052e126c0499c32ed736a37', // Mathieu Bour (windyy.eth)
      '0x481074326aC46C7BC52f0b25D2F7Aaf40f586472', // Pierre Gerbaud (pierregerbaud.eth)
    ],
  },

  metadata: {
    contractURI: 'https://static.pooky.gg/contracts/Pookyball.json',
    baseURI: 'https://tokens.pooky.gg/',
  },

  mint: {
    supply: {
      total: 1000,
      base: 10,
      multiplier: 4.5,
    },
    pricing: {
      base: parseEther(25),
      multiplier: 4,
    },
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
    subId: 586,
  },
};

export default mainnet;
