import getTestAccounts from '../../lib/testing/getTestAccounts';
import stackFixture from '../../lib/testing/stackFixture';
import { GenesisMinter, Pookyball, WaitList } from '../../types';
import { TemplateStructOutput } from '../../types/contracts/mint/GenesisMinter';
import { faker } from '@faker-js/faker';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';

describe('GenesisMinter', () => {
  let owner: SignerWithAddress;
  let player1: SignerWithAddress;

  let GenesisMinter: GenesisMinter;
  let WaitList: WaitList;
  let Pookyball: Pookyball;

  let templateId: number;
  let template: TemplateStructOutput;

  beforeEach(async () => {
    ({ deployer: owner, player1 } = await getTestAccounts());
    ({ GenesisMinter, WaitList, Pookyball } = await loadFixture(stackFixture));

    templateId = faker.datatype.number({ min: 1, max: (await GenesisMinter.lastTemplateId()).toNumber() });
    template = await GenesisMinter.templates(templateId);
    await WaitList.connect(owner).setRequiredTier(3);
    await WaitList.connect(owner).setBatch([player1.address], [3]);
  });

  describe('templates', async () => {
    it('should iterate over the available templates', async () => {
      const lastTemplateId = (await GenesisMinter.lastTemplateId()).toNumber();

      for (let i = 1; i <= lastTemplateId; i++) {
        const template = await GenesisMinter.templates(i);
        expect(template.supply).gt(0);
      }
    });
  });

  describe('mint', () => {
    it('should revert if sender is not eligible', async () => {
      await WaitList.connect(owner).setBatch([player1.address], [2]);

      await expect(GenesisMinter.connect(player1).mint(templateId, player1.address, 1, { value: template.price }))
        .to.be.revertedWithCustomError(GenesisMinter, 'Ineligible')
        .withArgs(player1.address);
    });

    it('should revert if mint would exhaust the supply', async () => {
      // Attempt to mint all the supply + 1
      const supply = template.supply.toNumber();
      const quantity = supply + 1;

      await expect(
        GenesisMinter.connect(player1).mint(templateId, player1.address, quantity, {
          value: template.price.mul(quantity),
        }),
      )
        .to.be.revertedWithCustomError(GenesisMinter, 'InsufficientSupply')
        .withArgs(templateId, supply);
    });

    it('should revert not enough value is sent to cover the mint cost', async () => {
      const quantity = faker.datatype.number(5) + 2;
      const value = template.price.mul(quantity - 2);

      await expect(GenesisMinter.connect(player1).mint(templateId, player1.address, quantity, { value }))
        .to.be.revertedWithCustomError(GenesisMinter, 'InsufficientValue')
        .withArgs(template.price.mul(quantity), value);
    });

    it('should allow account to mint multiple Pookyball tokens', async () => {
      const quantity = faker.datatype.number(3) + 2;
      const value = template.price.mul(quantity);

      await expect(GenesisMinter.connect(player1).mint(templateId, player1.address, quantity, { value }))
        .to.changeTokenBalance(Pookyball, player1.address, quantity)
        .and.to.emit(GenesisMinter, 'Sale')
        .withArgs(player1.address, templateId, quantity, value);
    });
  });

  describe('ineligibilityReason', () => {
    it('should return "not eligible yet" if sender is not eligible', async () => {
      await WaitList.connect(owner).setBatch([player1.address], [2]);
      expect(await GenesisMinter.ineligibilityReason(templateId, player1.address, 1)).to.eq('not eligible yet');
    });

    it('should return "insufficient supply" if mint would exhaust the supply', async () => {
      const quantity = template.supply.toNumber() + 1;
      expect(await GenesisMinter.ineligibilityReason(templateId, player1.address, quantity)).to.eq(
        'insufficient supply',
      );
    });

    it('should return "" mint should be allowed', async () => {
      const quantity = faker.datatype.number(5) + 1;
      expect(await GenesisMinter.ineligibilityReason(templateId, player1.address, quantity)).to.eq('');
    });
  });
});
