import { DEFAULT_ADMIN_ROLE, POOKY_CONTRACT } from '../lib/roles';
import getTestAccounts from '../lib/testing/getTestAccounts';
import { expectHasRole, expectMissingRole } from '../lib/testing/roles';
import stackFixture from '../lib/testing/stackFixture';
import parseEther from '../lib/utils/parseEther';
import { POK, PookyballGenesisMinter, PookyGame } from '../typings';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';

describe('POK', async () => {
  let pooky: SignerWithAddress;
  let player1: SignerWithAddress;
  let player2: SignerWithAddress;

  let POK: POK;
  let PookyGame: PookyGame;
  let PookyballGenesisMinter: PookyballGenesisMinter;

  beforeEach(async () => {
    ({ pooky, player1, player2 } = await getTestAccounts());
    ({ POK, PookyballGenesisMinter, PookyGame } = await loadFixture(stackFixture));
  });

  describe('configuration', () => {
    it('should have roles configured', async () => {
      await expectHasRole(POK, PookyballGenesisMinter, POOKY_CONTRACT);
      await expectHasRole(POK, PookyGame, POOKY_CONTRACT);
    });
  });

  describe('mint', () => {
    it('should allow POOKY_CONTRACT to mint POK freely', async () => {
      const amount = parseEther(30);
      expect(() => POK.connect(pooky).mint(player1.address, amount)).to.changeTokenBalance(POK, player1, amount);
    });

    it('should revert if non-POOKY_CONTRACT account tries to mint random amount of POK tokens', async () => {
      await expectMissingRole(POK.connect(player1).mint(player1.address, parseEther(10)), player1, POOKY_CONTRACT);
    });
  });

  describe('burn', () => {
    it('should allow POOKY_CONTRACT to burn POK freely', async () => {
      await POK.connect(pooky).mint(player1.address, parseEther(30));
      expect(() => POK.connect(pooky).burn(player1.address, parseEther(20))).to.changeTokenBalance(
        POK,
        player1,
        `-${parseEther(10).toString()}`,
      );
    });

    it('should revert if non-POOKY_CONTRACT account tries to burn random amount of POK tokens', async () => {
      await expectMissingRole(POK.connect(player1).burn(parseEther(10)), player1, POOKY_CONTRACT);
    });
  });

  describe('setTransferEnabled', () => {
    it('should allow DEFAULT_ADMIN_ROLE account to enable transfer', async () => {
      await expect(POK.setTransferEnabled(true)).to.emit(POK, 'SetTransferEnabled').withArgs(true);
      expect(await POK.transferEnabled()).to.be.equal(true);
    });

    it('should revert if non-DEFAULT_ADMIN_ROLE account tries to enable/disable POK token transfer', async () => {
      await expectMissingRole(POK.connect(player1).setTransferEnabled(true), player1, DEFAULT_ADMIN_ROLE);
      await expectMissingRole(POK.connect(player1).setTransferEnabled(false), player1, DEFAULT_ADMIN_ROLE);
    });
  });

  describe('transfer', () => {
    it('should allow users transfer POK after transfer have been enabled', async () => {
      // 1. Enable transfers
      await POK.setTransferEnabled(true);

      // 2. Mint 30 POK to player
      await POK.connect(pooky).mint(player1.address, parseEther(30));

      // 3. Attempt to transfer 1 POK to mod
      const amount = parseEther(1);
      expect(() => POK.connect(player1).transfer(player2.address, amount)).to.changeTokenBalance(
        POK,
        player2.address,
        amount,
      );
    });

    it('should allow transfers from POOKY_CONTRACT contracts', async () => {
      // 1. Mint 30 POK to pooky
      await POK.connect(pooky).mint(pooky.address, parseEther(30));

      // 2. Transfer 1 POK to player1
      const amount = parseEther(1).toString();
      await expect(POK.connect(pooky).transfer(player1.address, amount)).to.changeTokenBalances(
        POK,
        [pooky, player1],
        [`-${amount}`, amount],
      );
    });

    it('should allow transfers to POOKY_CONTRACT contracts', async () => {
      // 1. Mint 30 POK to pooky
      await POK.connect(pooky).mint(player1.address, parseEther(30));

      // 2. Transfer 1 POK to player1
      const amount = parseEther(1).toString();
      await expect(POK.connect(player1).transfer(pooky.address, amount)).to.changeTokenBalances(
        POK,
        [player1, pooky],
        [`-${amount}`, amount],
      );
    });

    it('should revert if POK is soul-bounded', async () => {
      // 1. Mint 30 POK to player
      await POK.connect(pooky).mint(player1.address, parseEther(30));

      // 2. Attempt to transfer 1 POK to mod
      await expect(POK.connect(player1).transfer(player2.address, parseEther(1)))
        .to.be.revertedWithCustomError(POK, 'TransfersDisabled')
        .withArgs();
    });
  });
});
