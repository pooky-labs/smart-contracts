import { InvalidReceiver__factory, VRFCoordinatorV2Mock__factory } from '../../typings';
import { deployContracts } from '../deployContracts';
import { POOKY_CONTRACT } from '../roles';
import getTestAccounts from './getTestAccounts';
import { ethers } from 'hardhat';

export default async function stackFixture() {
  const { deployer, treasury, tech, pooky, backend } = await getTestAccounts();
  const stack = await deployContracts(
    deployer,
    {
      treasury: treasury.address,
      tech: tech.address,
      backend: backend.address,
    },
    { log: false, writeInDB: false },
  );

  await stack.POK.grantRole(POOKY_CONTRACT, pooky.address);
  await stack.PookyBall.grantRole(POOKY_CONTRACT, pooky.address);
  await stack.PookyBallGenesisMinter.grantRole(POOKY_CONTRACT, pooky.address);
  await stack.PookyGame.grantRole(POOKY_CONTRACT, pooky.address);

  // Set up the VRF coordinator
  const VRFCoordinatorV2 = await new VRFCoordinatorV2Mock__factory().connect(deployer).deploy(0, 0);
  await VRFCoordinatorV2.deployed();
  await VRFCoordinatorV2.createSubscription();
  const subId = await VRFCoordinatorV2.s_currentSubId();
  await VRFCoordinatorV2.addConsumer(subId, stack.PookyBallGenesisMinter.address);
  await stack.PookyBallGenesisMinter.connect(tech).setVrfParameters(
    VRFCoordinatorV2.address,
    subId,
    1000000,
    0,
    ethers.utils.solidityKeccak256(['string'], ['RANDOM_KEY_HASH']),
  );

  const InvalidReceiver = await new InvalidReceiver__factory().connect(deployer).deploy();
  await InvalidReceiver.deployed();

  return { ...stack, VRFCoordinatorV2, InvalidReceiver };
}
