import {
  POK__factory,
  POKMock__factory,
  Pookyball__factory,
  PookyballGenesisMinter__factory,
  PookyballMock__factory,
  PookyGame__factory,
} from '../typings';
import { deployWithProxy } from './deployWithProxy';
import logger from './logger';
import { POOKY_CONTRACT, REWARD_SIGNER, TECH } from './roles';
import State from './state';
import { ContractStack } from './typings/DataTypes';
import DeployConfig from './typings/DeployConfig';
import waitTx from './waitTx';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from 'ethers';

/**
 * Deploy the full contract stack and configure the access controls and the contracts links properly.
 * This function is used in the deployment scripts AND in the tests to ensure a maximized compatibility and reliability.
 */
export async function deployContracts(deployer: SignerWithAddress, options: DeployConfig): Promise<ContractStack> {
  if (options.log) {
    logger.setSettings(options.log);
  } else if (options.log === false) {
    logger.setSettings({ minLevel: 'error' });
  }

  const POKFactory = options.mocks ? new POKMock__factory() : new POK__factory();
  const POK = await deployWithProxy(POKFactory.connect(deployer), ['POK', 'POK', deployer.address]);
  logger.info('Deployed POK to', POK.address);

  const PookyballFactory = options.mocks ? new PookyballMock__factory() : new Pookyball__factory();
  const Pookyball = await deployWithProxy(PookyballFactory.connect(deployer), [
    'Pookyball',
    'PKYB',
    options.metadata.baseURI,
    options.metadata.contractURI,
    deployer.address,
  ]);
  logger.info('Deployed Pookyball to', Pookyball.address);

  const PookyballGenesisMinter = await deployWithProxy(new PookyballGenesisMinter__factory().connect(deployer), [
    1,
    deployer.address,
    options.accounts.treasury,
    options.mint.totalSupply,
    options.mint.maxAccountsMints,
    options.vrf.coordinator,
    options.vrf.gasLimit,
    options.vrf.minimumConfirmations,
    options.vrf.keyHash,
    options.vrf.subscriptionId,
  ]);
  logger.info('Deployed PookyballGenesisMinter to', PookyballGenesisMinter.address);

  const PookyGame = await deployWithProxy(new PookyGame__factory().connect(deployer), [deployer.address]);
  logger.info('Deployed PookyGame to', PookyGame.address);

  if (options.state) {
    const state = new State(options.state);
    state.setAddress('POK', POK.address);
    state.setAddress('Pookyball', Pookyball.address);
    state.setAddress('PookyballGenesisMinter', PookyballGenesisMinter.address);
    state.setAddress('PookyGame', PookyGame.address);
  }

  await waitTx(POK.grantRole(POOKY_CONTRACT, PookyballGenesisMinter.address));
  await waitTx(POK.grantRole(POOKY_CONTRACT, PookyGame.address));

  await waitTx(Pookyball.grantRole(POOKY_CONTRACT, PookyballGenesisMinter.address));
  await waitTx(Pookyball.grantRole(POOKY_CONTRACT, PookyGame.address));

  await waitTx(PookyballGenesisMinter.grantRole(TECH, options.accounts.tech));
  await waitTx(PookyballGenesisMinter.setPookyballContract(Pookyball.address));

  await waitTx(PookyGame.grantRole(REWARD_SIGNER, options.accounts.backend));
  await waitTx(PookyGame.setPookyballContract(Pookyball.address));
  await waitTx(PookyGame.setPOKContract(POK.address));

  // Create the mint templates using the TECH role
  await waitTx(PookyballGenesisMinter.grantRole(TECH, deployer.address));
  let supplyCounter = options.mint.totalSupply;
  for (const template of options.mint.templates) {
    let templateSupply: number;

    if (template.supply === null) {
      templateSupply = supplyCounter;
    } else {
      templateSupply = Math.round((options.mint.totalSupply * template.supply) / 10000);
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
