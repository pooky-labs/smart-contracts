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
      [0, 11, 0.7],
      [11, 10, 0.54],
      [21, 10, 0.45],
      [31, 10, 0.38],
      [41, 10, 0.32],
      [51, 10, 0.27],
      [61, 15, 0.34],
      [76, 24, 0.45],
      [0, 100, 3.45],
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
      [0, 11, 25.14],
      [11, 10, 19.2],
      [21, 10, 16.13],
      [31, 10, 13.55],
      [41, 10, 11.38],
      [51, 10, 9.56],
      [61, 15, 12.04],
      [76, 24, 16.18],
      [0, 100, 123.19],
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
