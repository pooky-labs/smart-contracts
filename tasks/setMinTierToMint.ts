import State from '../lib/state';
import waitTx from '../lib/waitTx';
import { task } from 'hardhat/config';
import { int } from 'hardhat/internal/core/params/argumentTypes';
import prompts from 'prompts';

interface SetMintTierToMintArgs {
  tier?: number;
}

task('setMinTierToMint', 'Set the mint tier to mint')
  .addPositionalParam('tier', 'The minimum tier to set', undefined, int)
  .setAction(async (args: SetMintTierToMintArgs, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const state = new State(hre.network.name);
    const PookyMinter = await state.connect('PookyballGenesisMinter', signer);

    const answers = await prompts({
      type: args.tier ? false : 'number',
      name: 'tier',
      message: 'Enter the new minimum tier to mint',
      initial: (await PookyMinter.minTierToMint()).toNumber(),
    });

    await waitTx(PookyMinter.setMinTierToMint(answers.tier ?? args.tier));
  });
