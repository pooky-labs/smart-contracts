import { InvalidReceiver__factory, VRFCoordinatorV2Mock__factory } from '../../typechain-types';
import testing from '../config/testing';
import { deployContracts } from '../deployContracts';
import { GAME, MINTER, OPERATOR } from '../roles';
import getTestAccounts from './getTestAccounts';

export default async function stackFixture() {
  const { deployer, treasury, tech, rewarder, minter, game } = await getTestAccounts();

  // Set up the VRF coordinator
  const VRFCoordinatorV2 = await new VRFCoordinatorV2Mock__factory().connect(deployer).deploy(0, 0);
  await VRFCoordinatorV2.deployed();
  await VRFCoordinatorV2.createSubscription();
  const subId = 1;

  const { POK, Pookyball, Rewards, WaitList, ...contracts } = await deployContracts(deployer, {
    ...testing,
    accounts: {
      treasury: treasury.address,
      tech: tech.address,
      backend: rewarder.address,
    },
    vrf: {
      ...testing.vrf,
      coordinator: VRFCoordinatorV2.address,
      subId,
    },
  });

  await VRFCoordinatorV2.addConsumer(subId, Pookyball.address);

  // Additional role setup
  await POK.connect(deployer).grantRole(MINTER, minter.address);
  await Pookyball.connect(deployer).grantRole(MINTER, minter.address);
  await Pookyball.connect(deployer).grantRole(GAME, game.address);
  await WaitList.connect(deployer).grantRole(OPERATOR, deployer.address);

  // Additional contracts deployments
  const InvalidReceiver = await new InvalidReceiver__factory().connect(deployer).deploy();
  await InvalidReceiver.deployed();

  return { POK, Pookyball, Rewards, WaitList, VRFCoordinatorV2, InvalidReceiver, ...contracts };
}
