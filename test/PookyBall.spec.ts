import parseEther from '../lib/parseEther';
import { DEFAULT_ADMIN_ROLE, POOKY_CONTRACT } from '../lib/roles';
import getTestAccounts from '../lib/testing/getTestAccounts';
import { randUint256 } from '../lib/testing/rand';
import { expectHasRole, expectMissingRole } from '../lib/testing/roles';
import stackFixture from '../lib/testing/stackFixture';
import { BallLuxury, BallRarity } from '../lib/types';
import numeric from '../lib/utils/numeric';
import { Pookyball, PookyballGenesisMinter } from '../typings';
import { faker } from '@faker-js/faker';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { BigNumber } from 'ethers';

describe('Pookyball', () => {
  let pooky: SignerWithAddress;
  let player1: SignerWithAddress;

  let Pookyball: Pookyball;
  let PookyballGenesisMinter: PookyballGenesisMinter;

  let tokenId: BigNumber;

  beforeEach(async () => {
    ({ pooky, player1 } = await getTestAccounts());
    ({ Pookyball, PookyballGenesisMinter } = await loadFixture(stackFixture));

    await Pookyball.connect(pooky).mint(player1.address, BallRarity.Common, BallLuxury.Common);
    tokenId = await Pookyball.lastTokenId();
  });

  describe('configuration', () => {
    it('should have roles configured properly', async () => {
      await expectHasRole(Pookyball, PookyballGenesisMinter, POOKY_CONTRACT);
    });
  });

  describe('setContractURI', () => {
    let previousContractURI: string;

    beforeEach(async () => {
      previousContractURI = await Pookyball.contractURI();
    });

    it('should allow DEFAULT_ADMIN_ROLE account to set contract URI', async () => {
      const newURI = faker.internet.url();
      await Pookyball.setContractURI(newURI);
      expect(await Pookyball.contractURI()).to.be.equal(newURI);
    });

    it('should revert if non-DEFAULT_ADMIN_ROLE account tries to set contract URI', async () => {
      await expectMissingRole(
        Pookyball.connect(player1).setContractURI('https:/hacked.com'),
        player1,
        DEFAULT_ADMIN_ROLE,
      );
      expect(await Pookyball.contractURI()).to.be.equal(previousContractURI);
    });
  });

  describe('tokenURI', () => {
    it('should return a valid tokenURI', async () => {
      expect(await Pookyball.tokenURI(tokenId)).to.equals(`https://tokens.pooky.gg/${tokenId}.json`);
    });

    it('should if revert on non-minted tokenId', async () => {
      expect(() => Pookyball.tokenURI(424242)).to.be.revertedWith('ERC721: invalid token ID');
    });
  });

  describe('getBallInfo', () => {
    for (const [rarityName, rarity] of Object.entries(BallRarity).filter(numeric)) {
      for (const [luxuryName, luxury] of Object.entries(BallLuxury).filter(numeric)) {
        it(`should display ${rarityName}/${luxuryName} information`, async () => {
          await Pookyball.connect(pooky).mint(player1.address, rarity, luxury);
          const info = await Pookyball.getBallInfo(await Pookyball.lastTokenId());

          expect(info.rarity).to.equals(rarity);
          expect(info.luxury).to.equals(luxury);
        });
      }
    }
  });

  describe('setRandomEntropy', () => {
    let entropy: BigNumber;

    beforeEach(async () => {
      entropy = randUint256();
    });

    it('should revert if non-POOKY_CONTRACT account tries to set ball entropy', async () => {
      await expectMissingRole(Pookyball.connect(player1).setRandomEntropy(tokenId, entropy), player1, POOKY_CONTRACT);
    });

    it('should revert if entropy is set twice', async () => {
      await expect(Pookyball.connect(pooky).setRandomEntropy(tokenId, entropy))
        .to.emit(Pookyball, 'BallRandomEntropySet')
        .withArgs(tokenId, entropy);
      await expect(Pookyball.connect(pooky).setRandomEntropy(tokenId, entropy))
        .to.be.revertedWithCustomError(Pookyball, 'EntropyAlreadySet')
        .withArgs(tokenId);
    });
  });

  describe('changePXP', () => {
    it('should change the PXP of a token successfully', async () => {
      const newPXP = parseEther(faker.datatype.number(100));
      await Pookyball.connect(pooky).changePXP(tokenId, newPXP);
      const info = await Pookyball.getBallInfo(tokenId);
      expect(info.pxp).to.equals(newPXP);
    });

    it('should revert if non-POOKY_CONTRACT account tries to add ball pxp', async () => {
      await expectMissingRole(
        Pookyball.connect(player1).changePXP(tokenId, parseEther(faker.datatype.number(100))),
        player1,
        POOKY_CONTRACT,
      );
    });

    it('should revert if token does not exist', async () => {
      await expect(
        Pookyball.connect(pooky).changePXP(424242, parseEther(faker.datatype.number(100))),
      ).to.be.revertedWith('ERC721: invalid token ID');
    });
  });

  describe('changeLevel', () => {
    it('should change the level of a token successfully', async () => {
      const newLevel = faker.datatype.number(20);
      await Pookyball.connect(pooky).changeLevel(tokenId, newLevel);
      const info = await Pookyball.getBallInfo(tokenId);
      expect(info.level).to.equals(newLevel);
    });

    it('should revert if non-POOKY_CONTRACT role tries to change ball level', async () => {
      await expectMissingRole(
        Pookyball.connect(player1).changeLevel(tokenId, faker.datatype.number(20)),
        player1,
        POOKY_CONTRACT,
      );
    });

    it('should revert if token does not exist', async () => {
      await expect(Pookyball.connect(pooky).changeLevel(424242, faker.datatype.number(20))).to.be.revertedWith(
        'ERC721: invalid token ID',
      );
    });
  });

  describe('mint', () => {
    it('should allow POOKY_CONTRACT contracts to mint a new token', async () => {
      await expect(
        Pookyball.connect(pooky).mint(player1.address, BallRarity.Common, BallLuxury.Common),
      ).to.changeTokenBalance(Pookyball, player1.address, 1);
    });

    it('should revert if non-POOKY_CONTRACT account tries to mint a new token', async () => {
      await expectMissingRole(
        Pookyball.connect(player1).mint(player1.address, BallRarity.Common, BallLuxury.Common),
        player1,
        POOKY_CONTRACT,
      );
    });
  });

  describe('supportsInterface', () => {
    it('should implements IERC165', async () => {
      expect(await Pookyball.supportsInterface('0x9f40b779')).to.eq(false);
    });
  });
});
