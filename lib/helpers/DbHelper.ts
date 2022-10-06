import { Contract } from 'ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';

export const getDb = () => low(new FileSync('./deployed-contracts.json'));

export const registerContractInJsonDb = async (contractName: string, contractInstance: Contract) => {
  getDb().set(contractName, { address: contractInstance.address }).write();
};

export const getContractFromJsonDb = async (contractName: string, hre: HardhatRuntimeEnvironment) => {
  return await hre.ethers.getContractAt(contractName, (await getDb().get(contractName).value()).address);
};
