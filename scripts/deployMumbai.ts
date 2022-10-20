import { deployContracts } from '../lib/deployContracts';
import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  await deployContracts(
    deployer,
    {
      treasury: '0xBABA035d2e22073C3a2AadA404dae4f6A9D57BD7',
      tech: '0xF00Db2f08D1F6b3f6089573085B5826Bb358e319',
      backend: '0xCAFE3e690bf74Ec274210E1c448130c1f8228513',
    },
    { writeInDB: true, mock: true, totalSupply: 20000 },
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
