import State from '../lib/state';
import waitTx from '../lib/waitTx';
import { task } from 'hardhat/config';
import prompts from 'prompts';

interface SetTierArgs {
  account?: string;
  tier?: number;
}

task('setTier', 'Set the tier of one or multiple account')
  .addPositionalParam('account', 'The account address')
  .addPositionalParam('tier', 'The tier to set')
  .setAction(async (args: SetTierArgs, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const state = new State(hre.network.name);
    const PookyballMinter = state.connect('PookyballGenesisMinter', signer);

    const answers = await prompts([
      {
        type: args.account ? false : 'text',
        name: 'account',
        message: 'Enter account address',
      },
      {
        type: args.tier ? false : 'number',
        name: 'tier',
        message: 'Enter account tier',
      },
    ]);

    await waitTx(PookyballMinter.setTierBatch([answers.account ?? args.account], [answers.tier ?? args.tier]));
  });
