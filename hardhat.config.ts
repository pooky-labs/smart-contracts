import '@nomicfoundation/hardhat-toolbox';
import { config as loadConfig } from 'dotenv';
import 'hardhat-abi-exporter';
import 'hardhat-dependency-compiler';
import 'hardhat-ignore-warnings';
import { HardhatUserConfig } from 'hardhat/config';
import set from 'lodash/set';

loadConfig();

const accounts: string[] = [];

if (process.env.DEPLOYER_PK) {
  accounts.push(process.env.DEPLOYER_PK);
  if (process.env.PLAYER1_PK) {
    // Push the player 1 private key only if the deployer key is truthy
    accounts.push(process.env.PLAYER1_PK);
  }
}

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
    local: {
      url: 'http://127.0.0.1:8545/',
      accounts,
    },
  },
  dependencyCompiler: {
    paths: ['@chainlink/contracts/src/v0.8/mocks/VRFCoordinatorV2Mock.sol'],
  },
  warnings: {
    '@chainlink/contracts/src/v0.8/mocks/VRFCoordinatorV2Mock.sol': 'off',
  },
  abiExporter: {
    clear: true,
    runOnCompile: true,
    pretty: false,
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
    accounts,
  });
}

if (process.env.POLYGONSCAN_API_KEY) {
  set(config, 'etherscan.apiKey.polygon', process.env.POLYGONSCAN_API_KEY);
  set(config, 'etherscan.apiKey.polygonMumbai', process.env.POLYGONSCAN_API_KEY);
}

export default config;
