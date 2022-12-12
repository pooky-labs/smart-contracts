import './tasks';
import '@nomicfoundation/hardhat-chai-matchers';
import '@nomicfoundation/hardhat-toolbox';
import '@nomiclabs/hardhat-ethers';
import '@openzeppelin/hardhat-upgrades';
import { config as loadConfig } from 'dotenv';
import 'hardhat-ignore-warnings';
import { HardhatUserConfig } from 'hardhat/config';
import set from 'lodash/set';
import 'solidity-docgen';

loadConfig();

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.16', // see https://hardhat.org/hardhat-runner/docs/reference/solidity-support#solidity-support
    settings: {
      optimizer: {
        enabled: true,
      },
    },
  },
  networks: {
    local: {
      url: 'http://127.0.0.1:8545/',
    },
  },
  warnings: {
    'contracts/mocks/**/*': 'off',
  },
  typechain: {
    outDir: 'typings',
    target: 'ethers-v5',
  },
  gasReporter: {
    enabled: Boolean(process.env.REPORT_GAS),
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    currency: 'EUR',
    token: 'MATIC',
    excludeContracts: ['mocks', 'vendor'],
  },
  docgen: {
    pages: 'files',
  },
};

// Inject the mumbai network details only of the mumbai RPC url is provided
if (process.env.MUMBAI_RPC_URL) {
  set(config, 'networks.mumbai', {
    url: process.env.MUMBAI_RPC_URL,
    accounts: [process.env.DEPLOYER_PK as string],
  });
}

if (process.env.POLYGONSCAN_API_KEY) {
  set(config, 'etherscan.apiKey.polygon', process.env.POLYGONSCAN_API_KEY);
  set(config, 'etherscan.apiKey.polygonMumbai', process.env.POLYGONSCAN_API_KEY);
}

export default config;
