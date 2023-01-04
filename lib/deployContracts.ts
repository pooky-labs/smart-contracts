import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import {
  Airdrop__factory,
  GenesisMinter__factory,
  Level__factory,
  POK__factory,
  Pookyball__factory,
  Rewards__factory,
  VRFCoordinatorV2Interface__factory,
  WaitList__factory,
} from '../typechain-types';
import { TemplateStruct } from '../typechain-types/contracts/mint/GenesisMinter';
import deployer from './deployer';
import logger from './logger';
import { BURNER, DEFAULT_ADMIN_ROLE, GAME, MINTER } from './roles';
import Config from './types/Config';
import waitTx from './waitTx';

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

  // Step 0: prepare data
  const templates: TemplateStruct[] = [];

  let supplyCounter = options.mint.totalSupply;
  for (const template of options.mint.templates) {
    let supply: number;

    if (template.supply === null) {
      supply = supplyCounter;
    } else {
      supply = Math.round((options.mint.totalSupply * template.supply) / 10000);
    }

    templates.push({
      rarity: template.rarity,
      luxury: template.luxury,
      supply: supply,
      minted: 0,
      price: template.price,
    });

    supplyCounter -= supply;
  }

  logger.info('Deployer', signer.address);

  const deploy = deployer(signer, { verify: options.verify, confirmations: options.confirmations });

  // Step 1: deploy tokens
  const POK = await deploy(POK__factory);
  logger.info('Deployed POK to', POK.address);

  const Pookyball = await deploy(
    Pookyball__factory,
    options.metadata.baseURI,
    options.metadata.contractURI,
    options.accounts.treasury.secondary,
    options.vrf.coordinator,
    options.vrf.keyHash,
    options.vrf.subId,
    options.vrf.minimumRequestConfirmations,
    options.vrf.gasLimit,
  );
  logger.info('Deployed Pookyball to', Pookyball.address);

  // Step 2: deploy mint contracts
  const WaitList = await deploy(WaitList__factory, 3, options.accounts.admin, options.accounts.operators ?? []);
  logger.info('Deployed WaitList to', WaitList.address);

  const GenesisMinter = await deploy(
    GenesisMinter__factory,
    Pookyball.address,
    WaitList.address,
    options.accounts.treasury.primary,
    templates,
  );
  await GenesisMinter.deployed();
  logger.info('Deployed GenesisMinter to', GenesisMinter.address);

  // Step 3: deploy game contracts
  const Level = await deploy(Level__factory, POK.address, Pookyball.address);
  await Level.deployed();
  logger.info('Deployed Level to', Level.address);

  const Rewards = await deploy(Rewards__factory, POK.address, Pookyball.address, options.accounts.admin, [
    options.accounts.backend,
  ]);
  await Rewards.deployed();
  logger.info('Deployed Rewards to', Rewards.address);

  const Airdrop = await deploy(Airdrop__factory, options.accounts.admin, [options.accounts.backend]);
  await Airdrop.deployed();
  logger.info('Deployed Airdrop to', Airdrop.address);

  // Step 4: assign permissions
  // Step 4.1: assign DEFAULT_ADMIN_ROLE to the admin multi signature wallet
  await waitTx(POK.grantRole(DEFAULT_ADMIN_ROLE, options.accounts.admin));
  await waitTx(Pookyball.grantRole(DEFAULT_ADMIN_ROLE, options.accounts.admin));

  // Step 4.2: assign the required gameplay roles
  await waitTx(POK.grantRole(MINTER, Rewards.address));
  await waitTx(POK.grantRole(BURNER, Level.address));
  await waitTx(Pookyball.grantRole(MINTER, GenesisMinter.address));
  await waitTx(Pookyball.grantRole(MINTER, Rewards.address));
  await waitTx(Pookyball.grantRole(GAME, Level.address));
  await waitTx(Pookyball.grantRole(GAME, Rewards.address));

  // Step 4.3: resign all the DEFAULT_ADMIN_ROLE so only the multi signature remains admin
  await waitTx(POK.renounceRole(DEFAULT_ADMIN_ROLE, signer.address));
  await waitTx(Pookyball.renounceRole(DEFAULT_ADMIN_ROLE, signer.address));

  // Step 5: wire the VRF contracts
  const VRFCoordinatorV2 = await VRFCoordinatorV2Interface__factory.connect(options.vrf.coordinator, signer);
  await waitTx(VRFCoordinatorV2.addConsumer(options.vrf.subId, Pookyball.address));

  return { POK, Pookyball, WaitList, GenesisMinter, Level, Rewards, Airdrop };
}
