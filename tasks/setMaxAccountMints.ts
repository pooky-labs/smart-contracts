import logger from '../lib/logger';
import State from '../lib/state';
import waitTx from '../lib/waitTx';
import { task } from 'hardhat/config';
import prompts from 'prompts';

task('setMaxAccountMints', 'Set the maximum allowed mints per account')
  .addOptionalPositionalParam('maxAccountMints', 'The new maximum mints per account')
  .setAction(async (args, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const state = new State(hre.network.name);
    const PookyballMinter = state.connect('PookyballGenesisMinter', signer);

    const currentMaxAccountMints = (await PookyballMinter.maxAccountMints()).toNumber();
    const answers = await prompts({
      type: args.maxAccountMints ? false : 'number',
      name: 'maxAccountMints',
      message: 'Enter maximum mints per account',
      initial: currentMaxAccountMints,
    });

    const newMaxAccountMints = parseInt(answers.maxAccountMints ?? args.maxAccountMints);

    if (newMaxAccountMints === currentMaxAccountMints) {
      logger.info('New value is identical to current one, skipping');
      return;
    }

    await waitTx(PookyballMinter.setMaxAccountMints(newMaxAccountMints));
  });
