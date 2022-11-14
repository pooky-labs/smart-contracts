import logger from '../lib/logger';
import State from '../lib/state';
import waitTx from '../lib/waitTx';
import { task } from 'hardhat/config';
import { boolean } from 'hardhat/internal/core/params/argumentTypes';
import prompts from 'prompts';

interface SetTransferEnabledArgs {
  enabled?: boolean;
}

task('setTransferEnabled', 'Enable/disable POK transfers between users')
  .addOptionalPositionalParam('enabled', 'Explicitly set the status (true/false)', undefined, boolean)
  .setAction(async (args: SetTransferEnabledArgs, hre) => {
    const state = new State(hre.network.name);
    const [signer] = await hre.ethers.getSigners();
    const POK = state.connect('POK', signer);

    const current = await POK.transferEnabled();

    if (typeof args.enabled !== 'boolean') {
      const { yes } = await prompts({
        type: 'confirm',
        name: 'yes',
        message: `Transfer are currently ${current ? 'enabled' : 'disabled'}, ${current ? 'disable' : 'enable'} them?`,
      });

      if (!yes) {
        logger.info('Aborting');
        return;
      }
    } else if (args.enabled === current) {
      logger.info(`Transfers are already ${current ? 'enabled' : 'disabled'}, aborting`);
      return;
    }

    await waitTx(POK.setTransferEnabled(args.enabled ?? !current));
  });
