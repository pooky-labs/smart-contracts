import Config from '../types/Config';
import mainnet from './mainnet';

/**
 * Deploy configuration for Polygon Mumbai testnet.
 */
const mumbai: Config = {
  ...mainnet,
  verify: true,

  accounts: {
    ...mainnet.accounts,
    treasury: {
      primary: '0x2dfCa6e357a73D180B8e6aa8f7690A315a4395F7',
      secondary: '0x2dfCa6e357a73D180B8e6aa8f7690A315a4395F7',
      ingame: '0x2dfCa6e357a73D180B8e6aa8f7690A315a4395F7',
    },
    admin: '0xF00Db2f08D1F6b3f6089573085B5826Bb358e319',
    backend: '0xCAFE3e690bf74Ec274210E1c448130c1f8228513',
  },

  tokens: {
    POK: '0x3aaB86a3FF752530BbE21a5b5a6A73005f11E348',
    Pookyball: '0x3f64DD5BE5E19dD34744EFcC74c1935004aeB270',
  },

  metadata: {
    contractURI: 'https://static.pooky.tech/contracts/Pookyball.json',
    baseURI: 'https://tokens.pooky.tech/',
  },

  templates: mainnet.templates.map((template) => ({
    ...template,
    price: template.price / 100000n,
  })),

  vrf: {
    ...mainnet.vrf,
    coordinator: '0x7a1bac17ccc5b313516c5e16fb24f7659aa5ebed',
    keyHash: '0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f',
    subId: 2307, // see: https://vrf.chain.link/mumbai/2307
  },
};

export default mumbai;
