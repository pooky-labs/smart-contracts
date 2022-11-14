import { task } from 'hardhat/config';

task('accounts', 'Print the list of available accounts', async (_, hre) => {
  console.table(await hre.ethers.getSigners(), ['address']);
});
