import { BaseContract, ContractFactory, Signer } from 'ethers';
import { run } from 'hardhat';
import { isNativeError } from 'util/types';
import logger from '../logger';
import getAddress from './getAddress';

export interface TypeContractFactory<C extends BaseContract, A extends unknown[]> extends ContractFactory {
  connect(signer: Signer): this;
  deploy(...args: A): Promise<C & Awaited<ReturnType<ContractFactory['deploy']>>>;
}

interface DeployerOptions {
  confirmations?: number;
  verify?: boolean;
  log?: unknown;
}

/**
 * Build a custom deploy function that allow tro deploy easily using the TypeChain factories
 * @param signer The deployer wallet signer, MUST have a sufficient balance to run the whole script.
 * @param verify If the contract should be verified on Etherscan/Polyscan, etc.
 * @param wait The number of confirmations that we should wait after deployment.
 */
export default function createDeployer(signer: Signer, { verify = true, log: _log = true }: DeployerOptions = {}) {
  const log = Boolean(_log);

  return async function deploy<C extends BaseContract, A extends unknown[]>(
    factoryClass: { new (): TypeContractFactory<C, A> },
    ...args: A
  ) {
    const factory = new factoryClass();
    const name = factory.constructor.name.replace('__factory', '');
    const contract = await factory.connect(signer).deploy(...args);

    if (log) {
      logger.info('Deploying', name, 'with', contract.deploymentTransaction()?.hash);
    }

    await contract.waitForDeployment();

    if (log) {
      logger.info('Deployed', name, 'at', contract.target);
    }

    if (verify) {
      logger.info('Waiting 10 seconds before verifiying...');
      // Artificial delay before attempting to verify the contracts
      await new Promise((resolve) => setTimeout(resolve, 10000));

      try {
        await run('verify:verify', {
          address: getAddress(contract),
          constructorArguments: args,
        });
      } catch (err) {
        if (!isNativeError(err) || !err.message.includes('Reason: Already Verified')) throw err;
        logger.info('Contract is already verified.');
      }
    }

    return contract.connect(signer) as C;
  };
}
