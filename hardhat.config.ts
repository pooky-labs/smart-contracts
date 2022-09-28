import { HardhatUserConfig } from "hardhat/config";
import "@openzeppelin/hardhat-upgrades";
import "./tasks/helperTasks";
import "./tasks/pookyTasks";
import "./tasks/setTasks";
import "./tasks/getTasks";
import "solidity-docgen";

require("dotenv").config();

const config: HardhatUserConfig = {
  solidity: "0.8.9",

  networks: {
    hardhat: {},
    mumbai: {
      url: process.env.MUMBAI_RPC,
      accounts: [
        process.env.PK_DEPLOYER as string,
        process.env.PK_BESIGNER as string,
        process.env.PK_TREASURY as string,
        process.env.PK_MOD as string,
        process.env.PK_PLAYER1 as string
      ]
    },
  },

  etherscan: {
    apiKey: process.env.POLYGONSCAN_API_KEY,
  },

  docgen: {
    pages: "files",
  },
};

export default config;
