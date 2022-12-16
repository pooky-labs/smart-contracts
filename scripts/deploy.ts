import mainnet from '../lib/config/mainnet';
import mumbai from '../lib/config/mumbai';
import { deployContracts } from '../lib/deployContracts';
import Config from '../lib/types/Config';
import { ethers, network } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();

  let config: Config;

  switch (network.name) {
    case 'mumbai':
      config = mumbai;
      break;
    default:
      config = mainnet;
      break;
  }

  await deployContracts(deployer, { ...config, state: network.name });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
