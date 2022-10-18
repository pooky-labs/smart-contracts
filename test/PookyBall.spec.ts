import { DEFAULT_ADMIN_ROLE, ZERO_ADDRESS } from '../lib/constants';
import parseEther from '../lib/parseEther';
import { POOKY } from '../lib/roles';
import getTestAccounts from '../lib/testing/getTestAccounts';
import nowUNIX from '../lib/testing/nowUNIX';
import { randUint256 } from '../lib/testing/rand';
import { expectHasRole, expectMissingRole } from '../lib/testing/roles';
import stackFixture from '../lib/testing/stackFixture';
import { BallLuxury, BallRarity } from '../lib/types';
import numeric from '../lib/utils/numeric';
import { PookyBall, PookyBallGenesisMinter } from '../typings';
import { faker } from '@faker-js/faker';
import { anyUint } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { BigNumber } from 'ethers';

describe('PookyBall', () => {
  let pooky: SignerWithAddress;
  let player1: SignerWithAddress;
  let player2: SignerWithAddress;
  let PookyBall: PookyBall;
  let PookyBallGenesisMinter: PookyBallGenesisMinter;

  let tokenId: BigNumber;

  beforeEach(async () => {
    ({ pooky, player1, player2 } = await getTestAccounts());
    ({ PookyBall, PookyBallGenesisMinter } = await loadFixture(stackFixture));

    await PookyBall.connect(pooky).mint(player1.address, BallRarity.Common, BallLuxury.Common, 0);
    tokenId = await PookyBall.lastTokenId();
  });

  describe('configuration', () => {
    it('should have roles configured properly', async () => {
      await expectHasRole(PookyBall, PookyBallGenesisMinter, POOKY);
    });
  });

  describe('setContractURI', () => {
    let previousContractURI: string;

    beforeEach(async () => {
      previousContractURI = await PookyBall.contractURI();
    });

    it('should allow DEFAULT_ADMIN_ROLE account to set contract URI', async () => {
      const newURI = faker.internet.url();
      await PookyBall.setContractURI(newURI);
      expect(await PookyBall.contractURI()).to.be.equal(newURI);
    });

    it('should revert if non-DEFAULT_ADMIN_ROLE account tries to set contract URI', async () => {
      await expectMissingRole(
        PookyBall.connect(player1).setContractURI('https:/hacked.com'),
        player1,
        DEFAULT_ADMIN_ROLE,
      );
      expect(await PookyBall.contractURI()).to.be.equal(previousContractURI);
    });
  });

  describe('tokenURI', () => {
    it('should return a valid tokenURI', async () => {
      expect(await PookyBall.tokenURI(tokenId)).to.equals(`https://tokens.pooky.gg/${tokenId}.json`);
    });

    it('should if revert on non-minted tokenId', async () => {
      expect(() => PookyBall.tokenURI(424242)).to.be.revertedWith('ERC721: invalid token ID');
    });
  });

  describe('getBallInfo', () => {
    for (const [rarityName, rarity] of Object.entries(BallRarity).filter(numeric)) {
      for (const [luxuryName, luxury] of Object.entries(BallLuxury).filter(numeric)) {
        it(`should display ${rarityName}/${luxuryName} information`, async () => {
          await PookyBall.connect(pooky).mint(player1.address, rarity, luxury, 0);
          const info = await PookyBall.getBallInfo(await PookyBall.lastTokenId());

          expect(info.rarity).to.equals(rarity);
          expect(info.luxury).to.equals(luxury);
        });
      }
    }
  });

  describe('isRevocable', () => {
    it('should return that a token is not revocable if minted with revocableUntil=0', async () => {
      await PookyBall.connect(pooky).mint(player1.address, BallRarity.Common, BallLuxury.Common, 0);
      const tokenId = await PookyBall.lastTokenId();

      expect(await PookyBall.isRevocable(tokenId)).to.be.false;
    });

    it('should return that a token is revocable if minted with revocableUntil=nowUnix() + 3600', async () => {
      await PookyBall.connect(pooky).mint(player1.address, BallRarity.Common, BallLuxury.Common, nowUNIX() + 3600);
      const tokenId = await PookyBall.lastTokenId();

      expect(await PookyBall.isRevocable(tokenId)).to.be.true;
    });
  });

  describe('setRandomEntropy', () => {
    let entropy: BigNumber;

    beforeEach(async () => {
      entropy = randUint256();
    });

    it('should revert if non-POOKY account tries to set ball entropy', async () => {
      await expectMissingRole(PookyBall.connect(player1).setRandomEntropy(tokenId, entropy), player1, POOKY);
    });

    it('should revert if entropy is set twice', async () => {
      await expect(PookyBall.connect(pooky).setRandomEntropy(tokenId, entropy))
        .to.emit(PookyBall, 'BallRandomEntropySet')
        .withArgs(tokenId, entropy);
      await expect(PookyBall.connect(pooky).setRandomEntropy(tokenId, entropy))
        .to.be.revertedWithCustomError(PookyBall, 'EntropyAlreadySet')
        .withArgs(tokenId);
    });
  });

  describe('changePXP', () => {
    it('should change the PXP of a token successfully', async () => {
      const newPXP = parseEther(faker.datatype.number(100));
      await PookyBall.connect(pooky).changePXP(tokenId, newPXP);
      const info = await PookyBall.getBallInfo(tokenId);
      expect(info.pxp).to.equals(newPXP);
    });

    it('should revert if non-POOKY account tries to add ball pxp', async () => {
      await expectMissingRole(
        PookyBall.connect(player1).changePXP(tokenId, parseEther(faker.datatype.number(100))),
        player1,
        POOKY,
      );
    });

    it('should revert if token does not exist', async () => {
      await expect(
        PookyBall.connect(pooky).changePXP(424242, parseEther(faker.datatype.number(100))),
      ).to.be.revertedWith('ERC721: invalid token ID');
    });
  });

  describe('changeLevel', () => {
    it('should change the level of a token successfully', async () => {
      const newLevel = faker.datatype.number(20);
      await PookyBall.connect(pooky).changeLevel(tokenId, newLevel);
      const info = await PookyBall.getBallInfo(tokenId);
      expect(info.level).to.equals(newLevel);
    });

    it('should revert if non-POOKY role tries to change ball level', async () => {
      await expectMissingRole(
        PookyBall.connect(player1).changeLevel(tokenId, faker.datatype.number(20)),
        player1,
        POOKY,
      );
    });

    it('should revert if token does not exist', async () => {
      await expect(PookyBall.connect(pooky).changeLevel(424242, faker.datatype.number(20))).to.be.revertedWith(
        'ERC721: invalid token ID',
      );
    });
  });

  describe('mint', () => {
    it('should allow POOKY contracts to mint a new token', async () => {
      await expect(
        PookyBall.connect(pooky).mint(player1.address, BallRarity.Common, BallLuxury.Common, 0),
      ).to.changeTokenBalance(PookyBall, player1.address, 1);
    });

    it('should revert if non-POOKY account tries to mint ball with random rarity and random revocable timestamp', async () => {
      await expectMissingRole(
        PookyBall.connect(player1).mint(player1.address, BallRarity.Common, BallLuxury.Common, 0),
        player1,
        POOKY,
      );
    });
  });

  describe('revoke', async () => {
    it('should burn a revocable ball', async () => {
      await PookyBall.connect(pooky).mint(player1.address, BallRarity.Common, BallLuxury.Common, nowUNIX() + 3600);
      const tokenId = await PookyBall.lastTokenId();

      await expect(PookyBall.connect(pooky).revoke(tokenId)).to.changeTokenBalance(PookyBall, player1.address, -1);
    });

    it('should revert if ball is revocation date is over', async () => {
      await PookyBall.connect(pooky).mint(player1.address, BallRarity.Common, BallLuxury.Common, nowUNIX() - 3600);
      const tokenId = await PookyBall.lastTokenId();

      await expect(PookyBall.connect(pooky).revoke(tokenId))
        .to.be.revertedWithCustomError(PookyBall, 'NotRevocableAnymore')
        .withArgs(tokenId, anyUint);
    });
  });

  describe('_beforeTokenTransfer', () => {
    let revocableTokenId: BigNumber;

    beforeEach(async () => {
      await PookyBall.connect(pooky).mint(player1.address, BallRarity.Common, BallLuxury.Common, nowUNIX() + 3600);
      revocableTokenId = await PookyBall.lastTokenId();
    });

    it('should allow player to burn revocable token', async () => {
      expect(PookyBall.connect(player1).transferFrom(player1.address, ZERO_ADDRESS, revocableTokenId))
        .to.changeTokenBalance(PookyBall, player1.address, -1)
        .and.changeTokenBalance(PookyBall, ZERO_ADDRESS, 1);
    });

    it('should revert if token is still revocable', async () => {
      expect(PookyBall.connect(player1).transferFrom(player1.address, player2.address, revocableTokenId))
        .to.be.revertedWithCustomError(PookyBall, 'TransferLockedWhileRevocable')
        .withArgs(tokenId);
    });

    it('should allow POOKY contracts to transfer freely', async () => {
      await PookyBall.connect(pooky).mint(pooky.address, BallRarity.Common, BallLuxury.Common, nowUNIX() + 3600);
      revocableTokenId = await PookyBall.lastTokenId();
      expect(PookyBall.connect(pooky).transferFrom(pooky.address, player1.address, revocableTokenId))
        .to.changeTokenBalance(PookyBall, pooky.address, -1)
        .and.changeTokenBalance(PookyBall, player1.address, 1);
    });
  });

  describe('supportsInterface', () => {
    it('should implements IERC165', async () => {
      expect(await PookyBall.supportsInterface('0x9f40b779')).to.eq(false);
    });
  });
});
