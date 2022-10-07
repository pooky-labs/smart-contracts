import { HRE } from './set-hre';
import { task } from 'hardhat/config';

task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  await hre.run('set-hre');
  const accounts = await HRE.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task('createTestAccount', 'Creates new wallet (use only for dev testing)', async (taskArgs, hre) => {
  await hre.run('set-hre');
  const newWallet = hre.ethers.Wallet.createRandom();
  console.log('address: ', newWallet.address);
  console.log('private key: ', newWallet.privateKey);
});
