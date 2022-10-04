import hre, { ethers, upgrades } from "hardhat";
import * as Params from "./constants";
import { registerContractInJsonDb } from "../helpers/DbHelper";

export async function prepareContracts() {
  let [deployer, , treasury, ,] = await ethers.getSigners();
  let contracts: Contract[] = [
    {
      name: "POK",
      initValues: ["Pook Token", "POK", deployer.address],
    },
    {
      name: "PookyBall",
      initValues: ["Pooky Ball", "POOKY BALL", "https://baseuri/", "https://contracturi", deployer.address],
    },
    {
      name: "PookyMintEvent",
      initValues: [
        Params.START_ID.toString(),
        deployer.address,
        treasury.address,
        Params.MAX_MINT_SUPPLY.toString(),
        Params.MAX_BALLS_PER_USER.toString(),
        Params.REVOKE_PERIOD.toString(),
        Params.VRF_COORDINATOR,
        Params.GAS_LIMIT.toString(),
        Params.MINIMUM_CONFIRMATIONS.toString(),
        Params.KEY_HASH,
        Params.SUBSCRIPTION_ID.toString(),
      ],
    },
    { name: "PookyGame", initValues: [] },
  ];

  return contracts;
}

async function deployWithProxy(
  contractName: string,
  initValues: string[],
  withLog: Boolean
) {
  const ContractFactory = await ethers.getContractFactory(contractName);
  const proxyContract = await upgrades.deployProxy(
    ContractFactory,
    initValues,
    {
      initializer: "initialize",
    }
  );

  await proxyContract.deployed();

  if (withLog) {
    console.log(contractName, "Proxy contract address:", proxyContract.address);
  }

  registerContractInJsonDb(contractName, proxyContract);

  return proxyContract.address;
}

export async function deployContracts(contracts: Contract[], withLog: Boolean) {
  //Delete proxy admin. When you deploy with upgrades admin is msg.sender
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  for (let contract of contracts) {
    contract.address = await deployWithProxy(
      contract.name,
      contract.initValues,
      withLog
    );
  }
}
