import { InvalidReceiver__factory, VRFCoordinatorV2Mock__factory } from '../../typechain-types';
import testing from '../config/testing';
import { deployContracts } from '../deployContracts';
import { GAME, MINTER, OPERATOR, SELLER } from '../roles';
import connect from './connect';
import getTestAccounts from './getTestAccounts';

export default async function stackFixture() {
  const { deployer, admin, treasury, backend, operator, seller, minter, game } = await getTestAccounts();

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
  await VRFCoordinatorV2.waitForDeployment();
  await VRFCoordinatorV2.createSubscription();
  const subId = 1;

  const { POK, Pookyball, NonceRegistry, RefillableSale, Rewards, ...contracts } = await deployContracts(deployer, {
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
      coordinator: await VRFCoordinatorV2.getAddress(),
      subId,
    },
  });

  await VRFCoordinatorV2.addConsumer(subId, Pookyball.target);

  // Additional role setup
  await connect(POK, admin).grantRole(MINTER, minter.address);
  await connect(Pookyball, admin).grantRole(MINTER, minter.address);
  await connect(Pookyball, admin).grantRole(GAME, game.address);
  await connect(NonceRegistry, admin).grantRole(OPERATOR, operator.address);
  await connect(RefillableSale, admin).grantRole(SELLER, seller.address);

  // Additional contracts deployments
  const InvalidReceiver = await new InvalidReceiver__factory().connect(deployer).deploy();
  await InvalidReceiver.waitForDeployment();

  return { POK, Pookyball, NonceRegistry, RefillableSale, Rewards, VRFCoordinatorV2, InvalidReceiver, ...contracts };
}
