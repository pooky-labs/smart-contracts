import logger from '../lib/logger';
import State from '../lib/state';
import waitTx from '../lib/waitTx';
import { task } from 'hardhat/config';
import { int } from 'hardhat/internal/core/params/argumentTypes';
import prompts from 'prompts';

interface SetVRFParameters {
  coordinator?: string;
  keyhash?: string;
  subscriptionId?: number;
  gasLimit?: number;
  confirmations?: number;
}

task('setVRFParameters', 'Set the VRF parameters')
  .addOptionalParam('coordinator', 'The address of the Chainlink VRF2 coordinator')
  .addOptionalParam('keyhash', 'The Chainlink keyhash')
  .addOptionalParam('subscriptionId', 'The VRF subscription id', undefined, int)
  .addOptionalParam('gasLimit', 'The VRF subscription callbackGasLimit', undefined, int)
  .addOptionalParam('confirmations', 'The VRF subscription request confirmations (min: 3, max: 200)', undefined, int)
  .setAction(async (args: SetVRFParameters, hre) => {
    const state = new State(hre.network.name);
    const [signer] = await hre.ethers.getSigners();
    const PookyballGenesisMinter = state.connect('PookyballGenesisMinter', signer);

    const [cCoordinator, cKeyhash, cSubscriptionId, cGasLimit, cConfirmations] = await Promise.all([
      PookyballGenesisMinter.vrf_coordinator(),
      PookyballGenesisMinter.vrf_keyHash(),
      PookyballGenesisMinter.vrf_subscriptionId(),
      PookyballGenesisMinter.vrf_callbackGasLimit(),
      PookyballGenesisMinter.vrf_requestConfirmations(),
    ]);

    const newCoordinator = args.coordinator ?? cCoordinator;
    const newKeyhash = args.keyhash ?? cKeyhash;
    const newSubscriptionId = args.subscriptionId ?? cSubscriptionId.toNumber();
    const newGasLimit = args.gasLimit ?? cGasLimit;
    const newConfirmations = args.confirmations ?? cConfirmations;

    const { yes } = await prompts({
      name: 'yes',
      type: 'confirm',
      message: [
        'New VRF parameters:',
        `Coordinator:        ${newCoordinator}`,
        `KeyHash:            ${newKeyhash}`,
        `Subscription ID:    ${newSubscriptionId}`,
        `Callback gas limit: ${newGasLimit}`,
        `Confirmations: ${newConfirmations}`,
      ].join('\n'),
    });

    if (!yes) {
      logger.info('Skipping');
      return;
    }

    await waitTx(
      PookyballGenesisMinter.setVrfParameters(
        newCoordinator,
        newSubscriptionId,
        newGasLimit,
        newConfirmations,
        newKeyhash,
      ),
    );
  });
