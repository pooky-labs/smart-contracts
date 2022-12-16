import { expect } from 'chai';
import { ContractTransaction } from 'ethers';
import { AccessControl } from '../../types';
import hashRole from '../roles';
import getAddress, { AddressSubject } from '../utils/getAddress';

function getRole(role: string) {
  return role.match(/^0x[\da-fA-F]+$/) ? role : hashRole(role);
}

export async function expectHasRole(contract: AccessControl, subject: AddressSubject, role: string) {
  const actual = getAddress(subject);
  const hashedRole = getRole(role);

  expect(await contract.hasRole(hashedRole, actual)).to.eq(true, `${actual} was expected to have ${role} role`);
}

export async function expectMissingRole(tx: Promise<ContractTransaction>, subject: AddressSubject, role: string) {
  await expect(tx).to.be.revertedWith(
    `AccessControl: account ${getAddress(subject).toLowerCase()} is missing role ${getRole(role)}`,
  );
}
