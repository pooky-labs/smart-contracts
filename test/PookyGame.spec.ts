import { HUNDRED, MAX_UINT, MAXIMUM_UNCOMMON_BALL_LEVEL, ONE } from '../lib/constants';
import { deployContracts } from '../lib/deployContracts';
import getSigners from '../lib/getSigners';
import { signMatchweek } from '../lib/helpers/signMatchweek';
import { randInt, randUint256 } from '../lib/rand';
import { POOKY_CONTRACT } from '../lib/roles';
import { BallRarity } from '../lib/types';
import waitTx from '../lib/waitTx';
import { POK, PookyBall, PookyGame } from '../typings';
import { BallUpdatesStruct } from '../typings/contracts/PookyGame';
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
    ({ PookyGame, PookyBall, POK } = await deployContracts({ log: false, writeInDB: false }));
  });

  describe('configuration', () => {
    it('should have addresses properly configured', async () => {
      expect(await PookyGame.pookyBall()).to.be.equal(
        PookyBall.address,
        'PookyBall contract address is not set correctly inside PookyGame contract',
      );
      expect(await PookyGame.pookySigner()).to.be.equal(
        backendSigner.address,
        'Backend signer is not set correctly inside PookyGame contract',
      );
      expect(await PookyGame.pookToken()).to.be.equal(
        POK.address,
        'POK token address is not set correctly inside PookyGame contract',
      );
    });
  });

  describe('matchweekClaim', () => {
    let nonce: BigNumber;
    let currentTimestamp: number;
    let amount: BigNumber;
    let ttl: number;

    let ballId: BigNumber;
    let ballLevel: number;
    let pxpNeededToLevelUp: BigNumber;
    let ballUpdates: BallUpdatesStruct[];

    beforeEach(async () => {
      nonce = randUint256();
      ({ timestamp: currentTimestamp } = await ethers.provider.getBlock('latest'));
      amount = ethers.utils.parseEther(randInt(HUNDRED).toString());
      ttl = currentTimestamp + randInt(HUNDRED);

      await waitTx(PookyBall.grantRole(POOKY_CONTRACT, mod.address));
      await waitTx(PookyBall.connect(mod).mintWithRarity(player.address, BallRarity.Uncommon));

      ballId = await PookyBall.lastBallId();
      ballLevel = (await PookyBall.getBallLevel(ballId)).toNumber();
      pxpNeededToLevelUp = await PookyGame.levelPxpNeeded(ballLevel + ONE);
      ballUpdates = [
        {
          ballId,
          addPxp: pxpNeededToLevelUp.add(ONE),
          toLevelUp: true,
        },
      ];

      await waitTx(POK.connect(player).approve(PookyGame.address, MAX_UINT));
    });

    it('should allow players to claim POK', async () => {
      const signature = await signMatchweek(amount, [], ttl, nonce, backendSigner);

      await expect(PookyGame.connect(player).matchweekClaim(amount, [], ttl, nonce, signature)).to.changeTokenBalance(
        POK,
        player,
        amount,
      );
    });

    it('should allow players to claim POK and add PXP to an existing ball', async () => {
      const signature = await signMatchweek(amount, ballUpdates, ttl, nonce, backendSigner);

      await expect(PookyGame.connect(player).matchweekClaim(amount, ballUpdates, ttl, nonce, signature)).to.not.be
        .reverted;
      const newBallLevel = await PookyBall.getBallLevel(ballId);
      expect(newBallLevel).to.be.equal(ballLevel + ONE);
    });

    it('should revert if nonce has already been used', async () => {
      const signature = await signMatchweek(amount, ballUpdates, ttl, nonce, backendSigner);

      // First call: success!
      await expect(PookyGame.connect(player).matchweekClaim(amount, ballUpdates, ttl, nonce, signature)).to.not.be
        .reverted;

      // Second call: reverted because nonce was already used
      await expect(
        PookyGame.connect(player).matchweekClaim(amount, ballUpdates, ttl, nonce, signature),
      ).to.be.revertedWith('10');
    });

    it('should revert if user tries to claim rewards with an invalid signature', async () => {
      const signature = await signMatchweek(amount, ballUpdates, ttl, nonce, backendSigner);

      await expect(
        PookyGame.connect(player).matchweekClaim(
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
      const signature = await signMatchweek(amount, ballUpdates, expiredTimestamp, nonce, backendSigner);

      await expect(
        PookyGame.connect(player).matchweekClaim(amount, ballUpdates, expiredTimestamp, nonce, signature),
      ).to.be.revertedWith('9');
    });

    it('should revert if sender is not a PookyBall owner', async () => {
      const signature = await signMatchweek(amount, ballUpdates, ttl, nonce, backendSigner);

      // deployer is not owner of the ball
      await expect(
        PookyGame.connect(deployer).matchweekClaim(amount, ballUpdates, ttl, nonce, signature),
      ).to.be.revertedWith('5');
    });

    it('should revert if player does not own enough PXP to level up', async () => {
      const ballUpdate = {
        ballId: BigNumber.from(ONE),
        addPxp: pxpNeededToLevelUp.sub(ONE), // not enough PXP!
        toLevelUp: true,
      };

      const signature = await signMatchweek(amount, [ballUpdate], BigNumber.from(ttl), nonce, backendSigner);

      await expect(
        PookyGame.connect(player).matchweekClaim(amount, [ballUpdate], ttl, nonce, signature),
      ).to.be.revertedWith('6');
    });

    it('should revert if ball has reach the maximum level', async () => {
      await waitTx(POK.grantRole(POOKY_CONTRACT, mod.address));
      await waitTx(PookyBall.grantRole(POOKY_CONTRACT, mod.address));

      await waitTx(PookyBall.connect(mod).changeBallLevel(ballId, MAXIMUM_UNCOMMON_BALL_LEVEL));
      expect(await PookyBall.getBallLevel(ballId)).to.equal(MAXIMUM_UNCOMMON_BALL_LEVEL);
      const deltaPXP = await PookyGame.levelPxpNeeded(MAXIMUM_UNCOMMON_BALL_LEVEL + 1);

      const ballUpdate = {
        ballId: BigNumber.from(ONE),
        addPxp: pxpNeededToLevelUp.sub(ONE),
        toLevelUp: true,
      };
      await waitTx(POK.connect(mod).mint(player.address, deltaPXP));

      const signature = await signMatchweek(amount, [ballUpdate], BigNumber.from(ttl), nonce, backendSigner);
      await expect(
        PookyGame.connect(player).matchweekClaim(amount, [ballUpdate], ttl, nonce, signature),
      ).to.be.revertedWith('6');
    });
  });
});
