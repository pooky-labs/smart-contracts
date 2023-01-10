import { faker } from '@faker-js/faker';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { BigNumber } from 'ethers';
import { formatEther } from 'ethers/lib/utils';
import getTestAccounts from '../../lib/testing/getTestAccounts';
import stackFixture from '../../lib/testing/stackFixture';
import { POK, Pressure } from '../../typechain-types';

describe('Pressure', () => {
  // Signers
  let player1: SignerWithAddress;
  let minter: SignerWithAddress;
  let treasury: SignerWithAddress;

  // Contracts
  let Pressure: Pressure;
  let POK: POK;

  beforeEach(async () => {
    ({ player1, minter, treasury } = await getTestAccounts());
    ({ POK, Pressure } = await loadFixture(stackFixture));
  });

  describe('priceNAT', () => {
    const dataset: [number, number, number][] = [
      [0, 11, 0.88],
      [11, 10, 0.67],
      [21, 10, 0.56],
      [31, 10, 0.47],
      [41, 10, 0.4],
      [51, 10, 0.34],
      [61, 15, 0.42],
      [76, 24, 0.57],
      [0, 100, 4.31],
    ];

    it('should revert if current + amount is greater than 100', async () => {
      await expect(Pressure.priceNAT(60, 70))
        .to.be.revertedWithCustomError(Pressure, 'InvalidParameters')
        .withArgs(60, 70);
    });

    for (const [current, amount, expected] of dataset) {
      it(`should compute cost for current=${current},amount=${amount}`, async () => {
        await expect(parseFloat(formatEther(await Pressure.priceNAT(current, amount)))).to.be.approximately(
          expected,
          0.01,
        );
      });
    }
  });

  describe('pricePOK', () => {
    const dataset: [number, number, number][] = [
      [0, 11, 23.57],
      [11, 10, 18],
      [21, 10, 15.12],
      [31, 10, 12.7],
      [41, 10, 10.67],
      [51, 10, 8.96],
      [61, 15, 11.29],
      [76, 24, 15.17],
      [0, 100, 115.49],
    ];

    for (const [current, amount, expected] of dataset) {
      it(`should compute cost for current=${current},amount=${amount}`, async () => {
        expect(parseFloat(formatEther(await Pressure.pricePOK(current, amount)))).to.be.approximately(expected, 0.01);
      });
    }
  });

  describe('inflate', () => {
    let tokenId: number;
    let current: number;
    let amount: number;

    beforeEach(async () => {
      tokenId = faker.datatype.number(1000);
      current = faker.datatype.number(50);
      amount = faker.datatype.number(50);
    });

    describe('using native currency', () => {
      let priceNAT: BigNumber;

      beforeEach(async () => {
        priceNAT = await Pressure.priceNAT(current, amount);
      });

      it('should revert if transaction value is insufficient', async () => {
        const value = priceNAT.div(10);
        await expect(Pressure.connect(player1).inflate(tokenId, current, amount, { value }))
          .to.revertedWithCustomError(Pressure, 'InsufficientValue')
          .withArgs(value, priceNAT);
      });

      it('should allow sender to inflate Pookyball token', async () => {
        await expect(Pressure.connect(player1).inflate(tokenId, current, amount, { value: priceNAT }))
          .to.changeEtherBalance(treasury, priceNAT)
          .and.to.emit(Pressure, 'Inflated')
          .withArgs(tokenId, current, amount);
      });
    });

    describe('using $POK tokens', () => {
      let pricePOK: BigNumber;

      beforeEach(async () => {
        pricePOK = await Pressure.pricePOK(current, amount);
      });

      it('should revert if sender does not own enough $POK tokens', async () => {
        const value = pricePOK.div(10);
        await POK.connect(minter).mint(player1.address, value);
        await expect(Pressure.connect(player1).inflate(tokenId, current, amount))
          .to.revertedWithCustomError(Pressure, 'InsufficientPOK')
          .withArgs(value, pricePOK);
      });

      it('should allow sender to inflate Pookyball token', async () => {
        await POK.connect(minter).mint(player1.address, pricePOK);
        await expect(Pressure.connect(player1).inflate(tokenId, current, amount))
          .to.changeTokenBalance(POK, player1, `-${pricePOK.toString()}`)
          .and.to.emit(Pressure, 'Inflated')
          .withArgs(tokenId, current, amount);
      });
    });
  });
});
