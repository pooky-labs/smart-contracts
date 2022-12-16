import { faker } from '@faker-js/faker';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Wallet } from 'ethers';
import getTestAccounts from '../../lib/testing/getTestAccounts';
import stackFixture from '../../lib/testing/stackFixture';
import { WaitList } from '../../typechain-types';

describe('WaitList', () => {
  let owner: SignerWithAddress;
  let player1: SignerWithAddress;
  let player2: SignerWithAddress;
  let player3: SignerWithAddress;

  let WaitList: WaitList;

  beforeEach(async () => {
    ({ deployer: owner, player1, player2, player3 } = await getTestAccounts());
    ({ WaitList } = await loadFixture(stackFixture));
  });

  describe('setRequiredTier', async () => {
    it('should revert if non-owner tries to change the required tier', async () => {
      await expect(WaitList.connect(player1).setRequiredTier(0)).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('should allow owner to change the required tier', async () => {
      const newRequiredTier = faker.datatype.number(5);
      await WaitList.connect(owner).setRequiredTier(newRequiredTier);
      expect(await WaitList.requiredTier()).to.eq(newRequiredTier);
    });
  });

  describe('setBatch', async () => {
    it('should revert if non-owner tries to set the account tiers', async () => {
      await expect(WaitList.connect(player1).setBatch([player1.address], [4])).to.be.revertedWith(
        'Ownable: caller is not the owner',
      );
    });

    it('should revert if accounts and tiers size mismatch', async () => {
      await expect(WaitList.connect(owner).setBatch([player1.address, player2.address], [1, 2, 3]))
        .to.be.revertedWithCustomError(WaitList, 'ArgumentSizeMismatch')
        .withArgs(2, 3);
    });

    it('should allow owner to set the account tiers', async () => {
      const tiers = {
        [player1.address]: faker.datatype.number(5),
        [player2.address]: faker.datatype.number(5),
        [player3.address]: faker.datatype.number(5),
      };

      await expect(WaitList.connect(owner).setBatch(Object.keys(tiers), Object.values(tiers)))
        .to.emit(WaitList, 'TierSet')
        .withArgs(player1.address, tiers[player1.address])
        .and.to.emit(WaitList, 'TierSet')
        .withArgs(player2.address, tiers[player2.address])
        .and.to.emit(WaitList, 'TierSet')
        .withArgs(player3.address, tiers[player3.address]);

      for (const [account, tier] of Object.entries(tiers)) {
        expect(await WaitList.tiers(account)).to.eq(tier);
      }
    });
  });

  describe('isEligible', async () => {
    it('should return true to any address if requiredTier=0', async () => {
      await WaitList.connect(owner).setRequiredTier(0);

      for (let i = 0; i < 10; i++) {
        expect(await WaitList.isEligible(Wallet.createRandom().address)).to.be.true;
      }
    });

    it('should return true if wallet has a sufficient tier', async () => {
      const tiers = {
        [player1.address]: 1,
        [player2.address]: 2,
        [player3.address]: 3,
      };

      await WaitList.connect(owner).setRequiredTier(2);
      await WaitList.connect(owner).setBatch(Object.keys(tiers), Object.values(tiers));

      expect(await WaitList.isEligible(player1.address)).to.be.false;
      expect(await WaitList.isEligible(player2.address)).to.be.true;
      expect(await WaitList.isEligible(player3.address)).to.be.true;
    });
  });
});
