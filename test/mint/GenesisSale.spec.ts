import { faker } from '@faker-js/faker';
import { loadFixture, setBalance } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import getTestAccounts from '../../lib/testing/getTestAccounts';
import stackFixture from '../../lib/testing/stackFixture';
import parseEther from '../../lib/utils/parseEther';
import { GenesisSale, Pookyball, WaitList } from '../../typechain-types';
import { TemplateStructOutput } from '../../typechain-types/contracts/mint/GenesisSale';

describe('GenesisSale', () => {
  // Signers
  let operator: SignerWithAddress;
  let player1: SignerWithAddress;

  // Contracts
  let GenesisSale: GenesisSale;
  let WaitList: WaitList;
  let Pookyball: Pookyball;

  // Internal data
  let templateId: number;
  let template: TemplateStructOutput;

  beforeEach(async () => {
    ({ operator, player1 } = await getTestAccounts());
    ({ GenesisSale, WaitList, Pookyball } = await loadFixture(stackFixture));

    const nextTemplateId = (await GenesisSale.nextTemplateId()).toNumber();
    templateId = faker.datatype.number(nextTemplateId - 1);
    template = await GenesisSale.templates(templateId);
    await WaitList.connect(operator).setRequiredTier(3);
    await WaitList.connect(operator).setBatch([player1.address], [3]);
  });

  describe('templates', async () => {
    it('should iterate over the available templates', async () => {
      const nextTemplateId = (await GenesisSale.nextTemplateId()).toNumber();

      for (let i = 0; i < nextTemplateId; i++) {
        const template = await GenesisSale.templates(i);
        expect(template.supply).gt(0);
      }
    });
  });

  describe('getTemplates', async () => {
    it('should return all the available templates', async () => {
      const templates = await GenesisSale.getTemplates();
      const nextTemplateId = (await GenesisSale.nextTemplateId()).toNumber();

      for (let i = 0; i < nextTemplateId; i++) {
        const template = await GenesisSale.templates(i);
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

      await expect(GenesisSale.connect(player1).mint(templateId, player1.address, 1, { value: template.price }))
        .to.be.revertedWithCustomError(GenesisSale, 'Ineligible')
        .withArgs(player1.address);
    });

    it('should revert if mint would exhaust the supply', async () => {
      // Attempt to mint all the supply + 1
      const supply = template.supply.toNumber();
      const quantity = supply + 1;

      await expect(
        GenesisSale.connect(player1).mint(templateId, player1.address, quantity, {
          value: template.price.mul(quantity),
        }),
      )
        .to.be.revertedWithCustomError(GenesisSale, 'InsufficientSupply')
        .withArgs(templateId, supply);
    });

    it('should revert not enough value is sent to cover the mint cost', async () => {
      const quantity = faker.datatype.number(5) + 2;
      const value = template.price.mul(quantity - 1);

      await expect(GenesisSale.connect(player1).mint(templateId, player1.address, quantity, { value }))
        .to.be.revertedWithCustomError(GenesisSale, 'InsufficientValue')
        .withArgs(template.price.mul(quantity), value);
    });

    it('should allow account to mint multiple Pookyball tokens', async () => {
      const value = template.price.mul(quantity);

      // Sometimes, the test fails with the following error:
      // InvalidInputError: sender doesn't have enough funds to send tx.
      // The max upfront cost is: xxxx and the sender's account only has: 10000000000000000000000
      // Setting player1's balance to 1,000,000,000 ETH fixes the problem.
      await setBalance(player1.address, parseEther(1e9));

      await expect(GenesisSale.connect(player1).mint(templateId, player1.address, quantity, { value }))
        .to.changeTokenBalance(Pookyball, player1.address, quantity)
        .and.to.emit(GenesisSale, 'Sale')
        .withArgs(player1.address, templateId, quantity, value);
    });
  });

  describe('ineligibilityReason', () => {
    it('should return "not eligible yet" if sender is not eligible', async () => {
      await WaitList.connect(operator).setBatch([player1.address], [2]);
      expect(await GenesisSale.ineligibilityReason(templateId, player1.address, 1)).to.eq('not eligible yet');
    });

    it('should return "insufficient supply" if mint would exhaust the supply', async () => {
      const quantity = template.supply.toNumber() + 1;
      expect(await GenesisSale.ineligibilityReason(templateId, player1.address, quantity)).to.eq('insufficient supply');
    });

    it('should return "" mint should be allowed', async () => {
      const quantity = faker.datatype.number(2) + 1;
      expect(await GenesisSale.ineligibilityReason(templateId, player1.address, quantity)).to.eq('');
    });
  });
});
