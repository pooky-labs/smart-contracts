import getTestAccounts from '../../lib/testing/getTestAccounts';
import stackFixture from '../../lib/testing/stackFixture';
import PookyballLuxury from '../../lib/types/PookyballLuxury';
import PookyballRarity from '../../lib/types/PookyballRarity';
import parseEther from '../../lib/utils/parseEther';
import { Level, POK, Pookyball } from '../../types';
import { faker } from '@faker-js/faker';
import { anyUint } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';

describe('Level', () => {
  // Signers
  let minter: SignerWithAddress;
  let game: SignerWithAddress;
  let player1: SignerWithAddress;
  let player2: SignerWithAddress;

  // Contracts
  let Level: Level;
  let POK: POK;
  let Pookyball: Pookyball;

  // Internal data
  let nextLevel: number;
  let tokenId: number;

  beforeEach(async () => {
    ({ minter, game, player1, player2 } = await getTestAccounts());
    ({ Level, POK, Pookyball } = await loadFixture(stackFixture));

    nextLevel = faker.datatype.number({ min: 2, max: 15 });
    await Pookyball.connect(minter).mint(player1.address, PookyballRarity.COMMON, PookyballLuxury.COMMON);
    tokenId = (await Pookyball.lastTokenId()).toNumber();
    await Pookyball.connect(game).setLevel(tokenId, nextLevel - 1);
  });

  describe('levelPXP', () => {
    it('should return coherent level PXP amount', async () => {
      expect(await Level.levelPXP(1)).to.eq(parseEther(60)); // level 1 is 60 PXP
      expect(await Level.levelPXP(2)).to.eq(parseEther(65.1)); // level 2 is 65.1 PXP
      expect(await Level.levelPXP(20)).to.approximately(parseEther(282.7), parseEther(0.1)); // level 20 is 282.7 PXP
    });
  });

  describe('levelPOK', () => {
    it('should return coherent level POK', async () => {
      expect(await Level.levelPOK(1)).to.eq(parseEther(5.4)); // level 1 is 5.4 POK
      expect(await Level.levelPOK(2)).to.eq(parseEther(5.859)); // level 2 is 5.859 POK
      expect(await Level.levelPOK(20)).to.approximately(parseEther(25.4), parseEther(0.1)); // level 20 is 25.4 POK
    });
  });

  describe('levelPOKCost', () => {
    it('should match levelPOK if ball has enough PXP', async () => {
      const requiredPXP = await Level.levelPXP(nextLevel);
      await Pookyball.connect(game).setPXP(tokenId, requiredPXP.mul(10));
      expect(await Level.levelPOKCost(tokenId, 1)).to.eq(await Level.levelPOK(nextLevel));
    });

    it('should allow POK to cover missing PXP', async () => {
      const requiredPXP = await Level.levelPXP(nextLevel);
      await Pookyball.connect(game).setPXP(tokenId, requiredPXP.div(2));
      expect(await Level.levelPOKCost(tokenId, 1)).to.gt(await Level.levelPOK(nextLevel));
    });
  });

  describe('levelUp', async () => {
    it('should revert if the sender is not the owner of the Pookyball token', async () => {
      await expect(Level.connect(player2).levelUp(tokenId, 1))
        .to.be.revertedWithCustomError(Level, 'OwnershipRequired')
        .withArgs(tokenId, player1.address, player2.address);
    });

    it('should revert if the Pookyball token has reached its maximum allowed level', async () => {
      await POK.connect(minter).mint(player1.address, parseEther(1000));
      const maxLevel = (await Level.maxLevels(PookyballRarity.COMMON)).toNumber();
      await Pookyball.connect(game).setLevel(tokenId, maxLevel);

      await expect(Level.connect(player1).levelUp(tokenId, 1))
        .to.be.revertedWithCustomError(Level, 'MaximumLevelReached')
        .withArgs(tokenId, maxLevel);
    });

    it('should revert if player does not own enough PXP', async () => {
      const balance = faker.datatype.number(1000);
      await POK.connect(minter).mint(player1.address, balance);

      await expect(Level.connect(player1).levelUp(tokenId, 1))
        .to.be.revertedWithCustomError(Level, 'InsufficientPOKBalance')
        .withArgs(anyUint, balance);
    });

    it('should revert if leveling multiple levels would exceed the maximum allowed level', async () => {
      await POK.connect(minter).mint(player1.address, parseEther(1000));
      const maxLevel = (await Level.maxLevels(PookyballRarity.COMMON)).toNumber();
      await Pookyball.connect(game).setLevel(tokenId, maxLevel - 1);

      await expect(Level.connect(player1).levelUp(tokenId, 2))
        .to.be.revertedWithCustomError(Level, 'MaximumLevelReached')
        .withArgs(tokenId, maxLevel);
    });

    it('should allow level up if Pookyball token has PXP and player owns enough $POK tokens', async () => {
      const initPXP = parseEther(faker.datatype.number() * 1000);
      await POK.connect(minter).mint(player1.address, parseEther(1000));
      await Pookyball.connect(game).setPXP(tokenId, initPXP);
      const amountPOK = await Level.levelPOK(nextLevel);

      await expect(Level.connect(player1).levelUp(tokenId, 1)).to.changeTokenBalance(
        POK,
        player1.address,
        amountPOK.mul(-1),
      );

      const metadata = await Pookyball.metadata(tokenId);
      expect(metadata.level).to.eq(nextLevel);
      expect(metadata.pxp).to.be.lt(initPXP);
    });
  });
});
