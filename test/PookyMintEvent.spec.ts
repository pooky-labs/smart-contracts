import { DEFAULT_ADMIN_ROLE, GAS_LIMIT, HUNDRED, ONE, ZERO } from '../lib/constants';
import { deployContracts } from '../lib/deployContracts';
import getSigners from '../lib/getSigners';
import { randInt } from '../lib/rand';
import { BE, MOD, POOKY_CONTRACT } from '../lib/roles';
import { expectHasRole, expectMissingRole } from '../lib/testing/roles';
import { BallRarity } from '../lib/types';
import waitTx from '../lib/waitTx';
import { POK, PookyBall, PookyMintEvent, VRFCoordinatorV2Mock, VRFCoordinatorV2Mock__factory } from '../typings';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('PookyMintEvent', () => {
  let deployer: SignerWithAddress;
  let backendSigner: SignerWithAddress;
  let mod: SignerWithAddress;
  let treasury: SignerWithAddress;
  let player: SignerWithAddress;

  let PookyMintEvent: PookyMintEvent;
  let POK: POK;
  let PookyBall: PookyBall;
  let VRFCoordinatorV2: VRFCoordinatorV2Mock;

  beforeEach(async () => {
    ({ deployer, backendSigner, mod, treasury, player } = await getSigners());
    ({ PookyMintEvent, POK, PookyBall } = await deployContracts({ log: false, writeInDB: false }));

    // Create a default template
    await PookyMintEvent.connect(mod).createMintTemplate({
      canMint: true,
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
    await waitTx(VRFCoordinatorV2.addConsumer(subId, PookyMintEvent.address));
    await waitTx(
      PookyMintEvent.connect(mod).setVrfParameters(
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
      await expectHasRole(PookyMintEvent, mod, MOD);
      await expectHasRole(PookyMintEvent, backendSigner, BE);
    });

    it('should have contracts configured properly', async () => {
      expect(await PookyMintEvent.pookyBall()).to.be.equal(
        PookyBall.address,
        'PookyBall contract address is not set correctly inside PookyMintEvent contract',
      );
    });
  });

  describe('setAddressTier', () => {
    it('should revert if non-MOD account tries to set address tier', async () => {
      const randomTier = randInt(HUNDRED);
      await expectMissingRole(PookyMintEvent.connect(player).setAddressTier(player.address, randomTier), player, MOD);
    });
  });

  describe('setMinTierToBuy', () => {
    it('should revert if non-MOD account tries to set minimum tier to buy', async () => {
      const randomMinimumTier = randInt(HUNDRED);
      await expectMissingRole(PookyMintEvent.connect(player).setMinTierToBuy(randomMinimumTier), player, MOD);
    });
  });

  describe('setMaxBallsPerUser', () => {
    it('should revert if non-MOD account tries to set maximum balls per user', async () => {
      const randomMaximumBallsPerUser = randInt(HUNDRED);
      await expectMissingRole(
        PookyMintEvent.connect(player).setMaxBallsPerUser(randomMaximumBallsPerUser),
        player,
        MOD,
      );
    });
  });

  describe('setRevokePeriod', () => {
    it('should revert if non-MOD account tries to set revoke period', async () => {
      const randomRevokePeriod = randInt(HUNDRED);
      await expectMissingRole(PookyMintEvent.connect(player).setRevokePeriod(randomRevokePeriod), player, MOD);
    });
  });

  describe('setVrfParameters', () => {
    it('should revert if non-MOD account tries to set Vrf parameters', async () => {
      await expectMissingRole(
        PookyMintEvent.connect(player).setVrfParameters(
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
      await waitTx(VRFCoordinatorV2.addConsumer(ONE, PookyMintEvent.address));

      const randomGasLimitIncrement = randInt(HUNDRED);
      const newCallbackGasLimit = GAS_LIMIT + randomGasLimitIncrement;

      const randomRequestConfirmations = randInt(HUNDRED);

      const randomKeyHash = ethers.utils.solidityKeccak256(['string'], ['RANDOM_KEY_HASH']);

      await waitTx(
        PookyMintEvent.connect(mod).setVrfParameters(
          VRFCoordinatorV2.address,
          ONE,
          newCallbackGasLimit,
          randomRequestConfirmations,
          randomKeyHash,
        ),
      );

      expect(await PookyMintEvent.vrf_coordinator()).to.be.equal(
        VRFCoordinatorV2.address,
        'VRF Coordinator is not set successfully',
      );
      expect(await PookyMintEvent.vrf_subscriptionId()).to.be.equal(ONE, 'VRF Subscription Id is not set successfully');
      expect(await PookyMintEvent.vrf_callbackGasLimit()).to.be.equal(
        newCallbackGasLimit,
        'VRF Callback gas limit is not set successfully',
      );
      expect(await PookyMintEvent.vrf_requestConfirmations()).to.be.equal(
        randomRequestConfirmations,
        'VRF request confirmations is not set successfully',
      );
      expect(await PookyMintEvent.vrf_keyHash()).to.be.equal(randomKeyHash, 'VRF key hash is not set successfully');
    });
  });

  describe('createMintTemplate', () => {
    it('should revert if non-MOD account tries to create mint template', async () => {
      await expectMissingRole(
        PookyMintEvent.connect(player).createMintTemplate({
          canMint: true,
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
        PookyMintEvent.connect(player).changeMintTemplateCanMint(randomTemplateId, true),
        player,
        MOD,
      );
      await expectMissingRole(
        PookyMintEvent.connect(player).changeMintTemplateCanMint(randomTemplateId, false),
        player,
        MOD,
      );
    });
  });

  describe('setPookyBallContract', () => {
    it('should revert if non-DEFAULT_ADMIN_ROLE account tries to set PookyBall contract address', async () => {
      await expectMissingRole(
        PookyMintEvent.connect(player).setPookyBallContract(player.address),
        player,
        DEFAULT_ADMIN_ROLE,
      );
    });
  });

  describe('mintBallsAuthorized', () => {
    it('should revert if non-BE account tries to mint balls authorized', async () => {
      const randomNumberOfBalls = randInt(HUNDRED);
      const randomMintTemplate = randInt(HUNDRED);
      await expectMissingRole(
        PookyMintEvent.connect(player).mintBallsAuthorized(player.address, randomNumberOfBalls, randomMintTemplate),
        player,
        BE,
      );
    });
  });

  describe('revokeBallAuthorized', () => {
    it('should revert if non-BE account tries to revoke ball authorized', async () => {
      const randomBallId = randInt(HUNDRED);
      await expectMissingRole(PookyMintEvent.connect(player).revokeBallAuthorized(randomBallId), player, BE);
    });
  });

  describe('minTierToBuy', () => {
    it('should let MOD account sets minimum tier to buy', async () => {
      const randomMinimumTierToBuy = randInt(HUNDRED);
      await waitTx(PookyMintEvent.connect(mod).setMinTierToBuy(randomMinimumTierToBuy));

      const minTierToBuy = await PookyMintEvent.minTierToBuy();
      expect(minTierToBuy).to.be.equal(randomMinimumTierToBuy, 'Minimum tier to buy is not set successfully');
    });
  });

  describe('setMaxBallsPerUser', () => {
    it('should let MOD account sets maximum balls per user', async () => {
      const randomMaximumBallsPerUser = randInt(HUNDRED);
      await waitTx(PookyMintEvent.connect(mod).setMaxBallsPerUser(randomMaximumBallsPerUser));

      const maximumBallsPerUser = await PookyMintEvent.maxBallsPerUser();

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
      await waitTx(PookyMintEvent.connect(mod).setRevokePeriod(randomRevokePeriod * HUNDRED));

      const revokePeriod = await PookyMintEvent.revokePeriod();
      expect(revokePeriod).to.be.equal(randomRevokePeriod * HUNDRED, 'Revoke period is not set successfully');
    });
  });

  describe('setAddressTier', () => {
    it('should let MOD account sets address tier', async () => {
      const randomAddressTierIncrement = randInt(HUNDRED);
      const minTierToBuy = await PookyMintEvent.minTierToBuy();
      const newAddressTier = minTierToBuy.toNumber() + randomAddressTierIncrement;

      await waitTx(PookyMintEvent.connect(mod).setAddressTier(player.address, newAddressTier));
      const addressTierAfter = await PookyMintEvent.userTiers(player.address);

      expect(addressTierAfter).to.be.equal(newAddressTier, 'Address tier is not set successfully');
    });
  });

  describe('createMintTemplate', () => {
    it('should let MOD account creates mint template', async () => {
      const templateNumberBefore = await PookyMintEvent.lastMintTemplateId();

      await waitTx(
        PookyMintEvent.connect(mod).createMintTemplate({
          canMint: true,
          rarity: ZERO.toString(),
          maxMints: HUNDRED.toString(),
          currentMints: ZERO.toString(),
          price: ethers.utils.parseEther(ONE.toString()),
          payingToken: POK.address,
        }),
      );

      const templateNumberAfter = await PookyMintEvent.lastMintTemplateId();

      expect(templateNumberAfter).to.be.equal(templateNumberBefore.add(ONE), 'Template not minted');
    });
  });

  describe('mintBalls', () => {
    it('should revert if user tier is too small', async () => {
      // Ensure that tier 1 is required to mint (tier 0 means that mint is public)
      await waitTx(PookyMintEvent.connect(mod).setMinTierToBuy(1));

      const numberOfBalls = ONE;
      const lastMintTemplateId = await PookyMintEvent.lastMintTemplateId();
      const ballPrice = (await PookyMintEvent.mintTemplates(lastMintTemplateId)).price;

      await expect(
        PookyMintEvent.connect(player).mintBalls(numberOfBalls, lastMintTemplateId, {
          value: ballPrice.mul(numberOfBalls),
        }),
      ).to.be.reverted;
    });

    it('should revert if user tries to mint too much balls', async () => {
      const minTierToBuy = await PookyMintEvent.minTierToBuy();
      const mintsLeft = await PookyMintEvent.mintsLeft(player.address);
      const numberOfBalls = mintsLeft.add(ONE);
      const lastMintTemplateId = await PookyMintEvent.lastMintTemplateId();
      const ballPrice = (await PookyMintEvent.mintTemplates(lastMintTemplateId)).price;

      await waitTx(PookyMintEvent.connect(mod).setAddressTier(player.address, minTierToBuy.add(ONE)));

      await expect(
        PookyMintEvent.connect(player).mintBalls(numberOfBalls, lastMintTemplateId, {
          value: ballPrice.mul(numberOfBalls),
        }),
      ).to.be.reverted;
    });

    it('should revert if user tries too mint more balls than allowed by the supply', async () => {
      const maxMintSupply = await PookyMintEvent.maxMintSupply();
      const minTierToBuy = await PookyMintEvent.minTierToBuy();
      const numberOfBalls = maxMintSupply.add(ONE);
      const lastMintTemplateId = await PookyMintEvent.lastMintTemplateId();
      const ballPrice = (await PookyMintEvent.mintTemplates(lastMintTemplateId)).price;

      await waitTx(PookyMintEvent.connect(mod).setAddressTier(player.address, minTierToBuy.add(ONE)));

      await expect(
        PookyMintEvent.connect(player).mintBalls(numberOfBalls, lastMintTemplateId, {
          value: ballPrice.mul(numberOfBalls),
        }),
      ).to.be.reverted;
    });

    it('should revert if user does not send enough MATIC with the transaction', async () => {
      const minTierToBuy = await PookyMintEvent.minTierToBuy();
      const numberOfBalls = ONE;
      const lastMintTemplateId = await PookyMintEvent.lastMintTemplateId();

      await waitTx(PookyMintEvent.connect(mod).setAddressTier(player.address, minTierToBuy.add(ONE)));

      await expect(
        PookyMintEvent.connect(player).mintBalls(numberOfBalls, lastMintTemplateId, {
          value: ethers.utils.parseEther(ZERO.toString()),
        }),
      ).to.be.reverted;
    });

    it('should let user mint a ball successfully', async () => {
      const numberOfBalls = ONE;

      const lastMintTemplateId = await PookyMintEvent.lastMintTemplateId();
      const ballPrice = (await PookyMintEvent.mintTemplates(lastMintTemplateId)).price;
      const txValue = ballPrice.mul(numberOfBalls);

      await expect(
        PookyMintEvent.connect(player).mintBalls(numberOfBalls, lastMintTemplateId, {
          value: txValue,
        }),
      )
        .changeEtherBalances([player.address, treasury.address], [`-${txValue.toString()}`, txValue])
        .changeTokenBalance(PookyBall, PookyMintEvent.address, 1);

      // Until the contract receives the random words, the NFT is owned by the PookyMintEvent contract
      const ballId = await PookyBall.lastBallId();

      // Fulfill the VRF request
      const randomEntropy = randInt(HUNDRED);
      await expect(
        VRFCoordinatorV2.fulfillRandomWordsWithOverride(1, PookyMintEvent.address, [randomEntropy]),
      ).changeTokenBalance(PookyBall, player, 1);

      const ball = await PookyBall.getBallInfo(ballId);
      expect(ball.randomEntropy).to.be.equal(randomEntropy); // Entropy has been applied
      expect(await PookyBall.ownerOf(ballId)).to.be.equal(player.address); // Player is now the owner of the NFT
    });
  });

  describe('tokenURI', () => {
    it('should expose the ball information', async () => {
      // Allow the mod account to mint a ball
      await waitTx(PookyBall.grantRole(POOKY_CONTRACT, mod.address));
      await waitTx(PookyBall.connect(mod).mintWithRarity(player.address, BallRarity.Uncommon));

      const ballId = await PookyBall.lastBallId();
      expect(await PookyBall.getBallPxp(ballId)).to.be.equal(0);
      expect(await PookyBall.tokenURI(ballId)).to.be.equal(`${(await PookyBall.baseUri()) + ballId}.json`);
    });
  });

  describe('mintBallsAuthorized', () => {
    it('should let BE account mint authorized ball', async () => {
      const numberOfBalls = ONE;
      const lastMintTemplateId = await PookyMintEvent.lastMintTemplateId();

      await expect(
        PookyMintEvent.connect(backendSigner).mintBallsAuthorized(player.address, numberOfBalls, lastMintTemplateId),
      ).to.changeTokenBalance(PookyBall, PookyMintEvent, 1);

      const randomEntropy = randInt(HUNDRED);
      await expect(
        VRFCoordinatorV2.fulfillRandomWordsWithOverride(1, PookyMintEvent.address, [randomEntropy]),
      ).to.changeTokenBalances(PookyBall, [PookyMintEvent, player], [-1, 1]);
    });
  });

  describe('transfer', async () => {
    const ballId = await PookyMintEvent.ballsMinted();
    await expect(PookyBall.connect(player).transferFrom(player.address, mod.address, ballId)).to.be.revertedWith('13');
  });

  describe('revokeBallAuthorized', () => {
    beforeEach(async () => {
      const lastMintTemplateId = await PookyMintEvent.lastMintTemplateId();
      await waitTx(PookyMintEvent.connect(mod).setRevokePeriod(3600));
      await waitTx(PookyMintEvent.connect(backendSigner).mintBallsAuthorized(player.address, ONE, lastMintTemplateId));

      const randomEntropy = randInt(HUNDRED);
      await waitTx(VRFCoordinatorV2.fulfillRandomWordsWithOverride(1, PookyMintEvent.address, [randomEntropy]));
    });

    it('should allow BE account to revoke authorized ball', async () => {
      const ballId = await PookyMintEvent.ballsMinted();
      await expect(PookyMintEvent.connect(backendSigner).revokeBallAuthorized(ballId)).to.changeTokenBalance(
        PookyBall,
        player,
        -1,
      );
    });
  });
});
