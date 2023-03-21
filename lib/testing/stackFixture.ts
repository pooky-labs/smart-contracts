import { InvalidReceiver__factory, VRFCoordinatorV2Mock__factory } from '../../typechain-types';
import testing from '../config/testing';
import { deployContracts } from '../deployContracts';
import { GAME, MINTER, OPERATOR } from '../roles';
import getTestAccounts from './getTestAccounts';

export default async function stackFixture() {
  const { deployer, admin, treasury, backend, operator, minter, game } = await getTestAccounts();

  if (testing.log !== false) {
    console.table(
      Object.entries(await getTestAccounts()).reduce((acc, [name, signer]) => {
        acc.push({ name, address: signer.address });
        return acc;
      }, [] as { name: string; address: string }[]),
    );
  }

  // Set up the VRF coordinator
  const VRFCoordinatorV2 = await new VRFCoordinatorV2Mock__factory().connect(deployer).deploy(0, 0);
  await VRFCoordinatorV2.deployed();
  await VRFCoordinatorV2.createSubscription();
  const subId = 1;

  const { POK, Pookyball, NonceRegistry, Rewards, ...contracts } = await deployContracts(deployer, {
    ...testing,
    accounts: {
      admin: admin.address,
      treasury: {
        primary: treasury.address,
        secondary: treasury.address,
        ingame: treasury.address,
      },
      backend: backend.address,
      operators: [operator.address],
    },
    vrf: {
      ...testing.vrf,
      coordinator: VRFCoordinatorV2.address,
      subId,
    },
  });

  await VRFCoordinatorV2.addConsumer(subId, Pookyball.address);

  // Additional role setup
  await POK.connect(admin).grantRole(MINTER, minter.address);
  await Pookyball.connect(admin).grantRole(MINTER, minter.address);
  await Pookyball.connect(admin).grantRole(GAME, game.address);
  await NonceRegistry.connect(admin).grantRole(OPERATOR, operator.address);

  // Additional contracts deployments
  const InvalidReceiver = await new InvalidReceiver__factory().connect(deployer).deploy();
  await InvalidReceiver.deployed();

  return { POK, Pookyball, NonceRegistry, Rewards, VRFCoordinatorV2, InvalidReceiver, ...contracts };
}
