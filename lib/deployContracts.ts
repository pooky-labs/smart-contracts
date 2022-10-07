import { POK__factory, PookyBall__factory, PookyGame__factory, PookyMintEvent__factory } from '../typings';
import * as Params from './constants';
import { deployWithProxy } from './deployWithProxy';
import getSigners from './getSigners';
import { registerContractInJsonDb } from './helpers/DbHelper';
import logger from './logger';
import { BE, MOD, POOKY_CONTRACT } from './roles';
import { ContractStack } from './types';
import waitTx from './waitTx';

interface DeployContractsOptions {
  /** Write the logs */
  log?: boolean;

  /** Write the deployed contracts to the file database. */
  writeInDB?: boolean;
}

/**
 * Deploy the full contract stack and configure the access controls and the contracts links properly.
 * This function is used in the deployment scripts AND in the tests to ensure a maximized compatibility and reliability.
 */
export async function deployContracts({
  log = true,
  writeInDB = true,
}: DeployContractsOptions = {}): Promise<ContractStack> {
  const { deployer, treasury, backendSigner, mod } = await getSigners();
  logger.setSettings({
    minLevel: log ? 'silly' : 'error',
  });

  const POK = await deployWithProxy(new POK__factory().connect(deployer), ['Pook Token', 'POK', deployer.address]);
  logger.info('Deployed POK to', POK.address);

  const PookyBall = await deployWithProxy(new PookyBall__factory().connect(deployer), [
    'Pooky Ball',
    'POOKY BALL',
    'https://baseuri/',
    'https://contracturi',
    deployer.address,
  ]);
  logger.info('Deployed PookyBall to', PookyBall.address);

  const PookyMintEvent = await deployWithProxy(new PookyMintEvent__factory().connect(deployer), [
    Params.START_ID,
    deployer.address,
    treasury.address,
    Params.MAX_MINT_SUPPLY,
    Params.MAX_BALLS_PER_USER,
    Params.REVOKE_PERIOD,
    Params.VRF_COORDINATOR,
    Params.GAS_LIMIT,
    Params.MINIMUM_CONFIRMATIONS,
    Params.KEY_HASH,
    Params.SUBSCRIPTION_ID,
  ]);
  logger.info('Deployed PookyMintEvent to', PookyMintEvent.address);

  const PookyGame = await deployWithProxy(new PookyGame__factory().connect(deployer), []);
  logger.info('Deployed PookyGame to', PookyGame.address);

  if (writeInDB) {
    await registerContractInJsonDb('POK', POK);
    await registerContractInJsonDb('PookyBall', PookyBall);
    await registerContractInJsonDb('PookyMintEvent', PookyMintEvent);
    await registerContractInJsonDb('PookyGame', PookyGame);
  }

  await waitTx(POK.grantRole(POOKY_CONTRACT, PookyMintEvent.address));
  await waitTx(POK.grantRole(POOKY_CONTRACT, PookyGame.address));

  await waitTx(PookyBall.grantRole(POOKY_CONTRACT, PookyMintEvent.address));
  await waitTx(PookyBall.grantRole(POOKY_CONTRACT, PookyGame.address));

  await waitTx(PookyMintEvent.grantRole(BE, backendSigner.address));
  await waitTx(PookyMintEvent.grantRole(MOD, mod.address));
  await waitTx(PookyMintEvent.setPookyBallContract(PookyBall.address));

  await waitTx(PookyGame._setLevelPxpNeeded());
  await waitTx(PookyGame._setLevelCost());
  await waitTx(PookyGame._setMaxBallLevel());
  await waitTx(PookyGame.setPookyBallContract(PookyBall.address));
  await waitTx(PookyGame.setPookToken(POK.address));
  await waitTx(PookyGame.setPookySigner(backendSigner.address));

  return { POK, PookyBall, PookyMintEvent, PookyGame };
}
