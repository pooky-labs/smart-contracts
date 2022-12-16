import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BaseContract } from 'ethers';

export type AddressSubject = string | SignerWithAddress | BaseContract;

export default function getAddress(subject: AddressSubject) {
  return typeof subject === 'string' ? subject : subject.address;
}
