import { ethers } from 'hardhat';
import getConfig from '../lib/config/getConfig';
import createDeployer from '../lib/utils/createDeployer';

async function main() {
  const [signer] = await ethers.getSigners();
  const config = getConfig();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const deploy = createDeployer(signer, config);

  // Write deployment script here
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
