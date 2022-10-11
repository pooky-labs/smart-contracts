import { DEFAULT_ADMIN_ROLE, HUNDRED } from '../lib/constants';
import getSigners from '../lib/getSigners';
import { randInt } from '../lib/rand';
import { POOKY_CONTRACT } from '../lib/roles';
import { expectHasRole, expectMissingRole } from '../lib/testing/roles';
import stackFixture from '../lib/testing/stackFixture';
import waitTx from '../lib/waitTx';
import { POK, PookyGame, PookyBallGenesisMinter } from '../typings';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('POK', async () => {
  let deployer: SignerWithAddress;
  let player: SignerWithAddress;
  let mod: SignerWithAddress;

  let POK: POK;
  let PookyGame: PookyGame;
  let PookyBallGenesisMinter: PookyBallGenesisMinter;

  beforeEach(async () => {
    ({ deployer, player, mod } = await getSigners());
    ({ POK, PookyBallGenesisMinter, PookyGame } = await loadFixture(stackFixture));

    // In this specific test, the mod account is allowed to mint POK
    await waitTx(POK.grantRole(POOKY_CONTRACT, mod.address));
  });

  describe('configuration', () => {
    it('should have roles configured', async () => {
      await expectHasRole(POK, PookyBallGenesisMinter, POOKY_CONTRACT);
      await expectHasRole(POK, PookyGame, POOKY_CONTRACT);
    });
  });

  describe('mint', () => {
    it('should allow POOKY_CONTRACT to mint POK freely', async () => {
      const amount = ethers.utils.parseEther('30');
      expect(() => POK.connect(mod).mint(player.address, amount)).to.changeTokenBalance(POK, player, amount);
    });

    it('should revert if non-POOKY_CONTRACT account tries to mint random amount of POK tokens', async () => {
      const randomAmount = randInt(HUNDRED);
      await expectMissingRole(POK.connect(player).mint(player.address, randomAmount), player, POOKY_CONTRACT);
    });

    it('should revert if non-DEFAULT_ADMIN_ROLE account tries to enable/disable POK token transfer', async () => {
      await expectMissingRole(POK.connect(player).setTransferEnabled(true), player, DEFAULT_ADMIN_ROLE);
      await expectMissingRole(POK.connect(player).setTransferEnabled(false), player, DEFAULT_ADMIN_ROLE);
    });
  });

  describe('setTransferEnabled', () => {
    it('should allow DEFAULT_ADMIN_ROLE account to enable transfer', async () => {
      await waitTx(POK.connect(deployer).setTransferEnabled(true));
      expect(await POK.transferEnabled()).to.be.equal(true, 'Transfer is not enabled');
    });
  });

  describe('transfer', () => {
    it('should allow users transfer POK after transfer have been enabled', async () => {
      // 1. Enable transfers
      await waitTx(POK.connect(deployer).setTransferEnabled(true));

      // 2. Mint 30 POK to player
      await waitTx(POK.connect(mod).mint(player.address, ethers.utils.parseEther('30')));

      // 3. Attempt to transfer 1 POK to mod
      const amount = ethers.utils.parseEther('1');
      expect(() => POK.connect(player).transfer(mod.address, amount)).to.changeTokenBalance(POK, mod.address, amount);
    });

    it('should revert if POK is soul-bounded', async () => {
      // 1. Mint 30 POK to player
      await waitTx(POK.connect(mod).mint(player.address, ethers.utils.parseEther('30')));
      await expect(POK.connect(player).transfer(player.address, ethers.utils.parseEther('1'))).to.be.revertedWith('11');
    });
  });
});
