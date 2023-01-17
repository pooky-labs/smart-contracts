import { faker } from '@faker-js/faker';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { BURNER, DEFAULT_ADMIN_ROLE, MINTER } from '../../lib/roles';
import getTestAccounts from '../../lib/testing/getTestAccounts';
import { expectHasRole } from '../../lib/testing/roles';
import stackFixture from '../../lib/testing/stackFixture';
import parseEther from '../../lib/utils/parseEther';
import { Energy, Level, POK, Pressure, Rewards } from '../../typechain-types';

describe('POK', () => {
  // Signers
  let admin: SignerWithAddress;
  let minter: SignerWithAddress;
  let player1: SignerWithAddress;
  let player2: SignerWithAddress;

  // Contracts
  let POK: POK;
  let Energy: Energy;
  let Level: Level;
  let Pressure: Pressure;
  let Rewards: Rewards;

  beforeEach(async () => {
    ({ admin, minter, player1, player2 } = await getTestAccounts());
    ({ Energy, Level, POK, Pressure, Rewards } = await loadFixture(stackFixture));
  });

  describe('permissions', () => {
    it('should have granted the DEFAULT_ADMIN_ROLE to the admin account', async () => {
      await expectHasRole(POK, admin, DEFAULT_ADMIN_ROLE);
    });

    it('should have granted the MINTER role to the Rewards contract', async () => {
      await expectHasRole(POK, Rewards, MINTER);
    });

    it('should have granted the MINTER role to the Energy contract', async () => {
      await expectHasRole(POK, Energy, BURNER);
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
