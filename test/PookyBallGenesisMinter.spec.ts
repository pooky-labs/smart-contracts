import { HUNDRED, ONE, ZERO } from '../lib/constants';
import { BACKEND, POOKY, TECH } from '../lib/roles';
import getTestAccounts from '../lib/testing/getTestAccounts';
import { randInt } from '../lib/testing/rand';
import { expectHasRole, expectMissingRole } from '../lib/testing/roles';
import stackFixture from '../lib/testing/stackFixture';
import { BallLuxury, BallRarity } from '../lib/types';
import {
  POK,
  PookyBall,
  PookyBallGenesisMinter,
  VRFCoordinatorV2Mock,
  VRFCoordinatorV2Mock__factory,
} from '../typings';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('PookyBallGenesisMinter', () => {
  let deployer: SignerWithAddress;
  let backend: SignerWithAddress;
  let tech: SignerWithAddress;
  let treasury: SignerWithAddress;
  let player1: SignerWithAddress;

  let PookyBallGenesisMinter: PookyBallGenesisMinter;
  let POK: POK;
  let PookyBall: PookyBall;
  let VRFCoordinatorV2: VRFCoordinatorV2Mock;

  beforeEach(async () => {
    ({ deployer, backend, tech, treasury, player1 } = await getTestAccounts());
    ({ PookyBallGenesisMinter, POK, PookyBall } = await loadFixture(stackFixture));

    // Create a default template
    await PookyBallGenesisMinter.connect(tech).createMintTemplate({
      enabled: true,
      rarity: BallRarity.Common,
      luxury: BallLuxury.Common,
      maxMints: HUNDRED.toString(),
      currentMints: ZERO.toString(),
      price: ethers.utils.parseEther(ONE.toString()),
      payingToken: POK.address,
    });

    // Set up the VRF coordinator
    VRFCoordinatorV2 = await new VRFCoordinatorV2Mock__factory().connect(deployer).deploy(ZERO, ZERO);
    await VRFCoordinatorV2.deployed();
    await VRFCoordinatorV2.createSubscription();
    const subId = await VRFCoordinatorV2.s_currentSubId();
    await VRFCoordinatorV2.addConsumer(subId, PookyBallGenesisMinter.address);
    await PookyBallGenesisMinter.connect(tech).setVrfParameters(
      VRFCoordinatorV2.address,
      subId,
      1000000,
      0,
      ethers.utils.solidityKeccak256(['string'], ['RANDOM_KEY_HASH']),
    );
  });

  describe('configuration', () => {
    it('should have roles configured properly', async () => {
      await expectHasRole(PookyBallGenesisMinter, tech, TECH);
      await expectHasRole(PookyBallGenesisMinter, backend, BACKEND);
    });

    it('should have contracts configured properly', async () => {
      expect(await PookyBallGenesisMinter.pookyBall()).to.be.equal(
        PookyBall.address,
        'PookyBall contract address is not set correctly inside PookyBallGenesisMinter contract',
      );
    });
  });

  describe('setTierBatch', () => {
    it('should revert if non-MOD account tries to set address tier', async () => {
      const randomTier = randInt(HUNDRED);
      await expectMissingRole(
        PookyBallGenesisMinter.connect(player1).setTierBatch([player1.address], [randomTier]),
        player1,
        TECH,
      );
    });
  });

  describe('setMinTierToBuy', () => {
    it('should revert if non-MOD account tries to set minimum tier to buy', async () => {
      const randomMinimumTier = randInt(HUNDRED);
      await expectMissingRole(
        PookyBallGenesisMinter.connect(player1).setMinTierToBuy(randomMinimumTier),
        player1,
        TECH,
      );
    });
  });

  describe('setMaxBallsPerUser', () => {
    it('should revert if non-MOD account tries to set maximum balls per user', async () => {
      const randomMaximumBallsPerUser = randInt(HUNDRED);
      await expectMissingRole(
        PookyBallGenesisMinter.connect(player1).setMaxBallsPerUser(randomMaximumBallsPerUser),
        player1,
        TECH,
      );
    });
  });

  describe('setRevokePeriod', () => {
    it('should revert if non-MOD account tries to set revoke period', async () => {
      const randomRevokePeriod = randInt(HUNDRED);
      await expectMissingRole(
        PookyBallGenesisMinter.connect(player1).setRevokePeriod(randomRevokePeriod),
        player1,
        TECH,
      );
    });
  });

  describe('mintBallsAuthorized', () => {
    it('should revert if non-BE account tries to mint balls authorized', async () => {
      const randomMintTemplate = randInt(HUNDRED);
      const randomNumberOfBalls = randInt(HUNDRED);
      await expectMissingRole(
        PookyBallGenesisMinter.connect(player1).mintAuthorized(
          player1.address,
          randomMintTemplate,
          randomNumberOfBalls,
        ),
        player1,
        BACKEND,
      );
    });
  });

  describe('revokeAuthorized', () => {
    it('should revert if non-BE account tries to revoke ball authorized', async () => {
      const randomBallId = randInt(HUNDRED);
      await expectMissingRole(PookyBallGenesisMinter.connect(player1).revokeAuthorized(randomBallId), player1, BACKEND);
    });
  });

  describe('minTierToBuy', () => {
    it('should let MOD account sets minimum tier to buy', async () => {
      const randomMinimumTierToBuy = randInt(HUNDRED);
      await PookyBallGenesisMinter.connect(tech).setMinTierToBuy(randomMinimumTierToBuy);

      const minTierToBuy = await PookyBallGenesisMinter.minTierToBuy();
      expect(minTierToBuy).to.be.equal(randomMinimumTierToBuy, 'Minimum tier to buy is not set successfully');
    });
  });

  describe('setMaxBallsPerUser', () => {
    it('should let MOD account sets maximum balls per user', async () => {
      const randomMaximumBallsPerUser = randInt(HUNDRED);
      await PookyBallGenesisMinter.connect(tech).setMaxBallsPerUser(randomMaximumBallsPerUser);

      const maximumBallsPerUser = await PookyBallGenesisMinter.maxBallsPerUser();

      expect(maximumBallsPerUser).to.be.equal(
        randomMaximumBallsPerUser,
        'Maximum balls per user is not set successfully',
      );
    });
  });

  describe('setRevokePeriod', () => {
    it('should let MOD account sets revoke period', async () => {
      const randomRevokePeriod = randInt(HUNDRED);

      // Revoke period need to be a little bigger
      await PookyBallGenesisMinter.connect(tech).setRevokePeriod(randomRevokePeriod * HUNDRED);

      const revokePeriod = await PookyBallGenesisMinter.revokePeriod();
      expect(revokePeriod).to.be.equal(randomRevokePeriod * HUNDRED, 'Revoke period is not set successfully');
    });
  });

  describe('setTierBatch', () => {
    it('should let MOD account sets address tier', async () => {
      const randomAddressTierIncrement = randInt(HUNDRED);
      const minTierToBuy = await PookyBallGenesisMinter.minTierToBuy();
      const newAddressTier = minTierToBuy.toNumber() + randomAddressTierIncrement;

      await PookyBallGenesisMinter.connect(tech).setTierBatch([player1.address], [newAddressTier]);
      const addressTierAfter = await PookyBallGenesisMinter.userTiers(player1.address);

      expect(addressTierAfter).to.be.equal(newAddressTier, 'Address tier is not set successfully');
    });
  });

  describe('createMintTemplate', () => {
    it('should let MOD account creates mint template', async () => {
      const templateNumberBefore = await PookyBallGenesisMinter.lastMintTemplateId();

      await PookyBallGenesisMinter.connect(tech).createMintTemplate({
        enabled: true,
        rarity: ZERO.toString(),
        luxury: BallLuxury.Common,
        maxMints: HUNDRED.toString(),
        currentMints: ZERO.toString(),
        price: ethers.utils.parseEther(ONE.toString()),
        payingToken: POK.address,
      });

      const templateNumberAfter = await PookyBallGenesisMinter.lastMintTemplateId();

      expect(templateNumberAfter).to.be.equal(templateNumberBefore.add(ONE), 'Template not minted');
    });
  });

  describe('mint', () => {
    it('should revert if user tier is too small', async () => {
      // Ensure that tier 1 is required to mint (tier 0 means that mint is public)
      await PookyBallGenesisMinter.connect(tech).setMinTierToBuy(1);

      const numberOfBalls = ONE;
      const lastMintTemplateId = await PookyBallGenesisMinter.lastMintTemplateId();
      const ballPrice = (await PookyBallGenesisMinter.mintTemplates(lastMintTemplateId)).price;

      await expect(
        PookyBallGenesisMinter.connect(player1).mint(numberOfBalls, lastMintTemplateId, {
          value: ballPrice.mul(numberOfBalls),
        }),
      ).to.be.reverted;
    });

    it('should revert if user tries to mint too much balls', async () => {
      const minTierToBuy = await PookyBallGenesisMinter.minTierToBuy();
      const mintsLeft = await PookyBallGenesisMinter.mintsLeft(player1.address);
      const numberOfBalls = mintsLeft.add(ONE);
      const lastMintTemplateId = await PookyBallGenesisMinter.lastMintTemplateId();
      const ballPrice = (await PookyBallGenesisMinter.mintTemplates(lastMintTemplateId)).price;

      await PookyBallGenesisMinter.connect(tech).setTierBatch([player1.address], [minTierToBuy.add(ONE)]);

      await expect(
        PookyBallGenesisMinter.connect(player1).mint(numberOfBalls, lastMintTemplateId, {
          value: ballPrice.mul(numberOfBalls),
        }),
      ).to.be.reverted;
    });

    it('should revert if user tries too mint more balls than allowed by the supply', async () => {
      const maxMintSupply = await PookyBallGenesisMinter.maxMintSupply();
      const minTierToBuy = await PookyBallGenesisMinter.minTierToBuy();
      const numberOfBalls = maxMintSupply.add(ONE);
      const lastMintTemplateId = await PookyBallGenesisMinter.lastMintTemplateId();
      const ballPrice = (await PookyBallGenesisMinter.mintTemplates(lastMintTemplateId)).price;

      await PookyBallGenesisMinter.connect(tech).setTierBatch([player1.address], [minTierToBuy.add(ONE)]);

      await expect(
        PookyBallGenesisMinter.connect(player1).mint(numberOfBalls, lastMintTemplateId, {
          value: ballPrice.mul(numberOfBalls),
        }),
      ).to.be.reverted;
    });

    it('should revert if user does not send enough MATIC with the transaction', async () => {
      const minTierToBuy = await PookyBallGenesisMinter.minTierToBuy();
      const numberOfBalls = ONE;
      const lastMintTemplateId = await PookyBallGenesisMinter.lastMintTemplateId();

      await PookyBallGenesisMinter.connect(tech).setTierBatch([player1.address], [minTierToBuy.add(ONE)]);

      await expect(
        PookyBallGenesisMinter.connect(player1).mint(numberOfBalls, lastMintTemplateId, {
          value: ethers.utils.parseEther(ZERO.toString()),
        }),
      ).to.be.reverted;
    });

    it('should let user mint a ball successfully', async () => {
      const numberOfBalls = ONE;

      const lastMintTemplateId = await PookyBallGenesisMinter.lastMintTemplateId();
      const ballPrice = (await PookyBallGenesisMinter.mintTemplates(lastMintTemplateId)).price;
      const txValue = ballPrice.mul(numberOfBalls);

      await expect(
        PookyBallGenesisMinter.connect(player1).mint(numberOfBalls, lastMintTemplateId, {
          value: txValue,
        }),
      )
        .changeEtherBalances([player1.address, treasury.address], [`-${txValue.toString()}`, txValue])
        .changeTokenBalance(PookyBall, PookyBallGenesisMinter.address, 1);

      // Until the contract receives the random words, the NFT is owned by the PookyBallGenesisMinter contract
      const tokenId = await PookyBall.lastTokenId();

      // Fulfill the VRF request
      const randomEntropy = randInt(HUNDRED);
      await expect(
        VRFCoordinatorV2.fulfillRandomWordsWithOverride(1, PookyBallGenesisMinter.address, [randomEntropy]),
      ).changeTokenBalance(PookyBall, player1, 1);

      const ball = await PookyBall.getBallInfo(tokenId);
      expect(ball.randomEntropy).to.be.equal(randomEntropy); // Entropy has been applied
      expect(await PookyBall.ownerOf(tokenId)).to.be.equal(player1.address); // Player is now the owner of the NFT
    });
  });

  describe('tokenURI', () => {
    it('should expose the ball information', async () => {
      // Allow the mod account to mint a ball
      await PookyBall.grantRole(POOKY, tech.address);
      await PookyBall.connect(tech).mint(player1.address, BallRarity.Common, BallLuxury.Common, 0);

      const ballId = await PookyBall.lastTokenId();
      expect((await PookyBall.getBallInfo(ballId)).pxp).to.be.equal(0);
      expect(await PookyBall.tokenURI(ballId)).to.be.equal(`${(await PookyBall.baseURI_()) + ballId}.json`);
    });
  });

  describe('mintAuthorized', () => {
    it('should let BE account mint authorized ball', async () => {
      const numberOfBalls = ONE;
      const lastMintTemplateId = await PookyBallGenesisMinter.lastMintTemplateId();

      await expect(
        PookyBallGenesisMinter.connect(backend).mintAuthorized(player1.address, numberOfBalls, lastMintTemplateId),
      ).to.changeTokenBalance(PookyBall, PookyBallGenesisMinter, 1);

      const randomEntropy = randInt(HUNDRED);
      await expect(
        VRFCoordinatorV2.fulfillRandomWordsWithOverride(1, PookyBallGenesisMinter.address, [randomEntropy]),
      ).to.changeTokenBalances(PookyBall, [PookyBallGenesisMinter, player1], [-1, 1]);
    });
  });

  describe('transfer', async () => {
    const ballId = await PookyBallGenesisMinter.ballsMinted();
    await expect(PookyBall.connect(player1).transferFrom(player1.address, tech.address, ballId)).to.be.revertedWith(
      '13',
    );
  });

  describe('revokeAuthorized', () => {
    beforeEach(async () => {
      const lastMintTemplateId = await PookyBallGenesisMinter.lastMintTemplateId();
      await PookyBallGenesisMinter.connect(tech).setRevokePeriod(3600);
      await PookyBallGenesisMinter.connect(backend).mintAuthorized(player1.address, ONE, lastMintTemplateId);

      const randomEntropy = randInt(HUNDRED);
      await VRFCoordinatorV2.fulfillRandomWordsWithOverride(1, PookyBallGenesisMinter.address, [randomEntropy]);
    });

    it('should allow BE account to revoke authorized ball', async () => {
      const ballId = await PookyBallGenesisMinter.ballsMinted();
      await expect(PookyBallGenesisMinter.connect(backend).revokeAuthorized(ballId)).to.changeTokenBalance(
        PookyBall,
        player1,
        -1,
      );
    });
  });
});
