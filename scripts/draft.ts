import { ethers } from 'hardhat';
import mumbai from '../lib/config/mumbai';
import deployer from '../lib/deployer';
import { Energy__factory } from '../typechain-types';

async function main() {
  const [signer] = await ethers.getSigners();
  const deploy = deployer(signer, { verify: true, confirmations: 5 });
  await deploy(Energy__factory, '0xC49e3507104A3Ca8d75D9C6b2004cB3A8e5B6621', mumbai.accounts.treasury.primary);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
