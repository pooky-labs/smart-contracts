import { faker } from '@faker-js/faker';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { BigNumber } from 'ethers';
import getTestAccounts from '../../lib/testing/getTestAccounts';
import stackFixture from '../../lib/testing/stackFixture';
import { Energy, POK } from '../../typechain-types';

describe('Energy', () => {
  // Signers
  let player1: SignerWithAddress;
  let minter: SignerWithAddress;

  // Contracts
  let Energy: Energy;
  let POK: POK;

  // Data
  let amount: number;
  let UNIT_NAT: BigNumber;
  let UNIT_POK: BigNumber;

  beforeEach(async () => {
    ({ player1, minter } = await getTestAccounts());
    ({ Energy, POK } = await loadFixture(stackFixture));

    amount = faker.datatype.number(40) + 5;
    UNIT_NAT = await Energy.UNIT_NAT();
    UNIT_POK = await Energy.UNIT_POK();
  });

  describe('recharge', () => {
    it('should revert if transaction value is too big', async () => {
      const value = UNIT_NAT.mul(100);

      await expect(Energy.connect(player1).recharge(50, { value }))
        .to.revertedWithCustomError(Energy, 'ExcessiveValue')
        .withArgs(UNIT_NAT.mul(50), value);
    });

    it('should revert sender does not own enough $POK tokens', async () => {
      await POK.connect(minter).mint(player1.address, UNIT_POK.mul(amount - 2));
      await expect(Energy.connect(player1).recharge(amount))
        .to.revertedWithCustomError(Energy, 'InsufficientPOK')
        .withArgs(UNIT_POK.mul(amount), UNIT_POK.mul(amount - 2));
    });

    it('should allow player to refill his energy with $POK tokens', async () => {
      await POK.connect(minter).mint(player1.address, UNIT_POK.mul(amount * 2));
      await expect(Energy.connect(player1).recharge(amount))
        .to.emit(Energy, 'EnergyRecharged')
        .withArgs(player1.address, amount);
    });

    it('should allow player to refill his energy with native currency', async () => {
      await expect(Energy.connect(player1).recharge(amount, { value: UNIT_NAT.mul(amount) }))
        .to.emit(Energy, 'EnergyRecharged')
        .withArgs(player1.address, amount);
    });

    it('should allow player to refill his energy with a mix of $POK tokens and native currency', async () => {
      const nativeAmount = faker.datatype.number({ min: 4, max: amount });
      await POK.connect(minter).mint(player1.address, UNIT_POK.mul(amount));

      await expect(Energy.connect(player1).recharge(amount, { value: UNIT_NAT.mul(nativeAmount) }))
        .to.emit(Energy, 'EnergyRecharged')
        .withArgs(player1.address, amount)
        .and.to.changeTokenBalance(POK, player1.address, `-${UNIT_POK.mul(amount - nativeAmount).toString()}`);
    });
  });
});
