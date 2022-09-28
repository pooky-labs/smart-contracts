import { task } from "hardhat/config";
import { BigNumber, Wallet } from "ethers";
import { getContractFromJsonDb } from "../helpers/DbHelper";
import { HRE } from "./set-hre";
import { BallUpdates, signMatchweekClaimMessage } from "./helpers";

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  await hre.run("set-hre");
  const accounts = await HRE.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task(
  "createTestAccount",
  "Creates new wallet (use only for dev testing)",
  async (taskArgs, hre) => {
    await hre.run("set-hre");
    let newWallet = hre.ethers.Wallet.createRandom();
    console.log("address: ", newWallet.address);
    console.log("private key: ", newWallet.privateKey);
  }
);
