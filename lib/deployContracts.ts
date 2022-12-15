import {
  GenesisMinter__factory,
  Level__factory,
  POK__factory,
  Pookyball__factory,
  Rewards__factory,
  WaitList__factory,
} from '../types';
import deployer from './deploy';
import logger from './logger';
import { BURNER, GAME, MINTER, REWARDER } from './roles';
import Config from './types/Config';
import waitTx from './waitTx';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from 'ethers';

/**
 * Deploy the full contract stack and configure the access controls and the contracts links properly.
 * This function is used in the deployment scripts AND in the tests to ensure a maximized compatibility and reliability.
 */
export async function deployContracts(signer: SignerWithAddress, options: Config) {
  if (options.log) {
    logger.setSettings(options.log);
  } else if (options.log === false) {
    logger.setSettings({ minLevel: 'error' });
  }

  const deploy = deployer(signer, options.verify);

  // Step 1: deploy tokens
  const POK = await deploy(POK__factory);
  logger.info('Deployed POK to', POK.address);

  const Pookyball = await deploy(
    Pookyball__factory,
    options.metadata.baseURI,
    options.metadata.contractURI,
    options.vrf.coordinator,
    options.vrf.keyHash,
    options.vrf.subId,
    options.vrf.minimumRequestConfirmations,
    options.vrf.gasLimit,
  );
  logger.info('Deployed Pookyball to', Pookyball.address);

  // Step 2: deploy mint contracts
  const WaitList = await deploy(WaitList__factory);
  logger.info('Deployed WaitList to', WaitList.address);

  const GenesisMinter = await deploy(
    GenesisMinter__factory,
    Pookyball.address,
    WaitList.address,
    options.accounts.treasury,
  );
  await GenesisMinter.deployed();
  logger.info('Deployed GenesisMinter to', GenesisMinter.address);

  // Step 3: deploy game contracts
  const Level = await deploy(Level__factory, POK.address, Pookyball.address);
  await Level.deployed();
  logger.info('Deployed Level to', Level.address);

  const Rewards = await deploy(Rewards__factory, POK.address, Pookyball.address);
  await Rewards.deployed();
  logger.info('Deployed Rewards to', Rewards.address);

  // Step 4: assign permissions
  await waitTx(POK.grantRole(MINTER, Rewards.address));
  await waitTx(POK.grantRole(BURNER, Level.address));
  await waitTx(Pookyball.grantRole(MINTER, GenesisMinter.address));
  await waitTx(Pookyball.grantRole(GAME, Level.address));
  await waitTx(Pookyball.grantRole(GAME, Rewards.address));
  await waitTx(Rewards.grantRole(REWARDER, options.accounts.backend));

  // Step 5: create the mint templates
  let supplyCounter = options.mint.totalSupply;
  for (const template of options.mint.templates) {
    let supply: number;

    if (template.supply === null) {
      supply = supplyCounter;
    } else {
      supply = Math.round((options.mint.totalSupply * template.supply) / 10000);
    }

    await waitTx(GenesisMinter.createTemplate(template.rarity, template.luxury, supply, 0, template.price));
    logger.info('price=', ethers.utils.formatEther(template.price), 'supply=', supply);

    supplyCounter -= supply;
  }

  return { POK, Pookyball, WaitList, GenesisMinter, Level, Rewards };
}
