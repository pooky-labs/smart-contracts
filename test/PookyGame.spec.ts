import { ONE } from '../lib/constants';
import parseEther from '../lib/parseEther';
import { DEFAULT_ADMIN_ROLE, REWARD_SIGNER } from '../lib/roles';
import getTestAccounts from '../lib/testing/getTestAccounts';
import { randAccount, randUint256 } from '../lib/testing/rand';
import { expectHasRole, expectMissingRole } from '../lib/testing/roles';
import stackFixture from '../lib/testing/stackFixture';
import { BallLuxury, BallRarity } from '../lib/types';
import { signRewardsClaim } from '../lib/utils/signRewardsClaim';
import { POK, PookyBall, PookyGame } from '../typings';
import { BallUpdatesStruct } from '../typings/contracts/PookyGame';
import { faker } from '@faker-js/faker';
import { loadFixture, setBalance } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { BigNumber } from 'ethers';
import { ethers } from 'hardhat';
import { beforeEach } from 'mocha';

describe('PookyGame', () => {
  let pooky: SignerWithAddress;
  let backend: SignerWithAddress;
  let player1: SignerWithAddress;
  let player2: SignerWithAddress;

  let POK: POK;
  let PookyGame: PookyGame;
  let PookyBall: PookyBall;

  let tokenId: BigNumber;

  beforeEach(async () => {
    ({ pooky, backend, player1, player2 } = await getTestAccounts());
    ({ PookyGame, PookyBall, POK } = await loadFixture(stackFixture));

    await PookyBall.connect(pooky).mint(player1.address, BallRarity.Common, BallLuxury.Common, 0);
    tokenId = await PookyBall.lastTokenId();
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

      await expectHasRole(PookyGame, backend, REWARD_SIGNER);
    });
  });

  describe('setPookyBallContract', () => {
    let newPookyBall: string;

    beforeEach(() => {
      newPookyBall = randAccount();
    });

    it('should allow DEFAULT_ADMIN_ROLE account to set the PookyBall contract address', async () => {
      await PookyGame.setPookyBallContract(newPookyBall);
      expect(await PookyGame.pookyBall()).to.equals(newPookyBall);
    });

    it('should revert if non-DEFAULT_ADMIN_ROLE account tries to set PookyBall contract address', async () => {
      await expectMissingRole(
        PookyGame.connect(player1).setPookyBallContract(newPookyBall),
        player1,
        DEFAULT_ADMIN_ROLE,
      );
    });
  });

  describe('setPOKContract', () => {
    let newPOK: string;

    beforeEach(() => {
      newPOK = randAccount();
    });

    it('should allow DEFAULT_ADMIN_ROLE account to set the POK contract address', async () => {
      await PookyGame.setPOKContract(newPOK);
      expect(await PookyGame.pok()).to.equals(newPOK);
    });

    it('should revert if non-DEFAULT_ADMIN_ROLE account tries to set the POK contract address', async () => {
      await expectMissingRole(PookyGame.connect(player1).setPOKContract(newPOK), player1, DEFAULT_ADMIN_ROLE);
    });
  });

  describe('levelPXP', () => {
    it('should return zero for level zero', async () => {
      expect(await PookyGame.levelPXP(0)).to.equal(0);
    });

    it('should follow the level formula up to level 10', async () => {
      expect(await PookyGame.levelPXP(10)).to.equal('125031342410180670736');
    });
  });

  describe('levelPOK', () => {
    it('should return zero for level zero', async () => {
      expect(await PookyGame.levelPOK(0)).to.equal(0);
    });

    it('should follow the level formula up to level 10', async () => {
      expect(await PookyGame.levelPOK(10)).to.equal('11252820816916260366');
    });
  });

  describe('levelPOKCost', async () => {
    let newLevel: number;
    let requiredPXP: BigNumber;

    beforeEach(async () => {
      newLevel = faker.datatype.number(10) + 1;
      requiredPXP = await PookyGame.levelPXP(newLevel);
    });

    it('should return levelPOK cost if ball has enough PXP', async () => {
      await PookyBall.connect(pooky).changeLevel(tokenId, newLevel);
      await PookyBall.connect(pooky).changePXP(tokenId, requiredPXP.mul(2)); // double of the required amount

      const expectedPOKamount = await PookyGame.levelPOK(newLevel + 1);
      expect(await PookyGame.levelPOKCost(tokenId)).to.equals(expectedPOKamount);
    });

    it('should return more than levelPOK cost if ball has enough PXP', async () => {
      await PookyBall.connect(pooky).changeLevel(tokenId, newLevel);
      await PookyBall.connect(pooky).changePXP(tokenId, requiredPXP.div(2)); // half of the required amount

      const expectedPOKamount = await PookyGame.levelPOK(newLevel + 1);
      expect(await PookyGame.levelPOKCost(tokenId)).to.be.greaterThan(expectedPOKamount);
    });
  });

  describe('levelUp', () => {
    let currentLevel: number;
    let requiredPXP: BigNumber;
    let deltaPXP: BigNumber;
    let requiredPOK: BigNumber;
    let deltaPOK: BigNumber;

    beforeEach(async () => {
      currentLevel = faker.datatype.number(10);
      requiredPXP = await PookyGame.levelPXP(currentLevel + 1);
      deltaPXP = parseEther(faker.datatype.number(1000));
      requiredPOK = await PookyGame.levelPOK(currentLevel + 1);
      deltaPOK = parseEther(faker.datatype.number(1000));

      await PookyBall.connect(pooky).changeLevel(tokenId, currentLevel);
    });

    it('should allow player to level up a ball', async () => {
      await PookyBall.connect(pooky).changePXP(tokenId, requiredPXP.add(deltaPXP));
      await POK.connect(pooky).mint(player1.address, requiredPOK.add(deltaPOK));

      await expect(PookyGame.connect(player1).levelUp(tokenId)).to.changeTokenBalance(
        POK,
        player1,
        `-${requiredPOK.toString()}`,
      );
      const { level: newLevel, pxp } = await PookyBall.getBallInfo(tokenId);
      expect(newLevel).to.equal(currentLevel + 1);
      expect(pxp).to.equals(deltaPXP);
      expect(await POK.balanceOf(player1.address)).to.equals(deltaPOK);
    });

    it('should allow player to level up a ball by exchanging POK to fill missing PXP', async () => {
      const actualPOKRequired = await PookyGame.levelPOKCost(tokenId);
      await POK.connect(pooky).mint(player1.address, actualPOKRequired.add(deltaPOK));

      await expect(PookyGame.connect(player1).levelUp(tokenId)).to.changeTokenBalance(
        POK,
        player1,
        `-${actualPOKRequired.toString()}`,
      );
      const { level: newLevel, pxp } = await PookyBall.getBallInfo(tokenId);
      expect(newLevel).to.equal(currentLevel + 1);
      expect(pxp).to.equals(0);
      expect(await POK.balanceOf(player1.address)).to.equals(deltaPOK);
    });

    it('should revert if the player is not the owner of the ball', async () => {
      await PookyBall.connect(pooky).changePXP(tokenId, requiredPXP);
      await POK.connect(pooky).mint(player2.address, requiredPOK);

      await expect(PookyGame.connect(player2).levelUp(tokenId))
        .to.be.revertedWithCustomError(PookyGame, 'OwnershipRequired')
        .withArgs(tokenId);
    });

    it('should revert if the ball has reached the maximum level', async () => {
      const { rarity } = await PookyBall.getBallInfo(tokenId);
      const maxLevel = (await PookyGame.maxBallLevelPerRarity(rarity)).toNumber();
      requiredPXP = await PookyGame.levelPXP(maxLevel + 1);
      requiredPOK = await PookyGame.levelPOK(maxLevel + 1);

      await PookyBall.connect(pooky).changeLevel(tokenId, maxLevel);
      await PookyBall.connect(pooky).changePXP(tokenId, requiredPXP);
      await POK.connect(pooky).mint(player1.address, requiredPOK);

      await expect(PookyGame.connect(player1).levelUp(tokenId))
        .to.be.revertedWithCustomError(PookyGame, 'MaximumLevelReached')
        .withArgs(tokenId, maxLevel);
    });

    it('should revert if the ball the user does not own enough POK', async () => {
      await PookyBall.connect(pooky).changeLevel(tokenId, currentLevel);
      await PookyBall.connect(pooky).changePXP(tokenId, requiredPXP);
      const actualPOK = requiredPOK.sub(1);
      await POK.connect(pooky).mint(player1.address, actualPOK);

      await expect(PookyGame.connect(player1).levelUp(tokenId))
        .to.be.revertedWithCustomError(PookyGame, 'InsufficientPOKBalance')
        .withArgs(requiredPOK, actualPOK);
    });
  });

  describe('claimRewards', () => {
    let nonce: BigNumber;
    let currentTimestamp: number;
    let rewardNAT: BigNumber;
    let rewardPOK: BigNumber;
    let ttl: number;

    let currentLevel: number;
    let rewardPXP: BigNumber;
    let ballUpdates: BallUpdatesStruct[];

    beforeEach(async () => {
      nonce = randUint256();
      rewardNAT = parseEther(faker.datatype.number(1000));
      rewardPOK = parseEther(faker.datatype.number(1000));
      ({ timestamp: currentTimestamp } = await ethers.provider.getBlock('latest'));
      ttl = currentTimestamp + 3600 + faker.datatype.number(1000); // at least 1 hour
      currentLevel = (await PookyBall.getBallInfo(tokenId)).level.toNumber();
      rewardPXP = await PookyGame.levelPXP(currentLevel + 1);
      ballUpdates = [
        {
          tokenId,
          addPXP: rewardPXP.add(1),
          shouldLevelUp: true,
        },
      ];

      // Ensure that the PookyGame contract has enough native currency
      await setBalance(PookyGame.address, rewardNAT.mul(100).toHexString().replace(/0x0+/, '0x'));
    });

    it('should allow players to claim POK', async () => {
      const signature = await signRewardsClaim(player1.address, rewardNAT, rewardPOK, [], ttl, nonce, backend);

      await expect(
        PookyGame.connect(player1).claimRewards(rewardNAT, rewardPOK, [], ttl, nonce, signature),
      ).to.changeTokenBalance(POK, player1, rewardPOK);
    });

    it('should allow players to claim POK and add PXP to an existing ball', async () => {
      const signature = await signRewardsClaim(player1.address, rewardNAT, rewardPOK, ballUpdates, ttl, nonce, backend);

      await expect(PookyGame.connect(player1).claimRewards(rewardNAT, rewardPOK, ballUpdates, ttl, nonce, signature)).to
        .not.be.reverted;
      const newBallLevel = (await PookyBall.getBallInfo(tokenId)).level;
      expect(newBallLevel).to.be.equal(currentLevel + ONE);
    });

    it('should revert if user tries to claim rewards with an invalid signature', async () => {
      const signature = await signRewardsClaim(player1.address, rewardNAT, rewardPOK, ballUpdates, ttl, nonce, backend);

      await expect(
        PookyGame.connect(player1).claimRewards(
          rewardNAT,
          rewardPOK.mul(100), // wrong amount!
          ballUpdates,
          ttl,
          nonce,
          signature,
        ),
      )
        .to.be.revertedWithCustomError(PookyGame, 'InvalidSignature')
        .withArgs();
    });

    it('should revert if user tries to claim rewards with signature from another user', async () => {
      const signature = await signRewardsClaim(player2.address, rewardNAT, rewardPOK, [], ttl, nonce, backend);

      await expect(PookyGame.connect(player1).claimRewards(rewardNAT, rewardPOK, [], ttl, nonce, signature))
        .to.be.revertedWithCustomError(PookyGame, 'InvalidSignature')
        .withArgs();
    });

    it('should revert if reward claim has expired', async () => {
      const expiredTimestamp = currentTimestamp - 100;
      const signature = await signRewardsClaim(
        player1.address,
        rewardNAT,
        rewardPOK,
        ballUpdates,
        expiredTimestamp,
        nonce,
        backend,
      );

      await expect(
        PookyGame.connect(player1).claimRewards(rewardNAT, rewardPOK, ballUpdates, expiredTimestamp, nonce, signature),
      )
        .to.be.revertedWithCustomError(PookyGame, 'ExpiredSignature')
        .withArgs(expiredTimestamp);
    });

    it('should revert if nonce has already been used', async () => {
      const signature = await signRewardsClaim(player1.address, rewardNAT, rewardPOK, ballUpdates, ttl, nonce, backend);

      // First call: success!
      await expect(PookyGame.connect(player1).claimRewards(rewardNAT, rewardPOK, ballUpdates, ttl, nonce, signature)).to
        .not.be.reverted;

      // Second call: reverted because nonce was already used
      await expect(PookyGame.connect(player1).claimRewards(rewardNAT, rewardPOK, ballUpdates, ttl, nonce, signature))
        .to.be.revertedWithCustomError(PookyGame, 'NonceUsed')
        .withArgs();
    });

    it.skip('should revert if native transfer fails', async () => {
      // TODO
    });
  });
});
