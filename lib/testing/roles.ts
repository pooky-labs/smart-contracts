import { AccessControlUpgradeable } from '../../typings';
import hashRole from '../roles';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { BaseContract, ContractTransaction } from 'ethers';

type AddressSubject = string | SignerWithAddress | BaseContract;

function getAddress(subject: AddressSubject) {
  return typeof subject === 'string' ? subject : subject.address;
}

function getRole(role: string) {
  return role.match(/^0x[\da-fA-F]+$/) ? role : hashRole(role);
}

export async function expectHasRole(contract: AccessControlUpgradeable, subject: AddressSubject, role: string) {
  const actual = getAddress(subject);
  const hashedRole = getRole(role);

  expect(await contract.hasRole(hashedRole, actual)).to.eq(true, `${actual} was expected to have ${role} role`);
}

export async function expectMissingRole(tx: Promise<ContractTransaction>, subject: AddressSubject, role: string) {
  await expect(tx).to.be.revertedWith(
    `AccessControl: account ${getAddress(subject).toLowerCase()} is missing role ${getRole(role)}`,
  );
}
