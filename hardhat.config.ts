import './tasks/getTasks';
import './tasks/helperTasks';
import './tasks/pookyTasks';
import './tasks/setTasks';
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
  solidity: '0.8.9',
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
if (process.env.MUMBAI_RPC) {
  set(config, 'networks.mumbai', {
    url: process.env.MUMBAI_RPC,
    accounts: [process.env.PK_DEPLOYER as string],
  });
}

if (process.env.POLYGONSCAN_API_KEY) {
  set(config, 'etherscan.apiKey.polygon', process.env.POLYGONSCAN_API_KEY);
  set(config, 'etherscan.apiKey.polygonMumbai', process.env.POLYGONSCAN_API_KEY);
}

export default config;
