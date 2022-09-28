import { deployContracts, prepareContracts } from "./deployContracts";
import hre from "hardhat";

async function grantRolesAndConnectContracts() {
  await hre.run("grantRoles");
  await hre.run("setPookyBallContract");
  await hre.run("setPOKToken");
  await hre.run("setPookySigner");
}

async function setPookyGameContract() {
  await hre.run("setLevelPxpNeeded");
  await hre.run("setLevelCost");
  await hre.run("setMaxBallLevel");
}

async function main() {
  let contract = await prepareContracts();
  await deployContracts(contract, true);
  await setPookyGameContract();
  await grantRolesAndConnectContracts();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
