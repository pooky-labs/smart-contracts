import { faker } from '@faker-js/faker';
import { anyUint } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { parseEther } from 'ethers';
import connect from '../../lib/testing/connect';
import getTestAccounts from '../../lib/testing/getTestAccounts';
import stackFixture from '../../lib/testing/stackFixture';
import PookyballRarity from '../../lib/types/PookyballRarity';
import { Level, POK, Pookyball } from '../../typechain-types';

describe('Level', () => {
  // Signers
  let minter: SignerWithAddress;
  let game: SignerWithAddress;
  let player1: SignerWithAddress;

  // Contracts
  let Level: Level;
  let POK: POK;
  let Pookyball: Pookyball;

  // Internal data
  let nextLevel: number;
  let tokenId: bigint;

  beforeEach(async () => {
    ({ minter, game, player1 } = await getTestAccounts());
    ({ Level, POK, Pookyball } = await loadFixture(stackFixture));

    nextLevel = faker.datatype.number({ min: 2, max: 15 });
    await connect(Pookyball, minter).mint([player1.address], [PookyballRarity.COMMON]);
    tokenId = await Pookyball.lastTokenId();
    await connect(Pookyball, game).setLevel(tokenId, nextLevel - 1);
  });

  describe('levelPXP', () => {
    it('should return coherent level PXP amount', async () => {
      const delta = parseEther('1');
      expect(await Level.levelPXP(0)).to.eq(parseEther('0')); // level 0 is 0 PXP
      expect(await Level.levelPXP(1)).to.eq(parseEther('60')); // level 1 is 60 PXP
      expect(await Level.levelPXP(2)).to.approximately(parseEther('65'), delta); // level 2 is 65.PXP
      expect(await Level.levelPXP(10)).to.approximately(parseEther('115'), delta); // level 10 is 115 PXP
      expect(await Level.levelPXP(20)).to.approximately(parseEther('237'), delta); // level 20 is 237 PXP
    });
  });

  describe('levelPOK', () => {
    it('should return coherent level $POK', async () => {
      const delta = parseEther('0.1');
      expect(await Level.levelPOK(0)).to.eq(parseEther('0')); // level 0 is 0 $POK
      expect(await Level.levelPOK(1)).to.eq(parseEther('4.8')); // level 1 is 4.8 $POK
      expect(await Level.levelPOK(2)).to.approximately(parseEther('5.2'), delta); // level 2 is 5.2 $POK
      expect(await Level.levelPOK(10)).to.approximately(parseEther('9.2'), delta); // level 10 is 9.2 $POK
      expect(await Level.levelPOK(20)).to.approximately(parseEther('19.0'), delta); // level 20 is 19.0 $POK
    });
  });

  describe('levelPOKCost', () => {
    it('should match levelPOK if ball has enough PXP', async () => {
      const requiredPXP = await Level.levelPXP(nextLevel);
      await connect(Pookyball, game).setPXP(tokenId, requiredPXP * 10n);
      expect(await Level.levelPOKCost(tokenId, 1)).to.eq(await Level.levelPOK(nextLevel));
    });

    it('should allow $POK to cover missing PXP', async () => {
      const requiredPXP = await Level.levelPXP(nextLevel);
      await connect(Pookyball, game).setPXP(tokenId, requiredPXP / 2n);
      expect(await Level.levelPOKCost(tokenId, 1)).to.gt(await Level.levelPOK(nextLevel));
    });
  });

  describe('levelUp', async () => {
    it('should revert if the Pookyball token has reached its maximum allowed level', async () => {
      await connect(POK, minter).mint(player1.address, parseEther('1000'));
      const maxLevel = await Level.maxLevels(PookyballRarity.COMMON);
      await connect(Pookyball, game).setLevel(tokenId, maxLevel);

      await expect(connect(Level, player1).levelUp(tokenId, 1))
        .to.be.revertedWithCustomError(Level, 'MaximumLevelReached')
        .withArgs(tokenId, maxLevel);
    });

    it('should revert if player does not own enough PXP', async () => {
      const balance = faker.datatype.number(1000);
      await connect(POK, minter).mint(player1.address, balance);

      await expect(connect(Level, player1).levelUp(tokenId, 1))
        .to.be.revertedWithCustomError(Level, 'InsufficientPOKBalance')
        .withArgs(anyUint, balance);
    });

    it('should revert if leveling multiple levels would exceed the maximum allowed level', async () => {
      await connect(POK, minter).mint(player1.address, parseEther('1000'));
      const maxLevel = await Level.maxLevels(PookyballRarity.COMMON);
      await connect(Pookyball, game).setLevel(tokenId, maxLevel - 1n);

      await expect(connect(Level, player1).levelUp(tokenId, 2))
        .to.be.revertedWithCustomError(Level, 'MaximumLevelReached')
        .withArgs(tokenId, maxLevel);
    });

    it('should allow level up if Pookyball token has PXP and player owns enough $POK tokens', async () => {
      const initPXP = parseEther(faker.datatype.number().toString()) * 1000n;
      await connect(POK, minter).mint(player1.address, parseEther('1000'));
      await connect(Pookyball, game).setPXP(tokenId, initPXP);
      const amountPOK = await Level.levelPOK(nextLevel);

      await expect(connect(Level, player1).levelUp(tokenId, 1)).to.changeTokenBalance(POK, player1.address, -amountPOK);

      const metadata = await Pookyball.metadata(tokenId);
      expect(metadata.level).to.eq(nextLevel);
      expect(metadata.pxp).to.be.lt(initPXP);
    });
  });
});
