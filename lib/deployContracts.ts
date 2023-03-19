import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import {
  Airdrop__factory,
  LaunchSale__factory,
  Level__factory,
  NonceRegistry__factory,
  POK__factory,
  Pookyball__factory,
  Pressure__factory,
  Rewards__factory,
  VRFCoordinatorV2Interface__factory,
} from '../typechain-types';
import deployer from './deployer';
import logger from './logger';
import { BURNER, DEFAULT_ADMIN_ROLE, GAME, MINTER, OPERATOR } from './roles';
import Config from './types/Config';
import waitTx from './waitTx';

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
  logger.info('Deployer', signer.address);

  const deploy = deployer(signer, { verify: config.verify, confirmations: config.confirmations });

  // Step 1: deploy tokens
  const POK = await deploy(POK__factory);
  logger.info('Deployed POK to', POK.address);

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
  logger.info('Deployed Pookyball to', Pookyball.address);

  // Step 2: deploy mint contracts
  const LaunchSale = await deploy(
    LaunchSale__factory,
    Pookyball.address,
    config.accounts.treasury.primary,
    config.templates.map((t) => ({ ...t, minted: 0 })),
  );
  await LaunchSale.deployed();
  logger.info('Deployed LaunchSale to', LaunchSale.address);

  // Step 3: deploy game contracts
  const Airdrop = await deploy(Airdrop__factory, config.accounts.admin, [config.accounts.backend]);
  await Airdrop.deployed();
  logger.info('Deployed Airdrop to', Airdrop.address);

  const Level = await deploy(Level__factory, POK.address, Pookyball.address);
  await Level.deployed();
  logger.info('Deployed Level to', Level.address);

  const Pressure = await deploy(Pressure__factory, POK.address);
  await Pressure.deployed();
  logger.info('Deployed Pressure to', Pressure.address);

  const NonceRegistry = await deploy(NonceRegistry__factory, [signer.address, config.accounts.admin], []);
  await NonceRegistry.deployed();
  logger.info('Deployed NonceRegistry to', NonceRegistry.address);

  const Rewards = await deploy(
    Rewards__factory,
    POK.address,
    Pookyball.address,
    NonceRegistry.address,
    config.accounts.admin,
    [config.accounts.backend],
  );
  await Rewards.deployed();
  logger.info('Deployed Rewards to', Rewards.address);

  // Step 4: assign permissions
  // Step 4.1: assign DEFAULT_ADMIN_ROLE to the admin multi signature wallet
  await waitTx(POK.grantRole(DEFAULT_ADMIN_ROLE, config.accounts.admin));
  await waitTx(Pookyball.grantRole(DEFAULT_ADMIN_ROLE, config.accounts.admin));

  // Step 4.2: assign the required gameplay roles
  await waitTx(POK.grantRole(MINTER, Rewards.address));
  await waitTx(POK.grantRole(BURNER, Level.address));
  await waitTx(POK.grantRole(BURNER, Pressure.address));
  await waitTx(Pookyball.grantRole(MINTER, LaunchSale.address));
  await waitTx(Pookyball.grantRole(MINTER, Rewards.address));
  await waitTx(Pookyball.grantRole(GAME, Level.address));
  await waitTx(Pookyball.grantRole(GAME, Rewards.address));
  await waitTx(NonceRegistry.grantRole(OPERATOR, Rewards.address));

  // Step 4.3: resign all the DEFAULT_ADMIN_ROLE so only the multi signature remains admin
  await waitTx(POK.renounceRole(DEFAULT_ADMIN_ROLE, signer.address));
  await waitTx(Pookyball.renounceRole(DEFAULT_ADMIN_ROLE, signer.address));
  await waitTx(NonceRegistry.grantRole(OPERATOR, signer.address));

  // Step 5: wire the VRF contracts
  const VRFCoordinatorV2 = await VRFCoordinatorV2Interface__factory.connect(config.vrf.coordinator, signer);
  await waitTx(VRFCoordinatorV2.addConsumer(config.vrf.subId, Pookyball.address));

  return {
    config,

    // Game
    Airdrop,
    NonceRegistry,
    Level,
    Pressure,
    Rewards,

    // Mint
    LaunchSale,

    // Tokens
    POK,
    Pookyball,
  };
}
