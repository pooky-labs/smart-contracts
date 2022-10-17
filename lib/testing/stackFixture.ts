import { InvalidReceiver__factory } from '../../typings';
import { deployContracts } from '../deployContracts';
import { POOKY } from '../roles';
import getTestAccounts from './getTestAccounts';

export default async function stackFixture() {
  const { deployer, treasury, tech, pooky, backend } = await getTestAccounts();
  const stack = await deployContracts(
    deployer,
    { treasury: treasury.address, tech: tech.address, backend: backend.address },
    { log: false, writeInDB: false },
  );

  await stack.POK.grantRole(POOKY, pooky.address);
  await stack.PookyBall.grantRole(POOKY, pooky.address);
  await stack.PookyBallGenesisMinter.grantRole(POOKY, pooky.address);
  await stack.PookyGame.grantRole(POOKY, pooky.address);

  const InvalidReceiver = await new InvalidReceiver__factory().connect(deployer).deploy();
  await InvalidReceiver.deployed();
  return { ...stack, InvalidReceiver };
}
