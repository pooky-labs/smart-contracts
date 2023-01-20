import { faker } from '@faker-js/faker';
import { loadFixture, setBalance } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import getTestAccounts from '../../lib/testing/getTestAccounts';
import stackFixture from '../../lib/testing/stackFixture';
import parseEther from '../../lib/utils/parseEther';
import { GenesisMinter, Pookyball, WaitList } from '../../typechain-types';
import { TemplateStructOutput } from '../../typechain-types/contracts/mint/GenesisMinter';

describe('GenesisMinter', () => {
  // Signers
  let operator: SignerWithAddress;
  let player1: SignerWithAddress;

  // Contracts
  let GenesisMinter: GenesisMinter;
  let WaitList: WaitList;
  let Pookyball: Pookyball;

  // Internal data
  let templateId: number;
  let template: TemplateStructOutput;

  beforeEach(async () => {
    ({ operator, player1 } = await getTestAccounts());
    ({ GenesisMinter, WaitList, Pookyball } = await loadFixture(stackFixture));

    templateId = faker.datatype.number((await GenesisMinter.nextTemplateId()).toNumber());
    template = await GenesisMinter.templates(templateId);
    await WaitList.connect(operator).setRequiredTier(3);
    await WaitList.connect(operator).setBatch([player1.address], [3]);
  });

  describe('templates', async () => {
    it('should iterate over the available templates', async () => {
      const nextTemplateId = (await GenesisMinter.nextTemplateId()).toNumber();

      for (let i = 0; i < nextTemplateId; i++) {
        const template = await GenesisMinter.templates(i);
        expect(template.supply).gt(0);
      }
    });
  });

  describe('getTemplates', async () => {
    it('should return all the available templates', async () => {
      const templates = await GenesisMinter.getTemplates();
      const nextTemplateId = (await GenesisMinter.nextTemplateId()).toNumber();

      for (let i = 0; i < nextTemplateId; i++) {
        const template = await GenesisMinter.templates(i);
        expect(template).to.deep.eq(templates[i]);
      }
    });
  });

  describe('mint', () => {
    let quantity: number;

    beforeEach(() => {
      quantity = 3 + faker.datatype.number(2);
    });

    it('should revert if sender is not eligible', async () => {
      await WaitList.connect(operator).setBatch([player1.address], [2]);

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
      const value = template.price.mul(quantity);

      // Sometimes, the test fails with the following error:
      // InvalidInputError: sender doesn't have enough funds to send tx.
      // The max upfront cost is: xxxx and the sender's account only has: 10000000000000000000000
      // Setting player1's balance to 1,000,000,000 ETH fixes the problem.
      await setBalance(player1.address, parseEther(1e9));

      await expect(GenesisMinter.connect(player1).mint(templateId, player1.address, quantity, { value }))
        .to.changeTokenBalance(Pookyball, player1.address, quantity)
        .and.to.emit(GenesisMinter, 'Sale')
        .withArgs(player1.address, templateId, quantity, value);
    });
  });

  describe('ineligibilityReason', () => {
    it('should return "not eligible yet" if sender is not eligible', async () => {
      await WaitList.connect(operator).setBatch([player1.address], [2]);
      expect(await GenesisMinter.ineligibilityReason(templateId, player1.address, 1)).to.eq('not eligible yet');
    });

    it('should return "insufficient supply" if mint would exhaust the supply', async () => {
      const quantity = template.supply.toNumber() + 1;
      expect(await GenesisMinter.ineligibilityReason(templateId, player1.address, quantity)).to.eq(
        'insufficient supply',
      );
    });

    it('should return "" mint should be allowed', async () => {
      const quantity = faker.datatype.number(2) + 1;
      expect(await GenesisMinter.ineligibilityReason(templateId, player1.address, quantity)).to.eq('');
    });
  });
});
