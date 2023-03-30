import { ethers } from 'hardhat';
import getConfig from '../lib/config/getConfig';
import deployer from '../lib/deployer';
import { Level__factory } from '../typechain-types';

async function main() {
  const [signer] = await ethers.getSigners();
  const config = getConfig();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const deploy = deployer(signer, config);

  // Write deployment script here
  await deploy(Level__factory, config.tokens.POK, config.tokens.Pookyball);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
