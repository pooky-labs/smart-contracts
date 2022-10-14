import {
  POK__factory,
  POKMock__factory,
  PookyBall__factory,
  PookyBallGenesisMinter__factory,
  PookyBallMock__factory,
  PookyGame__factory,
} from '../typings';
import * as Params from './constants';
import { deployWithProxy } from './deployWithProxy';
import getSigners from './getSigners';
import { registerContractInJsonDb } from './helpers/DbHelper';
import logger from './logger';
import parseEther from './parseEther';
import { BE, MOD, POOKY_CONTRACT, REWARD_SIGNER } from './roles';
import { BallLuxury, BallRarity, ContractStack } from './types';
import waitTx from './waitTx';
import { ethers } from 'ethers';

interface DeployContractsOptions {
  /** Write the logs */
  log?: boolean;

  /** Write the deployed contracts to the file database. */
  writeInDB?: boolean;

  /** Use mocked POK and PookyBall instead */
  mock?: boolean;

  totalSupply?: number;
}

const templates = [
  { rarity: BallRarity.Rare, luxury: BallLuxury.Common, supply: 1688, price: parseEther(140) },
  { rarity: BallRarity.Epic, luxury: BallLuxury.Common, supply: 367, price: parseEther(560) },
  { rarity: BallRarity.Epic, luxury: BallLuxury.Alpha, supply: 80, price: parseEther(1680) },
  { rarity: BallRarity.Legendary, luxury: BallLuxury.Common, supply: 80, price: parseEther(2240) },
  { rarity: BallRarity.Legendary, luxury: BallLuxury.Alpha, supply: 20, price: parseEther(6720) },

  // Common balls takes the rest of the supply
  { rarity: BallRarity.Common, luxury: BallLuxury.Common, supply: null, price: parseEther(35) },
];

/**
 * Deploy the full contract stack and configure the access controls and the contracts links properly.
 * This function is used in the deployment scripts AND in the tests to ensure a maximized compatibility and reliability.
 */
export async function deployContracts({
  log = true,
  writeInDB = true,
  mock = false,
  totalSupply = 20000,
}: DeployContractsOptions = {}): Promise<ContractStack> {
  const { deployer, treasury, backendSigner, mod } = await getSigners();
  logger.setSettings({
    minLevel: log ? 'silly' : 'error',
  });

  const POKFactory = mock ? new POKMock__factory() : new POK__factory();
  const POK = await deployWithProxy(POKFactory.connect(deployer), ['Pook Token', 'POK', deployer.address]);
  logger.info('Deployed POK to', POK.address);

  const PookyBallFactory = mock ? new PookyBallMock__factory() : new PookyBall__factory();
  const PookyBall = await deployWithProxy(PookyBallFactory.connect(deployer), [
    'Pooky Ball',
    'POOKY BALL',
    'https://baseuri/',
    'https://contracturi',
    deployer.address,
  ]);
  logger.info('Deployed PookyBall to', PookyBall.address);

  const PookyBallGenesisMinter = await deployWithProxy(new PookyBallGenesisMinter__factory().connect(deployer), [
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
  logger.info('Deployed PookyBallGenesisMinter to', PookyBallGenesisMinter.address);

  const PookyGame = await deployWithProxy(new PookyGame__factory().connect(deployer), [deployer.address]);
  logger.info('Deployed PookyGame to', PookyGame.address);

  if (writeInDB) {
    if (mock) {
      await registerContractInJsonDb('POKMock', POK);
      await registerContractInJsonDb('PookyBallMock', PookyBall);
    } else {
      await registerContractInJsonDb('POK', POK);
      await registerContractInJsonDb('PookyBall', PookyBall);
    }

    await registerContractInJsonDb('PookyBallGenesisMinter', PookyBallGenesisMinter);
    await registerContractInJsonDb('PookyGame', PookyGame);
  }

  await waitTx(POK.grantRole(POOKY_CONTRACT, PookyBallGenesisMinter.address));
  await waitTx(POK.grantRole(POOKY_CONTRACT, PookyGame.address));

  await waitTx(PookyBall.grantRole(POOKY_CONTRACT, PookyBallGenesisMinter.address));
  await waitTx(PookyBall.grantRole(POOKY_CONTRACT, PookyGame.address));

  await waitTx(PookyBallGenesisMinter.grantRole(BE, backendSigner.address));
  await waitTx(PookyBallGenesisMinter.grantRole(MOD, mod.address));
  await waitTx(PookyBallGenesisMinter.setPookyBallContract(PookyBall.address));

  await waitTx(PookyGame._setMaxBallLevel());
  await waitTx(PookyGame.setPookyBallContract(PookyBall.address));
  await waitTx(PookyGame.setPOKContract(POK.address));

  await waitTx(PookyGame.grantRole(REWARD_SIGNER, backendSigner.address));

  // Create the mint templates
  await waitTx(PookyBallGenesisMinter.grantRole(MOD, deployer.address));
  let supplyCounter = totalSupply;
  for (const template of templates) {
    let templateSupply: number;

    if (template.supply === null) {
      templateSupply = supplyCounter;
    } else {
      templateSupply = Math.round((totalSupply * template.supply) / 10000);
    }

    const mintTemplate = {
      enabled: true,
      currentMints: 0,
      rarity: template.rarity,
      luxury: template.luxury,
      price: template.price,
      payingToken: '0x0000000000000000000000000000000000000000',
      maxMints: templateSupply,
    };

    await waitTx(PookyBallGenesisMinter.createMintTemplate(mintTemplate));
    logger.info('price=', ethers.utils.formatEther(mintTemplate.price), 'supply=', mintTemplate.maxMints);

    supplyCounter -= templateSupply;
  }
  await waitTx(PookyBallGenesisMinter.renounceRole(MOD, deployer.address));

  return { POK, PookyBall, PookyBallGenesisMinter, PookyGame };
}
