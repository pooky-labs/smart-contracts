import { ContractWithInitialize, InitializeArgs, TypeContractFactory } from './types';
import { DeployProxyOptions } from '@openzeppelin/hardhat-upgrades/src/utils';
import { upgrades } from 'hardhat';

export async function deployWithProxy<C extends ContractWithInitialize>(
  factory: TypeContractFactory<C>,
  args: InitializeArgs<C>,
  opts?: DeployProxyOptions,
): Promise<C> {
  const contract = (await upgrades.deployProxy(factory, args, {
    initializer: 'initialize',
    ...opts,
  })) as C;
  await contract.deployed();

  return contract;
}
