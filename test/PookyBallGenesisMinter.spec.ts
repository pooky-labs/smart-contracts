import { HUNDRED, ZERO_ADDRESS } from '../lib/constants';
import parseEther from '../lib/parseEther';
import { TECH } from '../lib/roles';
import getTestAccounts from '../lib/testing/getTestAccounts';
import { randAccount, randInt } from '../lib/testing/rand';
import { expectHasRole, expectMissingRole } from '../lib/testing/roles';
import stackFixture from '../lib/testing/stackFixture';
import { BallLuxury, BallRarity } from '../lib/types';
import { InvalidReceiver, PookyBall, PookyBallGenesisMinter, VRFCoordinatorV2Mock } from '../typings';
import { faker } from '@faker-js/faker';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import range from 'lodash/range';
import { beforeEach } from 'mocha';

describe('PookyBallGenesisMinter', () => {
  let tech: SignerWithAddress;
  let treasury: SignerWithAddress;
  let player1: SignerWithAddress;
  let player2: SignerWithAddress;

  let PookyBallGenesisMinter: PookyBallGenesisMinter;
  let PookyBall: PookyBall;
  let VRFCoordinatorV2: VRFCoordinatorV2Mock;
  let InvalidReceiver: InvalidReceiver;

  let minTierToMint: number;
  let lastMintTemplateId: number;
  let template: Awaited<ReturnType<PookyBallGenesisMinter['mintTemplates']>>;
  let mintsLeft1: number;

  beforeEach(async () => {
    ({ tech, treasury, player1, player2 } = await getTestAccounts());
    ({ PookyBallGenesisMinter, PookyBall, VRFCoordinatorV2, InvalidReceiver } = await loadFixture(stackFixture));

    minTierToMint = (await PookyBallGenesisMinter.minTierToMint()).toNumber();
    lastMintTemplateId = (await PookyBallGenesisMinter.lastMintTemplateId()).toNumber();
    template = await PookyBallGenesisMinter.mintTemplates(lastMintTemplateId);
    mintsLeft1 = (await PookyBallGenesisMinter.mintsLeft(player1.address)).toNumber();

    await PookyBallGenesisMinter.connect(tech).setTierBatch([player1.address], [minTierToMint]);
  });

  describe('configuration', () => {
    it('should have roles configured properly', async () => {
      await expectHasRole(PookyBallGenesisMinter, tech, TECH);
    });

    it('should have contracts configured properly', async () => {
      expect(await PookyBallGenesisMinter.pookyBall()).to.be.equal(PookyBall.address);
    });
  });

  describe('setTreasuryWallet', () => {
    it('should change the treasury wallet', async () => {
      const expectedTreasuryWallet = randAccount();
      await PookyBallGenesisMinter.setTreasuryWallet(expectedTreasuryWallet);
      expect(await PookyBallGenesisMinter.treasuryWallet()).to.equals(expectedTreasuryWallet);
    });
  });

  describe('setMinTierToMint', () => {
    let newMinTierToMint: number;

    beforeEach(() => {
      newMinTierToMint = faker.datatype.number(4);
    });

    it('should allow TECH account to change the required tier for mint', async () => {
      await PookyBallGenesisMinter.connect(tech).setMinTierToMint(newMinTierToMint);
      expect(await PookyBallGenesisMinter.minTierToMint()).to.equals(newMinTierToMint);
    });

    it('should revert if non-TECH account tries to set minimum tier to buy', async () => {
      await expectMissingRole(
        PookyBallGenesisMinter.connect(player1).setMinTierToMint(newMinTierToMint),
        player1,
        TECH,
      );
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

  describe('minTierToMint', () => {
    it('should let TECH account sets minimum tier to buy', async () => {
      const randomMinimumTierToBuy = randInt(HUNDRED);
      await PookyBallGenesisMinter.connect(tech).setMinTierToMint(randomMinimumTierToBuy);

      const minTierToMint = await PookyBallGenesisMinter.minTierToMint();
      expect(minTierToMint).to.be.equal(randomMinimumTierToBuy, 'Minimum tier to buy is not set successfully');
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
      await PookyBallGenesisMinter.connect(tech).setMinTierToMint(1);

      await expect(
        PookyBallGenesisMinter.connect(player2).mint(lastMintTemplateId, 1, {
          value: template.price,
        }),
      )
        .to.be.revertedWithCustomError(PookyBallGenesisMinter, 'TierTooLow')
        .withArgs(1, 0);
    });

    it('should revert if template mint is disabled', async () => {
      await PookyBallGenesisMinter.connect(tech).enableMintTemplate(lastMintTemplateId, false);

      await expect(
        PookyBallGenesisMinter.connect(player1).mint(lastMintTemplateId, 1, {
          value: template.price,
        }),
      )
        .to.be.revertedWithCustomError(PookyBallGenesisMinter, 'MintDisabled')
        .withArgs(lastMintTemplateId);
    });

    it('should revert if template mint limit has been reached', async () => {
      const currentMints = faker.datatype.number(100);
      const price = parseEther(faker.datatype.number(100));
      await PookyBallGenesisMinter.connect(tech).createMintTemplate({
        enabled: true,
        rarity: BallRarity.Common,
        luxury: BallLuxury.Common,
        maxMints: currentMints,
        currentMints,
        payingToken: ZERO_ADDRESS,
        price,
      });
      lastMintTemplateId = (await PookyBallGenesisMinter.lastMintTemplateId()).toNumber();

      await expect(
        PookyBallGenesisMinter.connect(player1).mint(lastMintTemplateId, 1, {
          value: price,
        }),
      )
        .to.be.revertedWithCustomError(PookyBallGenesisMinter, 'MaximumMintsReached')
        .withArgs(lastMintTemplateId, currentMints);
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

    it('should revert if the token transfer to the treasury fails', async () => {
      await PookyBallGenesisMinter.setTreasuryWallet(InvalidReceiver.address);
      await expect(
        PookyBallGenesisMinter.connect(player1).mint(lastMintTemplateId, 1, {
          value: template.price,
        }),
      )
        .to.be.revertedWithCustomError(PookyBallGenesisMinter, 'TransferFailed')
        .withArgs(player1.address, await PookyBallGenesisMinter.treasuryWallet());
    });
  });
});
