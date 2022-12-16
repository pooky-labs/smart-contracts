import { BaseContract, ContractFactory, Signer } from 'ethers';
import { run } from 'hardhat';

export interface TypeContractFactory<C extends BaseContract, A extends unknown[]> extends ContractFactory {
  connect(signer: Signer): this;
  deploy(...args: A): Promise<C>;
}

interface DeployerOptions {
  confirmations?: number;
  verify?: boolean;
}

/**
 * Build a custom deploy function that allow tro deploy easily using the TypeChain factories
 * @param signer The deployer wallet signer, MUST have a sufficient balance to run the whole script.
 * @param verify If the contract should be verified on Etherscan/Polyscan, etc.
 * @param wait The number of confirmations that we should wait after deployment.
 */
export default function deployer(signer: Signer, { verify = true, confirmations }: DeployerOptions = {}) {
  return async function deploy<C extends BaseContract, A extends unknown[]>(
    factoryClass: { new (): TypeContractFactory<C, A> },
    ...args: A
  ) {
    const factory = new factoryClass();
    const contract = await factory.connect(signer).deploy(...args);
    await contract.deployed();
    await contract.deployTransaction.wait(confirmations);

    if (verify) {
      await run('verify:verify', {
        address: contract.address,
        constructorArguments: args,
      });
    }

    return contract.connect(signer) as C;
  };
}
