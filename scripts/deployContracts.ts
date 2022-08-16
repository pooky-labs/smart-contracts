import hre, { ethers } from "hardhat";

async function deployWithProxy(contractName:string, initValues:string[], proxyAdmin:string, withLog:Boolean) {
    const UpgradableProxy = await ethers.getContractFactory("UpgradableProxy"); 

    const ContractFactory = await ethers.getContractFactory(contractName);
    const ImplContract = await ContractFactory.deploy();

    let initData = ImplContract.interface.encodeFunctionData("initialize", initValues);

    const ProxyContract = await UpgradableProxy.deploy(ImplContract.address, proxyAdmin, initData, { gasLimit: 5000000 });

    if (withLog) {
        console.log(contractName, "Proxy contract address:", ProxyContract.address);
        console.log(contractName, "Implementation Contract address:", ImplContract.address)
    }

    return ProxyContract.address;
}

export async function deployContracts(contracts:Contract[], withLog:Boolean) {

    let ethers = hre.ethers;

    const [deployer, proxyAdmin] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);

    for(let contract of contracts) {
       contract.address = await deployWithProxy(contract.name, contract.initValues, proxyAdmin.address, withLog);
    }
  }