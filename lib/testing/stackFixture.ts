import { InvalidReceiver__factory, VRFCoordinatorV2Mock__factory } from '../../typings';
import testing from '../config/testing';
import { deployContracts } from '../deployContracts';
import { POOKY_CONTRACT } from '../roles';
import getTestAccounts from './getTestAccounts';
import { ethers } from 'hardhat';

export default async function stackFixture() {
  const { deployer, treasury, tech, pooky, backend } = await getTestAccounts();

  // Set up the VRF coordinator
  const VRFCoordinatorV2 = await new VRFCoordinatorV2Mock__factory().connect(deployer).deploy(0, 0);
  await VRFCoordinatorV2.deployed();
  await VRFCoordinatorV2.createSubscription();
  const subscriptionId = await VRFCoordinatorV2.s_currentSubId();

  const stack = await deployContracts(deployer, {
    ...testing,
    accounts: {
      treasury: treasury.address,
      tech: tech.address,
      backend: backend.address,
    },
    vrf: {
      ...testing.vrf,
      coordinator: VRFCoordinatorV2.address,
      subscriptionId,
    },
  });

  await stack.POK.grantRole(POOKY_CONTRACT, pooky.address);
  await stack.Pookyball.grantRole(POOKY_CONTRACT, pooky.address);
  await stack.PookyballGenesisMinter.grantRole(POOKY_CONTRACT, pooky.address);
  await stack.PookyGame.grantRole(POOKY_CONTRACT, pooky.address);
  await VRFCoordinatorV2.addConsumer(subscriptionId, stack.PookyballGenesisMinter.address);

  const InvalidReceiver = await new InvalidReceiver__factory().connect(deployer).deploy();
  await InvalidReceiver.deployed();

  return { ...stack, VRFCoordinatorV2, InvalidReceiver };
}
