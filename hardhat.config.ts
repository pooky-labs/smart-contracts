import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import 'solidity-docgen';

require('dotenv').config();

import "./tasks/helperTasks";
import "./tasks/pookyTasks";

const config: HardhatUserConfig = {
  solidity: "0.8.9",

  networks: {
    hardhat: {
    },
    mumbai: {
      url: process.env.MUMBAI_RPC,
      accounts: [
        process.env.PK_DEPLOYER as string,
        process.env.PK_PROXYADMIN as string,
        process.env.PK_BESIGNER as string
      ]
    }
  },

  etherscan: {
    apiKey: process.env.POLYGONSCAN_API_KEY
  },

  docgen: { 
    pages: 'files'
  },
};

export default config;
