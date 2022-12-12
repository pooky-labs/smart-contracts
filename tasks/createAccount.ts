import { Wallet } from 'ethers';
import { task } from 'hardhat/config';

task('createAccount', 'Create a test account').setAction(async () => {
  const wallet = Wallet.createRandom();

  process.stdout.write(`\
Address:     ${wallet.address}
Private key: ${wallet.privateKey}
`);
});
