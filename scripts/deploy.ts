import { ethers } from 'hardhat';
import getConfig from '../lib/config/getConfig';
import { deployContracts } from '../lib/deployContracts';

async function main() {
  const [deployer] = await ethers.getSigners();
  await deployContracts(deployer, getConfig());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
