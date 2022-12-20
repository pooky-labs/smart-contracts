import { faker } from '@faker-js/faker';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { randomBytes } from 'crypto';
import { BigNumber, utils } from 'ethers';
import { DEFAULT_ADMIN_ROLE, GAME, MINTER } from '../../lib/roles';
import getTestAccounts from '../../lib/testing/getTestAccounts';
import { expectMissingRole } from '../../lib/testing/roles';
import stackFixture from '../../lib/testing/stackFixture';
import PookyballLuxury from '../../lib/types/PookyballLuxury';
import PookyballRarity from '../../lib/types/PookyballRarity';
import { Pookyball, VRFCoordinatorV2Mock } from '../../typechain-types';

describe('Pookyball', () => {
  // Signers
  let admin: SignerWithAddress;
  let minter: SignerWithAddress;
  let game: SignerWithAddress;
  let player1: SignerWithAddress;
  let player2: SignerWithAddress;

  // Contracts
  let Pookyball: Pookyball;
  let VRFCoordinatorV2: VRFCoordinatorV2Mock;

  // Internal data
  let tokenId: number;

  beforeEach(async () => {
    ({ admin, minter, game, player1, player2 } = await getTestAccounts());
    ({ Pookyball, VRFCoordinatorV2 } = await loadFixture(stackFixture));

    await Pookyball.connect(minter).mint(player1.address, PookyballRarity.COMMON, PookyballLuxury.COMMON);
    tokenId = (await Pookyball.lastTokenId()).toNumber();
  });

  describe('setContractURI', () => {
    it('should revert if non-DEFAULT_ADMIN_ROLE tries to change the contract URI', async () => {
      await expectMissingRole(Pookyball.connect(player1).setContractURI('foobar'), player1, DEFAULT_ADMIN_ROLE);
    });

    it('should allow DEFAULT_ADMIN_ROLE to change the contract URI', async () => {
      const newContractURI = faker.internet.url();
      await Pookyball.connect(admin).setContractURI(newContractURI);
      expect(await Pookyball.contractURI()).to.eq(newContractURI);
    });
  });

  describe('setBaseURI', () => {
    it('should revert if non-DEFAULT_ADMIN_ROLE tries to change the base URI', async () => {
      await expectMissingRole(Pookyball.connect(player1).setBaseURI('foobar'), player1, DEFAULT_ADMIN_ROLE);
    });

    it('should allow DEFAULT_ADMIN_ROLE to change the base URI', async () => {
      const newBaseURI = faker.internet.url();
      await Pookyball.connect(admin).setBaseURI(newBaseURI);
      expect(await Pookyball.baseURI()).to.eq(newBaseURI);
    });
  });

  describe('setTokenURI', () => {
    it('should return a valid token URI', async () => {
      expect(await Pookyball.tokenURI(tokenId)).to.eq(`https://tokens.pooky.gg/${tokenId}`);
    });
  });

  describe('metadata', () => {
    it('should return valid token metadata', async () => {
      const metadata = await Pookyball.metadata(tokenId);
      expect(metadata.rarity).to.eq(PookyballRarity.COMMON);
      expect(metadata.luxury).to.eq(PookyballLuxury.COMMON);
      expect(metadata.level).to.eq(0);
      expect(metadata.pxp).to.eq(0);
    });
  });

  describe('mint', async () => {
    it('should revert if non-MINTER role tries to mint a token', async () => {
      await expectMissingRole(
        Pookyball.connect(player1).mint(player1.address, PookyballRarity.LEGENDARY, PookyballLuxury.ALPHA),
        player1,
        MINTER,
      );
    });

    it('should allow MINTER role to mint a new token', async () => {
      await expect(
        Pookyball.connect(minter).mint(player1.address, PookyballRarity.LEGENDARY, PookyballLuxury.ALPHA),
      ).to.changeTokenBalance(Pookyball, player1, 1);

      const metadata = await Pookyball.metadata(await Pookyball.lastTokenId());
      expect(metadata.rarity).to.eq(PookyballRarity.LEGENDARY);
      expect(metadata.luxury).to.eq(PookyballLuxury.ALPHA);
      expect(metadata.level).to.eq(0);
      expect(metadata.pxp).to.eq(0);
    });
  });

  describe('setLevel', async () => {
    it('should revert if non-GAME tries to change the level of a token', async () => {
      await expectMissingRole(Pookyball.connect(player1).setLevel(tokenId, 10), player1, GAME);
    });

    it('should allow GAME to change the level of a token', async () => {
      const newLevel = faker.datatype.number(10) + 1;
      await expect(Pookyball.connect(game).setLevel(tokenId, newLevel))
        .to.emit(Pookyball, 'LevelChanged')
        .withArgs(tokenId, newLevel);
    });
  });

  describe('setPXP', async () => {
    it('should revert if non-GAME tries to change the PXP of a token', async () => {
      await expectMissingRole(Pookyball.connect(player1).setPXP(tokenId, 10), player1, GAME);
    });

    it('should allow GAME to change the pxp of a token', async () => {
      const newPXP = faker.datatype.number(10) + 1;
      await expect(Pookyball.connect(game).setPXP(tokenId, newPXP))
        .to.emit(Pookyball, 'PXPChanged')
        .withArgs(tokenId, newPXP);
    });
  });

  describe('fulfillRandomWords', () => {
    it('should set the seed of a Pookyball token via the VRFCoordinatorV2 contract', async () => {
      const seed = BigNumber.from(utils.keccak256(randomBytes(32)));
      await expect(VRFCoordinatorV2.fulfillRandomWordsWithOverride(1, Pookyball.address, [seed]))
        .to.emit(Pookyball, 'SeedSet')
        .withArgs(tokenId, seed);
    });
  });

  describe('supportsInterface', () => {
    const interfaces = {
      IERC165: '0x01ffc9a7',
      IERC721: '0x80ac58cd',
      IERC721Metadata: '0x5b5e139f',
      IERC2981: '0x5b5e139f',
    };

    for (const [name, interfaceId] of Object.entries(interfaces)) {
      it(`should support the ${name} interface (${interfaceId})`, async () => {
        expect(await Pookyball.supportsInterface(interfaceId)).to.be.true;
      });
    }
  });

  describe('setApprovalForAll', () => {
    it('should not revert', async () => {
      await expect(Pookyball.connect(player1).setApprovalForAll(player2.address, true)).to.not.be.reverted;
    });
  });

  describe('approve', () => {
    it('should not revert', async () => {
      await expect(Pookyball.connect(player1).approve(player2.address, tokenId)).to.not.be.reverted;
    });
  });

  describe('transferFrom', () => {
    it('should not revert', async () => {
      await expect(
        Pookyball.connect(player1).transferFrom(player1.address, player2.address, tokenId),
      ).to.changeTokenBalances(Pookyball, [player1.address, player2.address], [-1, 1]);
    });
  });

  describe('safeTransferFrom', () => {
    it('should not revert without data', async () => {
      await expect(
        Pookyball.connect(player1)['safeTransferFrom(address,address,uint256)'](
          player1.address,
          player2.address,
          tokenId,
        ),
      ).to.changeTokenBalances(Pookyball, [player1.address, player2.address], [-1, 1]);
    });

    it('should not revert with data', async () => {
      await expect(
        Pookyball.connect(player1)['safeTransferFrom(address,address,uint256,bytes)'](
          player1.address,
          player2.address,
          tokenId,
          utils.arrayify(utils.keccak256(randomBytes(16))),
        ),
      ).to.changeTokenBalances(Pookyball, [player1.address, player2.address], [-1, 1]);
    });
  });
});
