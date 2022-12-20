import { BigNumber } from 'ethers';
import Config from '../types/Config';
import mainnet from './mainnet';

/**
 * Deploy configuration for Polygon Mumbai testnet.
 */
const mumbai: Config = {
  ...mainnet,
  verify: false,

  accounts: {
    treasury: '0x2dfCa6e357a73D180B8e6aa8f7690A315a4395F7',
    tech: '0xF00Db2f08D1F6b3f6089573085B5826Bb358e319',
    backend: '0xCAFE3e690bf74Ec274210E1c448130c1f8228513',
  },

  metadata: {
    contractURI: 'https://static.pooky.tech/contracts/Pookyball.json',
    baseURI: 'https://tokens.pooky.tech/',
  },

  mint: {
    ...mainnet.mint,
    templates: mainnet.mint.templates.map((t) => ({
      ...t,
      // Price are divided by 1,000,000 on testnet because it is hard to get MATIC test tokens
      price: BigNumber.from(t.price).div(1e6),
    })),
  },

  vrf: {
    ...mainnet.vrf,
    coordinator: '0x7a1bac17ccc5b313516c5e16fb24f7659aa5ebed',
    keyHash: '0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f',
    subId: 2307, // see: https://vrf.chain.link/mumbai/2307
  },
};

export default mumbai;