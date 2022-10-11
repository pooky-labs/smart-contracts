import { DEFAULT_ADMIN_ROLE, GAS_LIMIT, HUNDRED, ONE, ZERO } from '../lib/constants';
import getSigners from '../lib/getSigners';
import { randInt } from '../lib/rand';
import { BE, MOD, POOKY_CONTRACT } from '../lib/roles';
import { expectHasRole, expectMissingRole } from '../lib/testing/roles';
import stackFixture from '../lib/testing/stackFixture';
import { BallRarity } from '../lib/types';
import waitTx from '../lib/waitTx';
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
  let backendSigner: SignerWithAddress;
  let mod: SignerWithAddress;
  let treasury: SignerWithAddress;
  let player: SignerWithAddress;

  let PookyBallGenesisMinter: PookyBallGenesisMinter;
  let POK: POK;
  let PookyBall: PookyBall;
  let VRFCoordinatorV2: VRFCoordinatorV2Mock;

  beforeEach(async () => {
    ({ deployer, backendSigner, mod, treasury, player } = await getSigners());
    ({ PookyBallGenesisMinter, POK, PookyBall } = await loadFixture(stackFixture));

    // Create a default template
    await PookyBallGenesisMinter.connect(mod).createMintTemplate({
      enabled: true,
      rarity: BallRarity.Uncommon,
      maxMints: HUNDRED.toString(),
      currentMints: ZERO.toString(),
      price: ethers.utils.parseEther(ONE.toString()),
      payingToken: POK.address,
    });

    // Set up the VRF coordinator
    VRFCoordinatorV2 = await new VRFCoordinatorV2Mock__factory().connect(deployer).deploy(ZERO, ZERO);
    await VRFCoordinatorV2.deployed();
    await waitTx(VRFCoordinatorV2.createSubscription());
    const subId = await VRFCoordinatorV2.s_currentSubId();
    await waitTx(VRFCoordinatorV2.addConsumer(subId, PookyBallGenesisMinter.address));
    await waitTx(
      PookyBallGenesisMinter.connect(mod).setVrfParameters(
        VRFCoordinatorV2.address,
        subId,
        1000000,
        0,
        ethers.utils.solidityKeccak256(['string'], ['RANDOM_KEY_HASH']),
      ),
    );
  });

  describe('configuration', () => {
    it('should have roles configured properly', async () => {
      await expectHasRole(PookyBallGenesisMinter, mod, MOD);
      await expectHasRole(PookyBallGenesisMinter, backendSigner, BE);
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
        PookyBallGenesisMinter.connect(player).setTierBatch([player.address], [randomTier]),
        player,
        MOD,
      );
    });
  });

  describe('setMinTierToBuy', () => {
    it('should revert if non-MOD account tries to set minimum tier to buy', async () => {
      const randomMinimumTier = randInt(HUNDRED);
      await expectMissingRole(PookyBallGenesisMinter.connect(player).setMinTierToBuy(randomMinimumTier), player, MOD);
    });
  });

  describe('setMaxBallsPerUser', () => {
    it('should revert if non-MOD account tries to set maximum balls per user', async () => {
      const randomMaximumBallsPerUser = randInt(HUNDRED);
      await expectMissingRole(
        PookyBallGenesisMinter.connect(player).setMaxBallsPerUser(randomMaximumBallsPerUser),
        player,
        MOD,
      );
    });
  });

  describe('setRevokePeriod', () => {
    it('should revert if non-MOD account tries to set revoke period', async () => {
      const randomRevokePeriod = randInt(HUNDRED);
      await expectMissingRole(PookyBallGenesisMinter.connect(player).setRevokePeriod(randomRevokePeriod), player, MOD);
    });
  });

  describe('setVrfParameters', () => {
    it('should revert if non-MOD account tries to set Vrf parameters', async () => {
      await expectMissingRole(
        PookyBallGenesisMinter.connect(player).setVrfParameters(
          player.address,
          0,
          0,
          0,
          ethers.utils.solidityKeccak256(['string'], ['RANDOM_KEY_HASH']),
        ),
        player,
        MOD,
      );
    });

    it('should let MOD account set VRF parameters', async () => {
      await waitTx(VRFCoordinatorV2.createSubscription());
      await waitTx(VRFCoordinatorV2.addConsumer(ONE, PookyBallGenesisMinter.address));

      const randomGasLimitIncrement = randInt(HUNDRED);
      const newCallbackGasLimit = GAS_LIMIT + randomGasLimitIncrement;

      const randomRequestConfirmations = randInt(HUNDRED);

      const randomKeyHash = ethers.utils.solidityKeccak256(['string'], ['RANDOM_KEY_HASH']);

      await waitTx(
        PookyBallGenesisMinter.connect(mod).setVrfParameters(
          VRFCoordinatorV2.address,
          ONE,
          newCallbackGasLimit,
          randomRequestConfirmations,
          randomKeyHash,
        ),
      );

      expect(await PookyBallGenesisMinter.vrf_coordinator()).to.be.equal(
        VRFCoordinatorV2.address,
        'VRF Coordinator is not set successfully',
      );
      expect(await PookyBallGenesisMinter.vrf_subscriptionId()).to.be.equal(
        ONE,
        'VRF Subscription Id is not set successfully',
      );
      expect(await PookyBallGenesisMinter.vrf_callbackGasLimit()).to.be.equal(
        newCallbackGasLimit,
        'VRF Callback gas limit is not set successfully',
      );
      expect(await PookyBallGenesisMinter.vrf_requestConfirmations()).to.be.equal(
        randomRequestConfirmations,
        'VRF request confirmations is not set successfully',
      );
      expect(await PookyBallGenesisMinter.vrf_keyHash()).to.be.equal(
        randomKeyHash,
        'VRF key hash is not set successfully',
      );
    });
  });

  describe('createMintTemplate', () => {
    it('should revert if non-MOD account tries to create mint template', async () => {
      await expectMissingRole(
        PookyBallGenesisMinter.connect(player).createMintTemplate({
          enabled: true,
          rarity: ZERO,
          maxMints: HUNDRED,
          currentMints: ZERO,
          price: ethers.utils.parseEther(ONE.toString()),
          payingToken: POK.address,
        }),
        player,
        MOD,
      );
    });
  });

  describe('changeMintTemplateCanMint', () => {
    it('should revert if non-MOD account tries to change mint template', async () => {
      const randomTemplateId = randInt(HUNDRED);
      await expectMissingRole(
        PookyBallGenesisMinter.connect(player).enableMintTemplate(randomTemplateId, true),
        player,
        MOD,
      );
      await expectMissingRole(
        PookyBallGenesisMinter.connect(player).enableMintTemplate(randomTemplateId, false),
        player,
        MOD,
      );
    });
  });

  describe('setPookyBallContract', () => {
    it('should revert if non-DEFAULT_ADMIN_ROLE account tries to set PookyBall contract address', async () => {
      await expectMissingRole(
        PookyBallGenesisMinter.connect(player).setPookyBallContract(player.address),
        player,
        DEFAULT_ADMIN_ROLE,
      );
    });
  });

  describe('mintBallsAuthorized', () => {
    it('should revert if non-BE account tries to mint balls authorized', async () => {
      const randomMintTemplate = randInt(HUNDRED);
      const randomNumberOfBalls = randInt(HUNDRED);
      await expectMissingRole(
        PookyBallGenesisMinter.connect(player).mintAuthorized(player.address, randomMintTemplate, randomNumberOfBalls),
        player,
        BE,
      );
    });
  });

  describe('revokeBallAuthorized', () => {
    it('should revert if non-BE account tries to revoke ball authorized', async () => {
      const randomBallId = randInt(HUNDRED);
      await expectMissingRole(PookyBallGenesisMinter.connect(player).revokeBallAuthorized(randomBallId), player, BE);
    });
  });

  describe('minTierToBuy', () => {
    it('should let MOD account sets minimum tier to buy', async () => {
      const randomMinimumTierToBuy = randInt(HUNDRED);
      await waitTx(PookyBallGenesisMinter.connect(mod).setMinTierToBuy(randomMinimumTierToBuy));

      const minTierToBuy = await PookyBallGenesisMinter.minTierToBuy();
      expect(minTierToBuy).to.be.equal(randomMinimumTierToBuy, 'Minimum tier to buy is not set successfully');
    });
  });

  describe('setMaxBallsPerUser', () => {
    it('should let MOD account sets maximum balls per user', async () => {
      const randomMaximumBallsPerUser = randInt(HUNDRED);
      await waitTx(PookyBallGenesisMinter.connect(mod).setMaxBallsPerUser(randomMaximumBallsPerUser));

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
      await waitTx(PookyBallGenesisMinter.connect(mod).setRevokePeriod(randomRevokePeriod * HUNDRED));

      const revokePeriod = await PookyBallGenesisMinter.revokePeriod();
      expect(revokePeriod).to.be.equal(randomRevokePeriod * HUNDRED, 'Revoke period is not set successfully');
    });
  });

  describe('setTierBatch', () => {
    it('should let MOD account sets address tier', async () => {
      const randomAddressTierIncrement = randInt(HUNDRED);
      const minTierToBuy = await PookyBallGenesisMinter.minTierToBuy();
      const newAddressTier = minTierToBuy.toNumber() + randomAddressTierIncrement;

      await waitTx(PookyBallGenesisMinter.connect(mod).setTierBatch([player.address], [newAddressTier]));
      const addressTierAfter = await PookyBallGenesisMinter.userTiers(player.address);

      expect(addressTierAfter).to.be.equal(newAddressTier, 'Address tier is not set successfully');
    });
  });

  describe('createMintTemplate', () => {
    it('should let MOD account creates mint template', async () => {
      const templateNumberBefore = await PookyBallGenesisMinter.lastMintTemplateId();

      await waitTx(
        PookyBallGenesisMinter.connect(mod).createMintTemplate({
          enabled: true,
          rarity: ZERO.toString(),
          maxMints: HUNDRED.toString(),
          currentMints: ZERO.toString(),
          price: ethers.utils.parseEther(ONE.toString()),
          payingToken: POK.address,
        }),
      );

      const templateNumberAfter = await PookyBallGenesisMinter.lastMintTemplateId();

      expect(templateNumberAfter).to.be.equal(templateNumberBefore.add(ONE), 'Template not minted');
    });
  });

  describe('mint', () => {
    it('should revert if user tier is too small', async () => {
      // Ensure that tier 1 is required to mint (tier 0 means that mint is public)
      await waitTx(PookyBallGenesisMinter.connect(mod).setMinTierToBuy(1));

      const numberOfBalls = ONE;
      const lastMintTemplateId = await PookyBallGenesisMinter.lastMintTemplateId();
      const ballPrice = (await PookyBallGenesisMinter.mintTemplates(lastMintTemplateId)).price;

      await expect(
        PookyBallGenesisMinter.connect(player).mint(numberOfBalls, lastMintTemplateId, {
          value: ballPrice.mul(numberOfBalls),
        }),
      ).to.be.reverted;
    });

    it('should revert if user tries to mint too much balls', async () => {
      const minTierToBuy = await PookyBallGenesisMinter.minTierToBuy();
      const mintsLeft = await PookyBallGenesisMinter.mintsLeft(player.address);
      const numberOfBalls = mintsLeft.add(ONE);
      const lastMintTemplateId = await PookyBallGenesisMinter.lastMintTemplateId();
      const ballPrice = (await PookyBallGenesisMinter.mintTemplates(lastMintTemplateId)).price;

      await waitTx(PookyBallGenesisMinter.connect(mod).setTierBatch([player.address], [minTierToBuy.add(ONE)]));

      await expect(
        PookyBallGenesisMinter.connect(player).mint(numberOfBalls, lastMintTemplateId, {
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

      await waitTx(PookyBallGenesisMinter.connect(mod).setTierBatch([player.address], [minTierToBuy.add(ONE)]));

      await expect(
        PookyBallGenesisMinter.connect(player).mint(numberOfBalls, lastMintTemplateId, {
          value: ballPrice.mul(numberOfBalls),
        }),
      ).to.be.reverted;
    });

    it('should revert if user does not send enough MATIC with the transaction', async () => {
      const minTierToBuy = await PookyBallGenesisMinter.minTierToBuy();
      const numberOfBalls = ONE;
      const lastMintTemplateId = await PookyBallGenesisMinter.lastMintTemplateId();

      await waitTx(PookyBallGenesisMinter.connect(mod).setTierBatch([player.address], [minTierToBuy.add(ONE)]));

      await expect(
        PookyBallGenesisMinter.connect(player).mint(numberOfBalls, lastMintTemplateId, {
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
        PookyBallGenesisMinter.connect(player).mint(numberOfBalls, lastMintTemplateId, {
          value: txValue,
        }),
      )
        .changeEtherBalances([player.address, treasury.address], [`-${txValue.toString()}`, txValue])
        .changeTokenBalance(PookyBall, PookyBallGenesisMinter.address, 1);

      // Until the contract receives the random words, the NFT is owned by the PookyBallGenesisMinter contract
      const tokenId = await PookyBall.lastTokenId();

      // Fulfill the VRF request
      const randomEntropy = randInt(HUNDRED);
      await expect(
        VRFCoordinatorV2.fulfillRandomWordsWithOverride(1, PookyBallGenesisMinter.address, [randomEntropy]),
      ).changeTokenBalance(PookyBall, player, 1);

      const ball = await PookyBall.getBallInfo(tokenId);
      expect(ball.randomEntropy).to.be.equal(randomEntropy); // Entropy has been applied
      expect(await PookyBall.ownerOf(tokenId)).to.be.equal(player.address); // Player is now the owner of the NFT
    });
  });

  describe('tokenURI', () => {
    it('should expose the ball information', async () => {
      // Allow the mod account to mint a ball
      await waitTx(PookyBall.grantRole(POOKY_CONTRACT, mod.address));
      await waitTx(PookyBall.connect(mod).mint(player.address, BallRarity.Uncommon, 0));

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
        PookyBallGenesisMinter.connect(backendSigner).mintAuthorized(player.address, numberOfBalls, lastMintTemplateId),
      ).to.changeTokenBalance(PookyBall, PookyBallGenesisMinter, 1);

      const randomEntropy = randInt(HUNDRED);
      await expect(
        VRFCoordinatorV2.fulfillRandomWordsWithOverride(1, PookyBallGenesisMinter.address, [randomEntropy]),
      ).to.changeTokenBalances(PookyBall, [PookyBallGenesisMinter, player], [-1, 1]);
    });
  });

  describe('transfer', async () => {
    const ballId = await PookyBallGenesisMinter.ballsMinted();
    await expect(PookyBall.connect(player).transferFrom(player.address, mod.address, ballId)).to.be.revertedWith('13');
  });

  describe('revokeBallAuthorized', () => {
    beforeEach(async () => {
      const lastMintTemplateId = await PookyBallGenesisMinter.lastMintTemplateId();
      await waitTx(PookyBallGenesisMinter.connect(mod).setRevokePeriod(3600));
      await waitTx(
        PookyBallGenesisMinter.connect(backendSigner).mintAuthorized(player.address, ONE, lastMintTemplateId),
      );

      const randomEntropy = randInt(HUNDRED);
      await waitTx(VRFCoordinatorV2.fulfillRandomWordsWithOverride(1, PookyBallGenesisMinter.address, [randomEntropy]));
    });

    it('should allow BE account to revoke authorized ball', async () => {
      const ballId = await PookyBallGenesisMinter.ballsMinted();
      await expect(PookyBallGenesisMinter.connect(backendSigner).revokeBallAuthorized(ballId)).to.changeTokenBalance(
        PookyBall,
        player,
        -1,
      );
    });
  });
});
