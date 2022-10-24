import {
  POK__factory,
  POKMock__factory,
  Pookyball__factory,
  PookyballGenesisMinter__factory,
  PookyballMock__factory,
  PookyGame__factory,
} from '../typings';
import * as Params from './constants';
import { deployWithProxy } from './deployWithProxy';
import logger from './logger';
import parseEther from './parseEther';
import { POOKY_CONTRACT, REWARD_SIGNER, TECH } from './roles';
import { BallLuxury, BallRarity, ContractStack } from './types';
import { registerContractInJsonDb } from './utils/DbHelper';
import waitTx from './waitTx';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from 'ethers';

/**
 * The accounts that will be linked to the deployed contracts.
 */
interface DeployStackAccounts {
  treasury: string;
  tech: string;
  backend: string;
}

interface DeployContractsOptions {
  /** Write the logs */
  log?: boolean;

  /** Write the deployed contracts to the file database. */
  writeInDB?: boolean;

  /** Use mocked POK and Pookyball instead */
  mock?: boolean;

  baseURI?: string;
  contractURI?: string;
  totalSupply?: number;
}

/**
 * Templates that will be created.
 * Supply are expressed over 10,000.
 */
const templates = [
  {
    rarity: BallRarity.Rare,
    luxury: BallLuxury.Common,
    supply: 1688,
    price: parseEther(140),
  },
  {
    rarity: BallRarity.Epic,
    luxury: BallLuxury.Common,
    supply: 367,
    price: parseEther(560),
  },
  {
    rarity: BallRarity.Epic,
    luxury: BallLuxury.Alpha,
    supply: 80,
    price: parseEther(1680),
  },
  {
    rarity: BallRarity.Legendary,
    luxury: BallLuxury.Common,
    supply: 80,
    price: parseEther(2240),
  },
  {
    rarity: BallRarity.Legendary,
    luxury: BallLuxury.Alpha,
    supply: 20,
    price: parseEther(6720),
  },

  // Common balls takes the rest of the supply
  {
    rarity: BallRarity.Common,
    luxury: BallLuxury.Common,
    supply: null,
    price: parseEther(35),
  },
];

/**
 * Deploy the full contract stack and configure the access controls and the contracts links properly.
 * This function is used in the deployment scripts AND in the tests to ensure a maximized compatibility and reliability.
 */
export async function deployContracts(
  deployer: SignerWithAddress,
  accounts: DeployStackAccounts,
  {
    log = true,
    writeInDB = true,
    mock = false,
    baseURI = 'https://tokens.pooky.gg/',
    contractURI = 'https://contract.pooky.gg/Pookyball.json',
    totalSupply = 20000,
  }: DeployContractsOptions = {},
): Promise<ContractStack> {
  logger.setSettings({
    minLevel: log ? 'silly' : 'error',
  });

  const POKFactory = mock ? new POKMock__factory() : new POK__factory();
  const POK = await deployWithProxy(POKFactory.connect(deployer), ['POK Token', 'POK', deployer.address]);
  logger.info('Deployed POK to', POK.address);

  const PookyballFactory = mock ? new PookyballMock__factory() : new Pookyball__factory();
  const Pookyball = await deployWithProxy(PookyballFactory.connect(deployer), [
    'Pookyball',
    'POOKY_CONTRACT BALL',
    baseURI,
    contractURI,
    deployer.address,
  ]);
  logger.info('Deployed Pookyball to', Pookyball.address);

  const PookyballGenesisMinter = await deployWithProxy(new PookyballGenesisMinter__factory().connect(deployer), [
    Params.START_ID,
    deployer.address,
    accounts.treasury,
    totalSupply,
    Params.MAX_BALLS_PER_USER,
    Params.VRF_COORDINATOR,
    Params.GAS_LIMIT,
    Params.MINIMUM_CONFIRMATIONS,
    Params.KEY_HASH,
    Params.SUBSCRIPTION_ID,
  ]);
  logger.info('Deployed PookyballGenesisMinter to', PookyballGenesisMinter.address);

  const PookyGame = await deployWithProxy(new PookyGame__factory().connect(deployer), [deployer.address]);
  logger.info('Deployed PookyGame to', PookyGame.address);

  if (writeInDB) {
    if (mock) {
      await registerContractInJsonDb('POKMock', POK);
      await registerContractInJsonDb('PookyballMock', Pookyball);
    } else {
      await registerContractInJsonDb('POK', POK);
      await registerContractInJsonDb('Pookyball', Pookyball);
    }

    await registerContractInJsonDb('PookyballGenesisMinter', PookyballGenesisMinter);
    await registerContractInJsonDb('PookyGame', PookyGame);
  }

  await waitTx(POK.grantRole(POOKY_CONTRACT, PookyballGenesisMinter.address));
  await waitTx(POK.grantRole(POOKY_CONTRACT, PookyGame.address));

  await waitTx(Pookyball.grantRole(POOKY_CONTRACT, PookyballGenesisMinter.address));
  await waitTx(Pookyball.grantRole(POOKY_CONTRACT, PookyGame.address));

  await waitTx(PookyballGenesisMinter.grantRole(TECH, accounts.tech));
  await waitTx(PookyballGenesisMinter.setPookyballContract(Pookyball.address));

  await waitTx(PookyGame.grantRole(REWARD_SIGNER, accounts.backend));
  await waitTx(PookyGame.setPookyballContract(Pookyball.address));
  await waitTx(PookyGame.setPOKContract(POK.address));

  // Create the mint templates using the TECH role
  await waitTx(PookyballGenesisMinter.grantRole(TECH, deployer.address));
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

    await waitTx(PookyballGenesisMinter.createMintTemplate(mintTemplate));
    logger.info('price=', ethers.utils.formatEther(mintTemplate.price), 'supply=', mintTemplate.maxMints);

    supplyCounter -= templateSupply;
  }
  await waitTx(PookyballGenesisMinter.renounceRole(TECH, deployer.address));

  return { POK, Pookyball, PookyballGenesisMinter, PookyGame };
}
