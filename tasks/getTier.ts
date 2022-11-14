import State from '../lib/state';
import { task } from 'hardhat/config';
import { string } from 'hardhat/internal/core/params/argumentTypes';
import prompts from 'prompts';

interface GetTierArgs {
  account?: string;
}

task('getTier', 'Get the waitlist tier of an account')
  .addOptionalPositionalParam('account', 'The account to lookup', undefined, string)
  .setAction(async (args: GetTierArgs, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const state = new State(hre.network.name);
    const PookyMinter = await state.connect('PookyballGenesisMinter', signer);

    const answers = await prompts({
      type: args.account ? false : 'text',
      name: 'account',
      message: 'Enter account address to lookup',
    });

    const tier = await PookyMinter.accountTiers(args.account ?? answers.account);
    process.stdout.write(`${tier.toString()}\n`);
  });
