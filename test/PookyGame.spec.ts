import { HUNDRED, MAXIMUM_UNCOMMON_BALL_LEVEL, ONE } from '../lib/constants';
import getSigners from '../lib/getSigners';
import { signRewardsClaim } from '../lib/helpers/signRewardsClaim';
import { randInt, randUint256 } from '../lib/rand';
import { POOKY_CONTRACT, REWARD_SIGNER } from '../lib/roles';
import { expectHasRole } from '../lib/testing/roles';
import stackFixture from '../lib/testing/stackFixture';
import { BallRarity } from '../lib/types';
import waitTx from '../lib/waitTx';
import { POK, PookyBall, PookyGame } from '../typings';
import { BallUpdatesStruct } from '../typings/contracts/PookyGame';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { BigNumber } from 'ethers';
import { ethers } from 'hardhat';

describe('PookyGame', () => {
  let deployer: SignerWithAddress;
  let backendSigner: SignerWithAddress;
  let player: SignerWithAddress;
  let mod: SignerWithAddress;

  let POK: POK;
  let PookyGame: PookyGame;
  let PookyBall: PookyBall;

  beforeEach(async () => {
    ({ deployer, backendSigner, player, mod } = await getSigners());
    ({ PookyGame, PookyBall, POK } = await loadFixture(stackFixture));
  });

  describe('configuration', () => {
    it('should have addresses properly configured', async () => {
      expect(await PookyGame.pookyBall()).to.be.equal(
        PookyBall.address,
        'PookyBall contract address is not set correctly inside PookyGame contract',
      );
      expect(await PookyGame.pok()).to.be.equal(
        POK.address,
        'POK token address is not set correctly inside PookyGame contract',
      );

      await expectHasRole(PookyGame, backendSigner, REWARD_SIGNER);
    });
  });

  describe('claimRewards', () => {
    let nonce: BigNumber;
    let currentTimestamp: number;
    let amount: BigNumber;
    let ttl: number;

    let tokenId: BigNumber;
    let ballLevel: number;
    let pxpNeededToLevelUp: BigNumber;
    let ballUpdates: BallUpdatesStruct[];

    beforeEach(async () => {
      nonce = randUint256();
      ({ timestamp: currentTimestamp } = await ethers.provider.getBlock('latest'));
      amount = ethers.utils.parseEther(randInt(HUNDRED).toString());
      ttl = currentTimestamp + 60 + randInt(HUNDRED); // at least 1 minute

      await waitTx(PookyBall.grantRole(POOKY_CONTRACT, mod.address));
      await waitTx(PookyBall.connect(mod).mint(player.address, BallRarity.Uncommon, 0));

      tokenId = await PookyBall.lastTokenId();
      ballLevel = (await PookyBall.getBallInfo(tokenId)).level.toNumber();
      pxpNeededToLevelUp = await PookyGame.levelPXP(ballLevel + ONE);
      ballUpdates = [
        {
          tokenId,
          addPXP: pxpNeededToLevelUp.add(ONE),
          shouldLevelUp: true,
        },
      ];
    });

    it('should allow players to claim POK', async () => {
      const signature = await signRewardsClaim(amount, [], ttl, nonce, backendSigner);

      await expect(PookyGame.connect(player).claimRewards(amount, [], ttl, nonce, signature)).to.changeTokenBalance(
        POK,
        player,
        amount,
      );
    });

    it('should allow players to claim POK and add PXP to an existing ball', async () => {
      const signature = await signRewardsClaim(amount, ballUpdates, ttl, nonce, backendSigner);

      await expect(PookyGame.connect(player).claimRewards(amount, ballUpdates, ttl, nonce, signature)).to.not.be
        .reverted;
      const newBallLevel = (await PookyBall.getBallInfo(tokenId)).level;
      expect(newBallLevel).to.be.equal(ballLevel + ONE);
    });

    it('should revert if nonce has already been used', async () => {
      const signature = await signRewardsClaim(amount, ballUpdates, ttl, nonce, backendSigner);

      // First call: success!
      await expect(PookyGame.connect(player).claimRewards(amount, ballUpdates, ttl, nonce, signature)).to.not.be
        .reverted;

      // Second call: reverted because nonce was already used
      await expect(
        PookyGame.connect(player).claimRewards(amount, ballUpdates, ttl, nonce, signature),
      ).to.be.revertedWith('10');
    });

    it('should revert if user tries to claim rewards with an invalid signature', async () => {
      const signature = await signRewardsClaim(amount, ballUpdates, ttl, nonce, backendSigner);

      await expect(
        PookyGame.connect(player).claimRewards(
          amount.mul(100), // wrong amount!
          ballUpdates,
          ttl,
          nonce,
          signature,
        ),
      ).to.be.revertedWith('8');
    });

    it('should revert if reward claim has expired', async () => {
      const expiredTimestamp = currentTimestamp - 100;
      const signature = await signRewardsClaim(amount, ballUpdates, expiredTimestamp, nonce, backendSigner);

      await expect(
        PookyGame.connect(player).claimRewards(amount, ballUpdates, expiredTimestamp, nonce, signature),
      ).to.be.revertedWith('9');
    });

    it('should revert if sender is not a PookyBall owner', async () => {
      const signature = await signRewardsClaim(amount, ballUpdates, ttl, nonce, backendSigner);

      // deployer is not owner of the ball
      await expect(
        PookyGame.connect(deployer).claimRewards(amount, ballUpdates, ttl, nonce, signature),
      ).to.be.revertedWith('5');
    });

    it('should revert if player does not own enough PXP to level up', async () => {
      const ballUpdate: BallUpdatesStruct = {
        tokenId: BigNumber.from(ONE),
        addPXP: pxpNeededToLevelUp.sub(ONE), // not enough PXP!
        shouldLevelUp: true,
      };

      const signature = await signRewardsClaim(amount, [ballUpdate], BigNumber.from(ttl), nonce, backendSigner);

      await expect(
        PookyGame.connect(player).claimRewards(amount, [ballUpdate], ttl, nonce, signature),
      ).to.be.revertedWith('6');
    });

    it('should revert if ball has reach the maximum level', async () => {
      await waitTx(POK.grantRole(POOKY_CONTRACT, mod.address));
      await waitTx(PookyBall.grantRole(POOKY_CONTRACT, mod.address));

      await waitTx(PookyBall.connect(mod).changeBallLevel(tokenId, MAXIMUM_UNCOMMON_BALL_LEVEL));
      expect((await PookyBall.getBallInfo(tokenId)).level).to.equal(MAXIMUM_UNCOMMON_BALL_LEVEL);
      const deltaPXP = await PookyGame.levelPXP(MAXIMUM_UNCOMMON_BALL_LEVEL + 1);

      const ballUpdate: BallUpdatesStruct = {
        tokenId: BigNumber.from(ONE),
        addPXP: pxpNeededToLevelUp.sub(ONE),
        shouldLevelUp: true,
      };
      await waitTx(POK.connect(mod).mint(player.address, deltaPXP));

      const signature = await signRewardsClaim(amount, [ballUpdate], BigNumber.from(ttl), nonce, backendSigner);
      await expect(
        PookyGame.connect(player).claimRewards(amount, [ballUpdate], ttl, nonce, signature),
      ).to.be.revertedWith('6');
    });
  });
});
