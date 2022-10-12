import { BALL_MAXIMUM_RARITY, DEFAULT_ADMIN_ROLE, HUNDRED } from '../lib/constants';
import getSigners from '../lib/getSigners';
import parseEther from '../lib/parseEther';
import { randInt } from '../lib/rand';
import { POOKY_CONTRACT } from '../lib/roles';
import { expectHasRole, expectMissingRole } from '../lib/testing/roles';
import stackFixture from '../lib/testing/stackFixture';
import { BallRarity } from '../lib/types';
import waitTx from '../lib/waitTx';
import { PookyBall, PookyBallGenesisMinter } from '../typings';
import { faker } from '@faker-js/faker';
import { anyUint } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';

describe('PookyBall', () => {
  let deployer: SignerWithAddress;
  let mod: SignerWithAddress;
  let player: SignerWithAddress;
  let PookyBall: PookyBall;
  let PookyBallGenesisMinter: PookyBallGenesisMinter;

  beforeEach(async () => {
    ({ deployer, mod, player } = await getSigners());
    ({ PookyBall, PookyBallGenesisMinter } = await loadFixture(stackFixture));
  });

  describe('configuration', () => {
    it('should have roles configured properly', async () => {
      await expectHasRole(PookyBall, PookyBallGenesisMinter, POOKY_CONTRACT);
    });
  });

  describe('setContractURI', () => {
    it('should allow DEFAULT_ADMIN_ROLE account to set contract URI', async () => {
      const contractURIBefore = await PookyBall.contractURI();
      const URI = contractURIBefore + 'Some random URI';

      await waitTx(PookyBall.connect(deployer).setContractURI(URI));

      const contractURIAfter = await PookyBall.contractURI();
      expect(contractURIAfter).to.be.equal(URI, 'Contract URI is not set correctly');
    });

    it('should revert if non-DEFAULT_ADMIN_ROLE account tries to set contract URI', async () => {
      await expectMissingRole(PookyBall.connect(player).setContractURI('Some random URI'), player, DEFAULT_ADMIN_ROLE);
    });
  });

  describe('transfer', () => {
    it('should revert if token is still revocable', async () => {
      await waitTx(PookyBall.grantRole(POOKY_CONTRACT, mod.address));
      await waitTx(
        PookyBall.connect(mod).mint(player.address, BallRarity.Common, Math.floor(Date.now() / 1000) + 3600),
      );
      const tokenId = await PookyBall.lastTokenId();

      expect(PookyBall.connect(player).transferFrom(player.address, mod.address, tokenId))
        .to.be.revertedWithCustomError(PookyBall, 'TransferLockedWhileRevocable')
        .withArgs(tokenId);
    });
  });

  describe('setRandomEntropy', () => {
    it('should revert if non-POOKY_CONTRACT account tries to set ball entropy', async () => {
      const randomBallId = randInt(HUNDRED);
      const randomBallEntropy = randInt(HUNDRED);

      await expectMissingRole(
        PookyBall.connect(player).setRandomEntropy(randomBallId, randomBallEntropy),
        player,
        POOKY_CONTRACT,
      );
    });

    it('should revert if entropy is set twice', async () => {
      await waitTx(PookyBall.grantRole(POOKY_CONTRACT, mod.address));
      await waitTx(PookyBall.connect(mod).mint(player.address, BallRarity.Common, 0));
      const tokenId = await PookyBall.lastTokenId();

      await expect(PookyBall.connect(mod).setRandomEntropy(tokenId, 1)).to.not.be.reverted;
      await expect(PookyBall.connect(mod).setRandomEntropy(tokenId, 1))
        .to.be.revertedWithCustomError(PookyBall, 'EntropyAlreadySet')
        .withArgs(tokenId);
    });
  });

  describe('changePXP', () => {
    it('should revert if non-POOKY_CONTRACT account tries to add ball pxp', async () => {
      await expectMissingRole(
        PookyBall.connect(player).changePXP(
          faker.datatype.number(100), // tokenId
          parseEther(faker.datatype.number(100)), // newPXP
        ),
        player,
        POOKY_CONTRACT,
      );
    });
  });

  describe('changeLevel', () => {
    it('should revert if non-POOKY_CONTRACT role tries to change ball level', async () => {
      await expectMissingRole(
        PookyBall.connect(player).changeLevel(
          faker.datatype.number(100), // tokenId
          faker.datatype.number(20), // newLevel
        ),
        player,
        POOKY_CONTRACT,
      );
    });
  });

  describe('mint', () => {
    it('should revert if non-POOKY_CONTRACT account tries to mint ball with random rarity and random revocable timestamp', async () => {
      const randomBallRarity = randInt(BALL_MAXIMUM_RARITY);
      const randomRevocableTimestamp = randInt(HUNDRED);

      await expectMissingRole(
        PookyBall.connect(player).mint(player.address, randomBallRarity, randomRevocableTimestamp),
        player,
        POOKY_CONTRACT,
      );
    });
  });

  describe('revoke', async () => {
    it('should revert if ball is revocation date is over', async () => {
      await waitTx(PookyBall.grantRole(POOKY_CONTRACT, mod.address));
      await waitTx(PookyBall.connect(mod).mint(player.address, BallRarity.Common, 0));
      const tokenId = await PookyBall.lastTokenId();

      await expect(PookyBall.connect(mod).revoke(tokenId))
        .to.be.revertedWithCustomError(PookyBall, 'NotRevocableAnymore')
        .withArgs(tokenId, anyUint);
    });
  });

  describe('supportsInterface', () => {
    it('should implements IERC165', async () => {
      expect(await PookyBall.supportsInterface('0x9f40b779')).to.eq(false);
    });
  });
});
