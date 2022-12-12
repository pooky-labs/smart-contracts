import { ContractWithInitialize, InitializeArgs, TypeContractFactory } from './typings/DeployProxy';
import { DeployProxyOptions } from '@openzeppelin/hardhat-upgrades/src/utils';
import { upgrades } from 'hardhat';

/**
 * Deploy a contract behind an OpenZeppelin TransparentUpgradableProxy,
 * @param factory The TypeChain contract factory.
 * @param args The arguments of the initialize method of the implementation contract.
 * @param opts The other deployProxy options.
 */
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
