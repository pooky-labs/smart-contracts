import { BaseContract, Signer } from 'ethers';

export default function connect<C extends BaseContract>(contract: C, signer: Signer) {
  return contract.connect(signer) as C;
}
