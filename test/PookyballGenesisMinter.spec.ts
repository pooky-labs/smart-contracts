import { ZERO_ADDRESS } from '../lib/constants';
import { TECH } from '../lib/roles';
import getTestAccounts from '../lib/testing/getTestAccounts';
import { randAccount, randUint256 } from '../lib/testing/rand';
import { expectHasRole, expectMissingRole } from '../lib/testing/roles';
import stackFixture from '../lib/testing/stackFixture';
import { BallLuxury, BallRarity } from '../lib/typings/DataTypes';
import parseEther from '../lib/utils/parseEther';
import { InvalidReceiver, Pookyball, PookyballGenesisMinter, VRFCoordinatorV2Mock } from '../typings';
import { faker } from '@faker-js/faker';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import range from 'lodash/range';
import { beforeEach } from 'mocha';

describe('PookyballGenesisMinter', () => {
  let tech: SignerWithAddress;
  let treasury: SignerWithAddress;
  let player1: SignerWithAddress;
  let player2: SignerWithAddress;

  let PookyballGenesisMinter: PookyballGenesisMinter;
  let Pookyball: Pookyball;
  let VRFCoordinatorV2: VRFCoordinatorV2Mock;
  let InvalidReceiver: InvalidReceiver;

  let minTierToMint: number;
  let lastMintTemplateId: number;
  let template: Awaited<ReturnType<PookyballGenesisMinter['mintTemplates']>>;
  let mintsLeft1: number;

  beforeEach(async () => {
    ({ tech, treasury, player1, player2 } = await getTestAccounts());
    ({ PookyballGenesisMinter, Pookyball, VRFCoordinatorV2, InvalidReceiver } = await loadFixture(stackFixture));

    minTierToMint = (await PookyballGenesisMinter.minTierToMint()).toNumber();
    lastMintTemplateId = (await PookyballGenesisMinter.lastMintTemplateId()).toNumber();
    template = await PookyballGenesisMinter.mintTemplates(lastMintTemplateId);
    mintsLeft1 = (await PookyballGenesisMinter.mintsLeft(player1.address)).toNumber();

    await PookyballGenesisMinter.connect(tech).setTierBatch([player1.address], [minTierToMint]);
  });

  describe('configuration', () => {
    it('should have roles configured properly', async () => {
      await expectHasRole(PookyballGenesisMinter, tech, TECH);
    });

    it('should have contracts configured properly', async () => {
      expect(await PookyballGenesisMinter.pookyBall()).to.be.equal(Pookyball.address);
    });
  });

  describe('setTreasuryWallet', () => {
    it('should change the treasury wallet', async () => {
      const expectedTreasuryWallet = randAccount();
      await PookyballGenesisMinter.setTreasuryWallet(expectedTreasuryWallet);
      expect(await PookyballGenesisMinter.treasuryWallet()).to.equals(expectedTreasuryWallet);
    });
  });

  describe('setMinTierToMint', () => {
    let newMinTierToMint: number;

    beforeEach(() => {
      newMinTierToMint = faker.datatype.number(4);
    });

    it('should allow TECH account to change the required tier for mint', async () => {
      await PookyballGenesisMinter.connect(tech).setMinTierToMint(newMinTierToMint);
      expect(await PookyballGenesisMinter.minTierToMint()).to.equals(newMinTierToMint);
    });

    it('should revert if non-TECH account tries to set minimum tier to buy', async () => {
      await expectMissingRole(
        PookyballGenesisMinter.connect(player1).setMinTierToMint(newMinTierToMint),
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
      await PookyballGenesisMinter.connect(tech).setTierBatch(accounts, tiers);

      for (let i = 0; i < accounts.length; i++) {
        expect(await PookyballGenesisMinter.accountTiers(accounts[i])).to.equals(tiers[i]);
      }
    });

    it('should revert if non-TECH account tries to set address tier', async () => {
      await expectMissingRole(PookyballGenesisMinter.connect(player1).setTierBatch(accounts, tiers), player1, TECH);
    });

    it('should revert if accounts and tiers sizes mismatch', async () => {
      const tiers2 = tiers.slice(5);
      await expect(PookyballGenesisMinter.connect(tech).setTierBatch(accounts, tiers2))
        .to.be.revertedWithCustomError(PookyballGenesisMinter, 'ArgumentSizeMismatch')
        .withArgs(accounts.length, tiers2.length);
    });
  });

  describe('mintsLefts', () => {
    it('should return a valid mints left for an account that never minted', async () => {
      const maxMints = faker.datatype.number(10) + 5;
      await PookyballGenesisMinter.connect(tech).setMaxAccountMints(maxMints);
      expect(await PookyballGenesisMinter.mintsLeft(randAccount())).to.equals(maxMints);
    });
  });

  describe('setMaxAccountMints', () => {
    let newMaxAccountMints: number;

    beforeEach(() => {
      newMaxAccountMints = faker.datatype.number(10) + 5;
    });

    it('should allow TECH account to change the maximum balls per account', async () => {
      await PookyballGenesisMinter.connect(tech).setMaxAccountMints(newMaxAccountMints);
      expect(await PookyballGenesisMinter.maxAccountMints()).to.equals(newMaxAccountMints);
    });

    it('should revert if non-TECH account tries to set maximum balls per user', async () => {
      await expectMissingRole(
        PookyballGenesisMinter.connect(player1).setMaxAccountMints(newMaxAccountMints),
        player1,
        TECH,
      );
    });
  });

  describe('minTierToMint', () => {
    it('should let TECH account sets minimum tier to buy', async () => {
      const randomMinimumTierToBuy = faker.datatype.number(10);
      await PookyballGenesisMinter.connect(tech).setMinTierToMint(randomMinimumTierToBuy);

      const minTierToMint = await PookyballGenesisMinter.minTierToMint();
      expect(minTierToMint).to.be.equal(randomMinimumTierToBuy, 'Minimum tier to buy is not set successfully');
    });
  });

  describe('mintTo', () => {
    it('should let user mint multiple balls successfully', async () => {
      const numberOfBalls = faker.datatype.number(4) + 1;
      const txValue = template.price.mul(numberOfBalls);

      await expect(
        PookyballGenesisMinter.connect(player1).mintTo(lastMintTemplateId, player1.address, numberOfBalls, {
          value: txValue,
        }),
      )
        .changeEtherBalances([player1.address, treasury.address], [`-${txValue.toString()}`, txValue])
        .changeTokenBalance(Pookyball, PookyballGenesisMinter.address, numberOfBalls);

      // Until the contract receives the random words, the NFT is owned by the PookyballGenesisMinter contract
      const startTokenId = (await Pookyball.lastTokenId()).toNumber() - numberOfBalls + 1;

      for (let tokenId = startTokenId; tokenId < startTokenId + numberOfBalls; tokenId++) {
        // Fulfill the VRF request
        const randomEntropy = randUint256();
        await expect(
          VRFCoordinatorV2.fulfillRandomWordsWithOverride(tokenId, PookyballGenesisMinter.address, [randomEntropy]),
        ).changeTokenBalance(Pookyball, player1, 1);

        const ball = await Pookyball.getBallInfo(tokenId);
        expect(ball.randomEntropy).to.be.equal(randomEntropy); // Entropy has been applied
        expect(await Pookyball.ownerOf(tokenId)).to.be.equal(player1.address); // Player is now the owner of the NFT
      }
    });

    it('should revert if user tier is too small', async () => {
      // Ensure that tier 1 is required to mint (tier 0 means that mint is public)
      await PookyballGenesisMinter.connect(tech).setMinTierToMint(1);

      await expect(
        PookyballGenesisMinter.connect(player2).mintTo(lastMintTemplateId, player2.address, 1, {
          value: template.price,
        }),
      )
        .to.be.revertedWithCustomError(PookyballGenesisMinter, 'TierTooLow')
        .withArgs(1, 0);
    });

    it('should revert if template mint is disabled', async () => {
      await PookyballGenesisMinter.connect(tech).enableMintTemplate(lastMintTemplateId, false);

      await expect(
        PookyballGenesisMinter.connect(player1).mintTo(lastMintTemplateId, player1.address, 1, {
          value: template.price,
        }),
      )
        .to.be.revertedWithCustomError(PookyballGenesisMinter, 'MintDisabled')
        .withArgs(lastMintTemplateId);
    });

    it('should revert if template mint limit has been reached', async () => {
      const currentMints = faker.datatype.number(100);
      const price = parseEther(faker.datatype.number(100));
      await PookyballGenesisMinter.connect(tech).createMintTemplate({
        enabled: true,
        rarity: BallRarity.Common,
        luxury: BallLuxury.Common,
        maxMints: currentMints,
        currentMints,
        payingToken: ZERO_ADDRESS,
        price,
      });
      lastMintTemplateId = (await PookyballGenesisMinter.lastMintTemplateId()).toNumber();

      await expect(
        PookyballGenesisMinter.connect(player1).mintTo(lastMintTemplateId, player1.address, 1, {
          value: price,
        }),
      )
        .to.be.revertedWithCustomError(PookyballGenesisMinter, 'MaximumMintsReached')
        .withArgs(lastMintTemplateId, currentMints);
    });

    it('should revert if user tries to mint too much balls', async () => {
      const numberOfBalls = mintsLeft1 + 1; // Will overflow the maximum balls

      await expect(
        PookyballGenesisMinter.connect(player1).mintTo(lastMintTemplateId, player1.address, numberOfBalls, {
          value: template.price.mul(numberOfBalls),
        }),
      )
        .to.be.revertedWithCustomError(PookyballGenesisMinter, 'MaxMintsReached')
        .withArgs(numberOfBalls, mintsLeft1);
    });

    it('should revert if user tries too mint more balls than allowed by the supply', async () => {
      // We have to create a specific tier which allow to mint up to the total supply
      const maxMintSupply = (await PookyballGenesisMinter.maxMintSupply()).toNumber();
      const price = faker.datatype.number(10) * 100;

      await PookyballGenesisMinter.connect(tech).setMaxAccountMints(maxMintSupply * 10);
      await PookyballGenesisMinter.connect(tech).createMintTemplate({
        enabled: true,
        rarity: BallRarity.Common,
        luxury: BallLuxury.Common,
        maxMints: maxMintSupply * 10,
        currentMints: 0,
        payingToken: ZERO_ADDRESS,
        price,
      });
      const lastMintTemplateId = await PookyballGenesisMinter.lastMintTemplateId();
      const numberOfBalls = maxMintSupply + 1;

      await expect(
        PookyballGenesisMinter.connect(player1).mintTo(lastMintTemplateId, player1.address, numberOfBalls, {
          value: price * numberOfBalls,
        }),
      )
        .to.be.revertedWithCustomError(PookyballGenesisMinter, 'MaxSupplyReached')
        .withArgs(numberOfBalls, maxMintSupply);
    });

    it('should revert if user does not send enough MATIC with the transaction', async () => {
      const numberOfBalls = faker.datatype.number(3) + 1;
      const expectedValue = template.price.mul(numberOfBalls);
      const actualValue = expectedValue.sub(1); // 1 wei less than required
      await expect(
        PookyballGenesisMinter.connect(player1).mintTo(lastMintTemplateId, player1.address, numberOfBalls, {
          value: actualValue,
        }),
      )
        .to.be.revertedWithCustomError(PookyballGenesisMinter, 'InsufficientValue')
        .withArgs(expectedValue, actualValue);
    });

    it('should revert if the token transfer to the treasury fails', async () => {
      await PookyballGenesisMinter.setTreasuryWallet(InvalidReceiver.address);
      await expect(
        PookyballGenesisMinter.connect(player1).mintTo(lastMintTemplateId, player1.address, 1, {
          value: template.price,
        }),
      )
        .to.be.revertedWithCustomError(PookyballGenesisMinter, 'TransferFailed')
        .withArgs(player1.address, await PookyballGenesisMinter.treasuryWallet());
    });
  });
});
