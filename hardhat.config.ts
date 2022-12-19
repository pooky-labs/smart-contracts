import '@nomicfoundation/hardhat-toolbox';
import { config as loadConfig } from 'dotenv';
import 'hardhat-dependency-compiler';
import 'hardhat-ignore-warnings';
import { HardhatUserConfig } from 'hardhat/config';
import set from 'lodash/set';
import './tasks/clean';
import './tasks/typechain';

loadConfig();

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.17', // see https://hardhat.org/hardhat-runner/docs/reference/solidity-support#solidity-support
    settings: {
      optimizer: {
        enabled: true,
      },
    },
  },
  networks: {
    hardhat: {
      gas: 'auto',
    },
    local: {
      url: 'http://127.0.0.1:8545/',
    },
  },
  dependencyCompiler: {
    paths: ['@chainlink/contracts/src/v0.8/mocks/VRFCoordinatorV2Mock.sol'],
  },
  warnings: {
    '@chainlink/contracts/src/v0.8/mocks/VRFCoordinatorV2Mock.sol': 'off',
  },
  typechain: {
    target: 'ethers-v5',
  },
  gasReporter: {
    enabled: Boolean(process.env.REPORT_GAS),
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    currency: 'EUR',
    token: 'MATIC',
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
