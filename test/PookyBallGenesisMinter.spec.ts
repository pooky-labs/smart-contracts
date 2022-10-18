import { HUNDRED, ZERO_ADDRESS } from '../lib/constants';
import { BACKEND, TECH } from '../lib/roles';
import getTestAccounts from '../lib/testing/getTestAccounts';
import { randAccount, randInt } from '../lib/testing/rand';
import { expectHasRole, expectMissingRole } from '../lib/testing/roles';
import stackFixture from '../lib/testing/stackFixture';
import { BallLuxury, BallRarity } from '../lib/types';
import { PookyBall, PookyBallGenesisMinter, VRFCoordinatorV2Mock } from '../typings';
import { faker } from '@faker-js/faker';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { randomBytes } from 'crypto';
import { BigNumber, ethers } from 'ethers';
import range from 'lodash/range';
import { beforeEach } from 'mocha';

describe('PookyBallGenesisMinter', () => {
  let backend: SignerWithAddress;
  let tech: SignerWithAddress;
  let treasury: SignerWithAddress;
  let player1: SignerWithAddress;
  let player2: SignerWithAddress;

  let PookyBallGenesisMinter: PookyBallGenesisMinter;
  let PookyBall: PookyBall;
  let VRFCoordinatorV2: VRFCoordinatorV2Mock;

  let requiredTier: number;
  let lastMintTemplateId: number;
  let template: Awaited<ReturnType<PookyBallGenesisMinter['mintTemplates']>>;
  let mintsLeft1: number;

  beforeEach(async () => {
    ({ backend, tech, treasury, player1, player2 } = await getTestAccounts());
    ({ PookyBallGenesisMinter, PookyBall, VRFCoordinatorV2 } = await loadFixture(stackFixture));

    requiredTier = (await PookyBallGenesisMinter.requiredTier()).toNumber();
    lastMintTemplateId = (await PookyBallGenesisMinter.lastMintTemplateId()).toNumber();
    template = await PookyBallGenesisMinter.mintTemplates(lastMintTemplateId);
    mintsLeft1 = (await PookyBallGenesisMinter.mintsLeft(player1.address)).toNumber();

    await PookyBallGenesisMinter.connect(tech).setTierBatch([player1.address], [requiredTier]);
  });

  describe('configuration', () => {
    it('should have roles configured properly', async () => {
      await expectHasRole(PookyBallGenesisMinter, tech, TECH);
      await expectHasRole(PookyBallGenesisMinter, backend, BACKEND);
    });

    it('should have contracts configured properly', async () => {
      expect(await PookyBallGenesisMinter.pookyBall()).to.be.equal(PookyBall.address);
    });
  });

  describe('setRequiredTier', () => {
    let newRequiredTier: number;

    beforeEach(() => {
      newRequiredTier = faker.datatype.number(4);
    });

    it('should allow TECH account to change the required tier for mint', async () => {
      await PookyBallGenesisMinter.connect(tech).setRequiredTier(newRequiredTier);
      expect(await PookyBallGenesisMinter.requiredTier()).to.equals(newRequiredTier);
    });

    it('should revert if non-TECH account tries to set minimum tier to buy', async () => {
      await expectMissingRole(PookyBallGenesisMinter.connect(player1).setRequiredTier(newRequiredTier), player1, TECH);
    });
  });

  describe('setTierBatch', () => {
    let accounts: string[];
    let tiers: number[];

    beforeEach(() => {
      accounts = range(10).map(randAccount);
      tiers = range(10).map(() => faker.datatype.number(3) + 1);
    });

    it('should allow TECH account to set account tiers successfully', async () => {
      await PookyBallGenesisMinter.connect(tech).setTierBatch(accounts, tiers);

      for (let i = 0; i < accounts.length; i++) {
        expect(await PookyBallGenesisMinter.accountTiers(accounts[i])).to.equals(tiers[i]);
      }
    });

    it('should revert if non-TECH account tries to set address tier', async () => {
      await expectMissingRole(PookyBallGenesisMinter.connect(player1).setTierBatch(accounts, tiers), player1, TECH);
    });

    it('should revert if accounts and tiers sizes mismatch', async () => {
      const tiers2 = tiers.slice(5);
      await expect(PookyBallGenesisMinter.connect(tech).setTierBatch(accounts, tiers2))
        .to.be.revertedWithCustomError(PookyBallGenesisMinter, 'ArgumentSizeMismatch')
        .withArgs(accounts.length, tiers2.length);
    });
  });

  describe('mintsLefts', () => {
    it('should return a valid mints left for an account that never minted', async () => {
      const maxMints = faker.datatype.number(10) + 5;
      await PookyBallGenesisMinter.connect(tech).setMaxAccountMints(maxMints);
      expect(await PookyBallGenesisMinter.mintsLeft(randAccount())).to.equals(maxMints);
    });
  });

  describe('setMaxAccountMints', () => {
    let newMaxAccountMints: number;

    beforeEach(() => {
      newMaxAccountMints = faker.datatype.number(10) + 5;
    });

    it('should allow TECH account to change the maximum balls per account', async () => {
      await PookyBallGenesisMinter.connect(tech).setMaxAccountMints(newMaxAccountMints);
      expect(await PookyBallGenesisMinter.maxAccountMints()).to.equals(newMaxAccountMints);
    });

    it('should revert if non-TECH account tries to set maximum balls per user', async () => {
      await expectMissingRole(
        PookyBallGenesisMinter.connect(player1).setMaxAccountMints(newMaxAccountMints),
        player1,
        TECH,
      );
    });
  });

  describe('setRevokePeriod', () => {
    let newRevokePeriod: number;

    beforeEach(() => {
      newRevokePeriod = faker.datatype.number(10) * 24 * 3600;
    });

    it('should allow TECH account to change the revoke period', async () => {
      await PookyBallGenesisMinter.connect(tech).setRevokePeriod(newRevokePeriod);
      expect(await PookyBallGenesisMinter.revokePeriod()).to.equals(newRevokePeriod);
    });

    it('should revert if non-TECH account tries to set revoke period', async () => {
      await expectMissingRole(PookyBallGenesisMinter.connect(player1).setRevokePeriod(newRevokePeriod), player1, TECH);
    });
  });

  describe('requiredTier', () => {
    it('should let TECH account sets minimum tier to buy', async () => {
      const randomMinimumTierToBuy = randInt(HUNDRED);
      await PookyBallGenesisMinter.connect(tech).setRequiredTier(randomMinimumTierToBuy);

      const requiredTier = await PookyBallGenesisMinter.requiredTier();
      expect(requiredTier).to.be.equal(randomMinimumTierToBuy, 'Minimum tier to buy is not set successfully');
    });
  });

  describe('setRevokePeriod', () => {
    it('should let TECH account sets revoke period', async () => {
      const randomRevokePeriod = randInt(HUNDRED);

      // Revoke period need to be a little bigger
      await PookyBallGenesisMinter.connect(tech).setRevokePeriod(randomRevokePeriod * HUNDRED);

      const revokePeriod = await PookyBallGenesisMinter.revokePeriod();
      expect(revokePeriod).to.be.equal(randomRevokePeriod * HUNDRED, 'Revoke period is not set successfully');
    });
  });

  describe('mint', () => {
    it('should let user mint multiple balls successfully', async () => {
      const numberOfBalls = faker.datatype.number(4) + 1;
      const txValue = template.price.mul(numberOfBalls);

      await expect(
        PookyBallGenesisMinter.connect(player1).mint(lastMintTemplateId, numberOfBalls, {
          value: txValue,
        }),
      )
        .changeEtherBalances([player1.address, treasury.address], [`-${txValue.toString()}`, txValue])
        .changeTokenBalance(PookyBall, PookyBallGenesisMinter.address, numberOfBalls);

      // Until the contract receives the random words, the NFT is owned by the PookyBallGenesisMinter contract
      const startTokenId = (await PookyBall.lastTokenId()).toNumber() - numberOfBalls + 1;

      for (let tokenId = startTokenId; tokenId < startTokenId + numberOfBalls; tokenId++) {
        // Fulfill the VRF request
        const randomEntropy = randInt(HUNDRED);
        await expect(
          VRFCoordinatorV2.fulfillRandomWordsWithOverride(tokenId, PookyBallGenesisMinter.address, [randomEntropy]),
        ).changeTokenBalance(PookyBall, player1, 1);

        const ball = await PookyBall.getBallInfo(tokenId);
        expect(ball.randomEntropy).to.be.equal(randomEntropy); // Entropy has been applied
        expect(await PookyBall.ownerOf(tokenId)).to.be.equal(player1.address); // Player is now the owner of the NFT
      }
    });

    it('should revert if user tier is too small', async () => {
      // Ensure that tier 1 is required to mint (tier 0 means that mint is public)
      await PookyBallGenesisMinter.connect(tech).setRequiredTier(1);

      await expect(
        PookyBallGenesisMinter.connect(player2).mint(lastMintTemplateId, 1, {
          value: template.price,
        }),
      )
        .to.be.revertedWithCustomError(PookyBallGenesisMinter, 'TierTooLow')
        .withArgs(1, 0);
    });

    it('should revert if user tries to mint too much balls', async () => {
      const numberOfBalls = mintsLeft1 + 1; // Will overflow the maximum balls

      await expect(
        PookyBallGenesisMinter.connect(player1).mint(lastMintTemplateId, numberOfBalls, {
          value: template.price.mul(numberOfBalls),
        }),
      )
        .to.be.revertedWithCustomError(PookyBallGenesisMinter, 'MaxMintsReached')
        .withArgs(numberOfBalls, mintsLeft1);
    });

    it('should revert if user tries too mint more balls than allowed by the supply', async () => {
      // We have to create a specific tier which allow to mint up to the total supply
      const maxMintSupply = (await PookyBallGenesisMinter.maxMintSupply()).toNumber();
      const price = faker.datatype.number(10) * 100;

      await PookyBallGenesisMinter.connect(tech).setMaxAccountMints(maxMintSupply * 10);
      await PookyBallGenesisMinter.connect(tech).createMintTemplate({
        enabled: true,
        rarity: BallRarity.Common,
        luxury: BallLuxury.Common,
        maxMints: maxMintSupply * 10,
        currentMints: 0,
        payingToken: ZERO_ADDRESS,
        price,
      });
      const lastMintTemplateId = await PookyBallGenesisMinter.lastMintTemplateId();
      const numberOfBalls = maxMintSupply + 1;

      await expect(
        PookyBallGenesisMinter.connect(player1).mint(lastMintTemplateId, numberOfBalls, {
          value: price * numberOfBalls,
        }),
      )
        .to.be.revertedWithCustomError(PookyBallGenesisMinter, 'MaxSupplyReached')
        .withArgs(numberOfBalls, maxMintSupply);
    });

    it('should revert if user does not send enough MATIC with the transaction', async () => {
      const numberOfBalls = faker.datatype.number(3) + 1;
      const expectedValue = template.price.mul(numberOfBalls);
      const actualValue = expectedValue.sub(1); // 1 wei less than required
      await expect(
        PookyBallGenesisMinter.connect(player1).mint(lastMintTemplateId, numberOfBalls, {
          value: actualValue,
        }),
      )
        .to.be.revertedWithCustomError(PookyBallGenesisMinter, 'InsufficientValue')
        .withArgs(expectedValue, actualValue);
    });

    it.skip('should revert if the token transfer to the treasury fails', () => {
      // We need to re-deploy the contract to change the treasury
    });
  });

  describe('mintAuthorized', () => {
    it('should allow BACKEND role to mint a Pooky Ball token', async () => {
      await expect(
        PookyBallGenesisMinter.connect(backend).mintAuthorized(player1.address, lastMintTemplateId, 1),
      ).to.changeTokenBalance(PookyBall, PookyBallGenesisMinter, 1);

      const randomEntropy = ethers.utils.keccak256(randomBytes(32));
      await expect(
        VRFCoordinatorV2.fulfillRandomWordsWithOverride(1, PookyBallGenesisMinter.address, [randomEntropy]),
      ).to.changeTokenBalances(PookyBall, [PookyBallGenesisMinter, player1], [-1, 1]);
    });

    it('should revert if non-BACKEND account tries to mint balls authorized', async () => {
      await expectMissingRole(
        PookyBallGenesisMinter.connect(player1).mintAuthorized(player1.address, lastMintTemplateId, 1),
        player1,
        BACKEND,
      );
    });
  });

  describe('revokeAuthorized', () => {
    let tokenId: BigNumber;

    beforeEach(async () => {
      // Mint a revocable ball to player1
      await PookyBallGenesisMinter.connect(tech).setRevokePeriod(3600);
      await PookyBallGenesisMinter.connect(backend).mintAuthorized(player1.address, lastMintTemplateId, 1);
      tokenId = await PookyBall.lastTokenId();

      const randomEntropy = ethers.utils.keccak256(randomBytes(32));
      await VRFCoordinatorV2.fulfillRandomWordsWithOverride(1, PookyBallGenesisMinter.address, [randomEntropy]);
    });

    it('should allow BACKEND account to revoke authorized ball', async () => {
      await expect(PookyBallGenesisMinter.connect(backend).revokeAuthorized(tokenId)).to.changeTokenBalance(
        PookyBall,
        player1,
        -1,
      );
    });

    it('should revert if non-BACKEND account tries to revoke ball authorized', async () => {
      await expectMissingRole(PookyBallGenesisMinter.connect(player1).revokeAuthorized(tokenId), player1, BACKEND);
    });
  });
});
