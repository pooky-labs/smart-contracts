import '@nomicfoundation/hardhat-chai-matchers';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-etherscan';
import '@solidstate/hardhat-bytecode-exporter';
import '@typechain/hardhat';
import { config as loadConfig } from 'dotenv';
import 'hardhat-abi-exporter';
import 'hardhat-dependency-compiler';
import 'hardhat-gas-reporter';
import 'hardhat-ignore-warnings';
import { HardhatUserConfig } from 'hardhat/config';
import set from 'lodash/set';
import 'solidity-coverage';
import './lib/chai/assertions';

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
    version: '0.8.18', // see https://hardhat.org/hardhat-runner/docs/reference/solidity-support#solidity-support
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
    only: ['^contracts'],
    except: ['^contracts/testing'],
    path: 'abi',
    rename: (sourceName) => {
      return sourceName.replace(/^contracts\/(.*)\.sol$/, '$1');
    },
  },
  bytecodeExporter: {
    clear: true,
    runOnCompile: true,
    only: ['^contracts'],
    except: ['^contracts/testing'],
    path: 'bytecode',
    rename: (sourceName) => {
      return sourceName.replace(/^contracts\/(.*)\.sol$/, '$1');
    },
  },
  typechain: {
    target: 'ethers-v6',
  },
  gasReporter: {
    enabled: Boolean(process.env.REPORT_GAS),
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    currency: 'EUR',
    token: 'MATIC',
  },
};

if (process.env.POLYGON_RPC_URL) {
  set(config, 'networks.polygon', {
    url: process.env.POLYGON_RPC_URL,
    accounts,
  });
}

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
