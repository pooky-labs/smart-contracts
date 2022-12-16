import getTestAccounts from '../../lib/testing/getTestAccounts';
import stackFixture from '../../lib/testing/stackFixture';
import parseEther from '../../lib/utils/parseEther';
import { POK } from '../../types';
import { faker } from '@faker-js/faker';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { describe } from 'mocha';

describe('POK', () => {
  let minter: SignerWithAddress;
  let player1: SignerWithAddress;
  let player2: SignerWithAddress;

  let POK: POK;

  beforeEach(async () => {
    ({ minter, player1, player2 } = await getTestAccounts());
    ({ POK } = await loadFixture(stackFixture));
  });

  describe('_beforeTokenTransfer', async () => {
    it('should revert if a player attempts to transfer tokens', async () => {
      const amount = parseEther(faker.datatype.number(100) + 50);
      await expect(POK.connect(minter).mint(player1.address, amount)).to.changeTokenBalance(
        POK,
        player1.address,
        amount,
      );
      await expect(POK.connect(player1).transfer(player2.address, amount.div(10)))
        .to.be.revertedWithCustomError(POK, 'Soulbounded')
        .withArgs();
    });
  });
});
