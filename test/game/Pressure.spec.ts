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

  // Contracts
  let Pressure: Pressure;
  let POK: POK;

  beforeEach(async () => {
    ({ player1, minter } = await getTestAccounts());
    ({ POK, Pressure } = await loadFixture(stackFixture));
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
    let pricePOK: BigNumber;

    beforeEach(async () => {
      tokenId = faker.datatype.number(1000);
      current = faker.datatype.number(50);
      amount = faker.datatype.number(50);
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
