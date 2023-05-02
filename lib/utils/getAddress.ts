import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BaseContract } from 'ethers';

export type AddressSubject = string | SignerWithAddress | BaseContract;

export default function getAddress(subject: AddressSubject) {
  if (typeof subject === 'string') {
    return subject;
  }

  if (subject instanceof SignerWithAddress) {
    return subject.address;
  }

  if (subject instanceof BaseContract) {
    return subject.target.toString();
  }

  throw new Error('Unable to extract address');
}
