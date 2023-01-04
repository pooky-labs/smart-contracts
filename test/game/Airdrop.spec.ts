import { faker } from '@faker-js/faker';
import { loadFixture, setBalance } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { BigNumber, utils } from 'ethers';
import { ethers } from 'hardhat';
import { DEFAULT_ADMIN_ROLE } from '../../lib/roles';
import getTestAccounts from '../../lib/testing/getTestAccounts';
import { expectMissingRole } from '../../lib/testing/roles';
import stackFixture from '../../lib/testing/stackFixture';
import { Airdrop } from '../../typechain-types';

describe('Airdrop', () => {
  // Signers
  let admin: SignerWithAddress;
  let backend: SignerWithAddress;
  let player1: SignerWithAddress;
  let player2: SignerWithAddress;

  // Contracts
  let Airdrop: Airdrop;

  let amount: BigNumber;
  let user: string;

  beforeEach(async () => {
    ({ admin, backend, player1, player2 } = await getTestAccounts());
    ({ Airdrop } = await loadFixture(stackFixture));
    amount = await Airdrop.AMOUNT();
    user = utils.solidityKeccak256(['string'], [faker.random.words(10)]);
    await setBalance(Airdrop.address, amount.mul(1000));
  });

  describe('receive', () => {
    it('should allow to receive native currency via a regular transfers', async () => {
      const transfer = amount.mul(faker.datatype.number(1000) + 1);
      await expect(admin.sendTransaction({ to: Airdrop.address, value: transfer })).to.changeEtherBalance(
        Airdrop,
        transfer,
      );
    });
  });

  describe('airdrop', () => {
    it('should revert if account address already received an airdrop', async () => {
      const user2 = utils.solidityKeccak256(['string'], [faker.random.words(10)]);
      await Airdrop.connect(backend).airdrop(player1.address, user2);

      await expect(Airdrop.connect(backend).airdrop(player1.address, user))
        .to.revertedWithCustomError(Airdrop, 'NotEligible')
        .withArgs(player1.address, user);
    });

    it('should revert if user already received an airdrop', async () => {
      await Airdrop.connect(backend).airdrop(player2.address, user);

      await expect(Airdrop.connect(backend).airdrop(player1.address, user))
        .to.revertedWithCustomError(Airdrop, 'NotEligible')
        .withArgs(player1.address, user);
    });

    it('should revert if contract has not enough native currency', async () => {
      await setBalance(Airdrop.address, 0);
      await expect(Airdrop.connect(backend).airdrop(player1.address, user))
        .to.revertedWithCustomError(Airdrop, 'InsufficientBalance')
        .withArgs(amount, 0);
    });

    it('should successfully airdrop native currency', async () => {
      await expect(Airdrop.connect(backend).airdrop(player1.address, user)).to.changeEtherBalance(player1, amount);
    });
  });

  describe('withdraw', () => {
    it('should prevent non admin accounts to withdraw', async () => {
      await expectMissingRole(Airdrop.connect(player1).withdraw(), player1, DEFAULT_ADMIN_ROLE);
      await expectMissingRole(Airdrop.connect(backend).withdraw(), backend, DEFAULT_ADMIN_ROLE);
    });

    it('should allow admin account to withdraw', async () => {
      const totalAmount = amount.mul(faker.datatype.number(1000) + 1);
      await setBalance(Airdrop.address, totalAmount);

      await expect(Airdrop.connect(admin).withdraw()).to.changeEtherBalance(admin, totalAmount);
      expect(await ethers.provider.getCode(Airdrop.address)).to.equal('0x');
    });
  });
});
