import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import {
  Level__factory,
  NonceRegistry__factory,
  POK__factory,
  Pookyball__factory,
  Pressure__factory,
  RefillableSale__factory,
  Rewards__factory,
  Stickers__factory,
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
  logger.info('Deployer', getAddress(signer));

  const deploy = createDeployer(signer, {
    verify: config.verify,
    confirmations: config.confirmations,
    log: config.log !== false,
  });

  // Step 1: deploy tokens
  const POK = await deploy(POK__factory);

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

  const Stickers = await deploy(
    Stickers__factory,
    getAddress(signer),
    config.accounts.treasury.secondary,
    config.vrf.coordinator,
    config.vrf.keyHash,
    config.vrf.subId,
    config.vrf.minimumRequestConfirmations,
    config.vrf.gasLimit,
  );

  // Step 2: deploy mint contracts
  const RefillableSale = await deploy(
    RefillableSale__factory,
    getAddress(Pookyball),
    config.accounts.treasury.primary,
    config.accounts.admin,
    config.accounts.operators ?? [],
  );

  // Step 3: deploy game contracts
  const Level = await deploy(Level__factory, POK.target, Pookyball.target);
  const Pressure = await deploy(Pressure__factory, POK.target, config.accounts.treasury.ingame);
  const NonceRegistry = await deploy(NonceRegistry__factory, [signer, config.accounts.admin], []);

  const Rewards = await deploy(
    Rewards__factory,
    getAddress(POK),
    getAddress(Pookyball),
    getAddress(NonceRegistry),
    config.accounts.admin,
    [config.accounts.backend],
  );

  // Step 4: assign permissions
  // Step 4.1: assign DEFAULT_ADMIN_ROLE to the admin multi signature wallet
  await POK.grantRole(DEFAULT_ADMIN_ROLE, config.accounts.admin);
  await Pookyball.grantRole(DEFAULT_ADMIN_ROLE, config.accounts.admin);

  // Step 4.2: assign the required gameplay roles
  await POK.grantRole(MINTER, getAddress(Rewards));
  await POK.grantRole(BURNER, getAddress(Level));
  await POK.grantRole(BURNER, getAddress(Pressure));
  await Pookyball.grantRole(MINTER, getAddress(RefillableSale));
  await Pookyball.grantRole(MINTER, getAddress(Rewards));
  await Pookyball.grantRole(GAME, getAddress(Level));
  await Pookyball.grantRole(GAME, getAddress(Rewards));
  await NonceRegistry.grantRole(OPERATOR, getAddress(Rewards));

  // Step 4.3: resign all the DEFAULT_ADMIN_ROLE so only the multi signature remains admin
  await POK.renounceRole(DEFAULT_ADMIN_ROLE, getAddress(signer));
  await Pookyball.renounceRole(DEFAULT_ADMIN_ROLE, getAddress(signer));
  await NonceRegistry.grantRole(OPERATOR, getAddress(signer));

  // Step 5: wire the VRF contracts
  const VRFCoordinatorV2 = await VRFCoordinatorV2Interface__factory.connect(config.vrf.coordinator, signer);
  await VRFCoordinatorV2.addConsumer(config.vrf.subId, getAddress(Pookyball));

  // Step 6: patch config
  config.tokens.POK = getAddress(POK);
  config.tokens.Pookyball = getAddress(Pookyball);
  config.tokens.Stickers = getAddress(Stickers);

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
    Stickers,
  };
}
