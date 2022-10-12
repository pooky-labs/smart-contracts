import { HUNDRED, ONE } from '../lib/constants';
import getSigners from '../lib/getSigners';
import { signRewardsClaim } from '../lib/helpers/signRewardsClaim';
import parseEther from '../lib/parseEther';
import { randInt, randUint256 } from '../lib/rand';
import { POOKY_CONTRACT, REWARD_SIGNER } from '../lib/roles';
import { expectHasRole } from '../lib/testing/roles';
import stackFixture from '../lib/testing/stackFixture';
import { BallRarity } from '../lib/types';
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

  describe('levelPXP', () => {
    it('should return zero for level zero', async () => {
      expect(await PookyGame.levelPXP(0)).to.equal(0);
    });
  });

  describe('levelUp', () => {
    let tokenId: BigNumber;

    beforeEach(async () => {
      await POK.grantRole(POOKY_CONTRACT, mod.address);
      await PookyBall.grantRole(POOKY_CONTRACT, mod.address);
      await PookyBall.connect(mod).mint(player.address, BallRarity.Common, 0);
      tokenId = await PookyBall.lastTokenId();
    });

    it('should allow player to level up a ball', async () => {
      const currentLevel = 5;
      await PookyBall.connect(mod).changeLevel(tokenId, currentLevel);
      await PookyBall.connect(mod).changePXP(tokenId, parseEther(100));
      await POK.connect(mod).mint(player.address, parseEther(10000));

      await expect(PookyGame.connect(player).levelUp(tokenId)).to.not.be.reverted;
      const { level: newLevel } = await PookyBall.getBallInfo(tokenId);
      expect(newLevel).to.equal(currentLevel + 1);
    });

    it('should allow player to level up a ball by exchanging POK to fill missing PXP', async () => {
      const currentLevel = 5;
      await PookyBall.connect(mod).changeLevel(tokenId, currentLevel);
      await POK.connect(mod).mint(player.address, parseEther(100000));

      await expect(PookyGame.connect(player).levelUp(tokenId)).to.not.be.reverted;
      const { level: newLevel } = await PookyBall.getBallInfo(tokenId);
      expect(newLevel).to.equal(currentLevel + 1);
    });

    it('should revert if the player is not the owner of the ball', async () => {
      const currentLevel = 5;
      await PookyBall.connect(player).transferFrom(player.address, mod.address, tokenId);
      await PookyBall.connect(mod).changeLevel(tokenId, currentLevel);
      await PookyBall.connect(mod).changePXP(tokenId, parseEther(100));
      await POK.connect(mod).mint(mod.address, parseEther(10000));

      await expect(PookyGame.connect(player).levelUp(tokenId))
        .to.be.revertedWithCustomError(PookyGame, 'OwnershipRequired')
        .withArgs(tokenId);
    });

    it('should revert if the ball has reached the maximum level', async () => {
      const currentLevel = 40;
      await PookyBall.connect(mod).changeLevel(tokenId, currentLevel);
      await PookyBall.connect(mod).changePXP(tokenId, parseEther(100000));
      await POK.connect(mod).mint(player.address, parseEther(100000));

      await expect(PookyGame.connect(player).levelUp(tokenId))
        .to.be.revertedWithCustomError(PookyGame, 'MaximumLevelReached')
        .withArgs(tokenId, currentLevel);
    });

    it('should revert if the ball the user does not own enough POK', async () => {
      const currentLevel = 5;

      await PookyBall.connect(mod).changeLevel(tokenId, currentLevel);
      await PookyBall.connect(mod).changePXP(tokenId, parseEther(100000));
      const requiredPOK = await PookyGame.levelPOKCost(tokenId);
      const mintedPOK = requiredPOK.sub(1);
      await POK.connect(mod).mint(player.address, mintedPOK);

      await expect(PookyGame.connect(player).levelUp(tokenId))
        .to.be.revertedWithCustomError(PookyGame, 'InsufficientPOKBalance')
        .withArgs(requiredPOK, mintedPOK);
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
      ttl = currentTimestamp + 3600 + randInt(HUNDRED); // at least 1 minute

      await PookyBall.grantRole(POOKY_CONTRACT, mod.address);
      await PookyBall.connect(mod).mint(player.address, BallRarity.Common, 0);

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
      )
        .to.be.revertedWithCustomError(PookyGame, 'InvalidSignature')
        .withArgs();
    });

    it('should revert if reward claim has expired', async () => {
      const expiredTimestamp = currentTimestamp - 100;
      const signature = await signRewardsClaim(amount, ballUpdates, expiredTimestamp, nonce, backendSigner);

      await expect(PookyGame.connect(player).claimRewards(amount, ballUpdates, expiredTimestamp, nonce, signature))
        .to.be.revertedWithCustomError(PookyGame, 'ExpiredSignature')
        .withArgs(expiredTimestamp);
    });

    it('should revert if nonce has already been used', async () => {
      const signature = await signRewardsClaim(amount, ballUpdates, ttl, nonce, backendSigner);

      // First call: success!
      await expect(PookyGame.connect(player).claimRewards(amount, ballUpdates, ttl, nonce, signature)).to.not.be
        .reverted;

      // Second call: reverted because nonce was already used
      await expect(PookyGame.connect(player).claimRewards(amount, ballUpdates, ttl, nonce, signature))
        .to.be.revertedWithCustomError(PookyGame, 'NonceUsed')
        .withArgs();
    });
  });
});
