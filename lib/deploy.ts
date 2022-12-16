import { BaseContract, ContractFactory, Signer } from 'ethers';
import { run } from 'hardhat';

export interface TypeContractFactory<C extends BaseContract, A extends unknown[]> extends ContractFactory {
  connect(signer: Signer): this;
  deploy(...args: A): Promise<C>;
}

export default function deployer(signer: Signer, verify = true) {
  return async function deploy<C extends BaseContract, A extends unknown[]>(
    factoryClass: { new (): TypeContractFactory<C, A> },
    ...args: A
  ) {
    const factory = new factoryClass();
    const contract = await factory.connect(signer).deploy(...args);
    await contract.deployed();

    if (verify) {
      await run('verify:verify', {
        address: contract.address,
        constructorArguments: args,
      });
    }

    return contract.connect(signer) as C;
  };
}
