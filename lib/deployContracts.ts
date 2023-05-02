import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import {
  Level__factory,
  NonceRegistry__factory,
  POK__factory,
  Pookyball__factory,
  Pressure__factory,
  RefillableSale__factory,
  Rewards__factory,
  VRFCoordinatorV2Interface__factory,
} from '../typechain-types';
import logger from './logger';
import { BURNER, DEFAULT_ADMIN_ROLE, GAME, MINTER, OPERATOR } from './roles';
import Config from './types/Config';
import createDeployer from './utils/createDeployer';
import getAddress from './utils/getAddress';

/**
 * Deploy the full contract stack and configure the access controls and the contracts links properly.
 * This function is used in the deployment scripts AND in the tests to ensure a maximized compatibility and reliability.
 */
export async function deployContracts(signer: SignerWithAddress, config: Config) {
  if (config.log) {
    logger.settings = { ...logger.settings, ...config.log };
  } else if (config.log === false) {
    logger.settings.minLevel = 5; // error level
  }

  // Step 0: prepare data
  logger.info('Deployer', signer);

  const deploy = createDeployer(signer, {
    verify: config.verify,
    confirmations: config.confirmations,
    log: config.log !== false,
  });

  // Step 1: deploy tokens
  const POK = await deploy(POK__factory);
  logger.info('Deployed POK to', POK.target);

  const Pookyball = await deploy(
    Pookyball__factory,
    config.metadata.baseURI,
    config.metadata.contractURI,
    config.accounts.treasury.secondary,
    config.vrf.coordinator,
    config.vrf.keyHash,
    config.vrf.subId,
    config.vrf.minimumRequestConfirmations,
    config.vrf.gasLimit,
  );
  logger.info('Deployed Pookyball to', Pookyball.target);

  // Step 2: deploy mint contracts
  const RefillableSale = await deploy(
    RefillableSale__factory,
    Pookyball.target,
    config.accounts.treasury.primary,
    config.accounts.admin,
    config.accounts.operators ?? [],
  );
  logger.info('Deployed RefillableSale to', RefillableSale.target);

  // Step 3: deploy game contracts
  const Level = await deploy(Level__factory, POK.target, Pookyball.target);
  logger.info('Deployed Level to', Level.target);

  const Pressure = await deploy(Pressure__factory, POK.target, config.accounts.treasury.ingame);
  logger.info('Deployed Pressure to', Pressure.target);

  const NonceRegistry = await deploy(NonceRegistry__factory, [signer, config.accounts.admin], []);
  logger.info('Deployed NonceRegistry to', NonceRegistry.target);

  const Rewards = await deploy(
    Rewards__factory,
    POK.target,
    Pookyball.target,
    NonceRegistry.target,
    config.accounts.admin,
    [config.accounts.backend],
  );
  logger.info('Deployed Rewards to', Rewards.target);

  // Step 4: assign permissions
  // Step 4.1: assign DEFAULT_ADMIN_ROLE to the admin multi signature wallet
  await POK.grantRole(DEFAULT_ADMIN_ROLE, config.accounts.admin);
  await Pookyball.grantRole(DEFAULT_ADMIN_ROLE, config.accounts.admin);

  // Step 4.2: assign the required gameplay roles
  await POK.grantRole(MINTER, Rewards.target);
  await POK.grantRole(BURNER, Level.target);
  await POK.grantRole(BURNER, Pressure.target);
  await Pookyball.grantRole(MINTER, RefillableSale.target);
  await Pookyball.grantRole(MINTER, Rewards.target);
  await Pookyball.grantRole(GAME, Level.target);
  await Pookyball.grantRole(GAME, Rewards.target);
  await NonceRegistry.grantRole(OPERATOR, Rewards.target);

  // Step 4.3: resign all the DEFAULT_ADMIN_ROLE so only the multi signature remains admin
  await POK.renounceRole(DEFAULT_ADMIN_ROLE, signer.address);
  await Pookyball.renounceRole(DEFAULT_ADMIN_ROLE, signer.address);
  await NonceRegistry.grantRole(OPERATOR, signer.address);

  // Step 5: wire the VRF contracts
  const VRFCoordinatorV2 = await VRFCoordinatorV2Interface__factory.connect(config.vrf.coordinator, signer);
  await VRFCoordinatorV2.addConsumer(config.vrf.subId, Pookyball.target);

  // Step 6: patch config
  config.tokens.POK = getAddress(POK);
  config.tokens.Pookyball = getAddress(Pookyball);

  return {
    config,

    // Game
    NonceRegistry,
    Level,
    Pressure,
    Rewards,

    // Mint
    RefillableSale,

    // Tokens
    POK,
    Pookyball,
  };
}
