import { faker } from '@faker-js/faker';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { parseEther } from 'ethers';
import { BURNER, DEFAULT_ADMIN_ROLE, MINTER } from '../../lib/roles';
import connect from '../../lib/testing/connect';
import getTestAccounts from '../../lib/testing/getTestAccounts';
import { expectHasRole } from '../../lib/testing/roles';
import stackFixture from '../../lib/testing/stackFixture';
import { Level, POK, Pressure, Rewards } from '../../typechain-types';

describe('POK', () => {
  // Signers
  let admin: SignerWithAddress;
  let minter: SignerWithAddress;
  let player1: SignerWithAddress;
  let player2: SignerWithAddress;

  // Contracts
  let POK: POK;
  let Level: Level;
  let Pressure: Pressure;
  let Rewards: Rewards;

  beforeEach(async () => {
    ({ admin, minter, player1, player2 } = await getTestAccounts());
    ({ Level, POK, Pressure, Rewards } = await loadFixture(stackFixture));
  });

  describe('permissions', () => {
    it('should have granted the DEFAULT_ADMIN_ROLE to the admin account', async () => {
      await expectHasRole(POK, admin, DEFAULT_ADMIN_ROLE);
    });

    it('should have granted the MINTER role to the Rewards contract', async () => {
      await expectHasRole(POK, Rewards, MINTER);
    });

    it('should have granted the MINTER role to the Level contract', async () => {
      await expectHasRole(POK, Level, BURNER);
    });

    it('should have granted the MINTER role to the Pressure contract', async () => {
      await expectHasRole(POK, Pressure, BURNER);
    });
  });

  describe('_beforeTokenTransfer', async () => {
    it('should revert if a player attempts to transfer tokens', async () => {
      const amount = parseEther(faker.datatype.number({ min: 100, max: 150 }).toString());
      await expect(connect(POK, minter).mint(player1.address, amount)).to.changeTokenBalance(
        POK,
        player1.address,
        amount,
      );
      await expect(connect(POK, player1).transfer(player2.address, amount / 10n))
        .to.be.revertedWithCustomError(POK, 'Soulbounded')
        .withArgs();
    });
  });
});
