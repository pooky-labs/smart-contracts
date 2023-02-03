import { faker } from '@faker-js/faker';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { randomBytes } from 'crypto';
import { BigNumber, utils, Wallet } from 'ethers';
import range from 'lodash/range';
import { DEFAULT_ADMIN_ROLE, GAME, MINTER } from '../../lib/roles';
import getTestAccounts from '../../lib/testing/getTestAccounts';
import { expectHasRole, expectMissingRole } from '../../lib/testing/roles';
import stackFixture from '../../lib/testing/stackFixture';
import PookyballRarity from '../../lib/types/PookyballRarity';
import parseEther from '../../lib/utils/parseEther';
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

    await Pookyball.connect(minter).mint([player1.address], [PookyballRarity.COMMON]);
    tokenId = (await Pookyball.lastTokenId()).toNumber();
  });

  describe('permissions', () => {
    it('should have granted the DEFAULT_ADMIN_ROLE to the admin account', async () => {
      await expectHasRole(Pookyball, admin, DEFAULT_ADMIN_ROLE);
    });
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

  describe('setERC2981Receiver', () => {
    it('should revert if non-DEFAULT_ADMIN_ROLE tries to change the base URI', async () => {
      await expectMissingRole(
        Pookyball.connect(player1).setERC2981Receiver(Wallet.createRandom().address),
        player1,
        DEFAULT_ADMIN_ROLE,
      );
    });

    it('should allow DEFAULT_ADMIN_ROLE to change the ERC2981 receiver', async () => {
      const newRecipient = Wallet.createRandom().address;
      await Pookyball.connect(admin).setERC2981Receiver(newRecipient);
      const [recipient] = await Pookyball.royaltyInfo(1, parseEther(1));
      expect(recipient).to.eq(newRecipient);
    });
  });

  describe('metadata', () => {
    it('should return valid token metadata', async () => {
      const metadata = await Pookyball.metadata(tokenId);
      expect(metadata.rarity).to.eq(PookyballRarity.COMMON);
      expect(metadata.level).to.eq(0);
      expect(metadata.pxp).to.eq(0);
    });
  });

  describe('mint', async () => {
    it('should revert if non-MINTER role tries to mint a token', async () => {
      await expectMissingRole(
        Pookyball.connect(player1).mint([player1.address], [PookyballRarity.LEGENDARY]),
        player1,
        MINTER,
      );
    });

    it('should revert if argument sizes mismatch', async () => {
      await expect(
        Pookyball.connect(minter).mint([player1.address], [PookyballRarity.COMMON, PookyballRarity.LEGENDARY]),
      )
        .to.be.revertedWithCustomError(Pookyball, 'ArgumentSizeMismatch')
        .withArgs(1, 2);
    });

    it('should allow MINTER role to mint a new token', async () => {
      await expect(
        Pookyball.connect(minter).mint([player1.address], [PookyballRarity.LEGENDARY]),
      ).to.changeTokenBalance(Pookyball, player1, 1);

      const metadata = await Pookyball.metadata(await Pookyball.lastTokenId());
      expect(metadata.rarity).to.eq(PookyballRarity.LEGENDARY);
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

    it('should set the seed of a Pookyball token via the VRFCoordinatorV2 contract', async () => {
      await Pookyball.connect(minter).mint(
        [player1.address, player1.address, player2.address],
        [PookyballRarity.COMMON, PookyballRarity.COMMON, PookyballRarity.COMMON],
      );
      const tokenId = (await Pookyball.lastTokenId()).toNumber();

      const seeds = range(3).map(() => BigNumber.from(utils.keccak256(randomBytes(32))));
      await expect(VRFCoordinatorV2.fulfillRandomWordsWithOverride(2, Pookyball.address, seeds))
        .to.emit(Pookyball, 'SeedSet')
        .withArgs(tokenId, seeds[0])
        .and.to.emit(Pookyball, 'SeedSet')
        .withArgs(tokenId - 1, seeds[1])
        .and.to.emit(Pookyball, 'SeedSet')
        .withArgs(tokenId - 2, seeds[2]);
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
