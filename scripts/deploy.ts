import { deployContracts } from '../lib/deployContracts';
import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  await deployContracts(
    deployer,
    {
      treasury: process.env.DEPLOY_TREASURY as string,
      tech: process.env.DEPLOY_TREASURY as string,
      backend: process.env.DEPLOY_TECH as string,
    },
    { writeInDB: true },
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
