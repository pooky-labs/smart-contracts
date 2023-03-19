import { faker } from '@faker-js/faker';
import { loadFixture, setBalance } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { MINTER } from '../../lib/roles';
import getTestAccounts from '../../lib/testing/getTestAccounts';
import stackFixture from '../../lib/testing/stackFixture';
import Config from '../../lib/types/Config';
import parseEther from '../../lib/utils/parseEther';
import { InvalidReceiver, LaunchSale, LaunchSale__factory, Pookyball } from '../../typechain-types';
import { TemplateStructOutput } from '../../typechain-types/contracts/mint/LaunchSale';

describe('LaunchSale', () => {
  // Signers
  let deployer: SignerWithAddress;
  let admin: SignerWithAddress;
  let player1: SignerWithAddress;
  let player2: SignerWithAddress;

  // Contracts
  let LaunchSale: LaunchSale;
  let Pookyball: Pookyball;
  let InvalidReceiver: InvalidReceiver;

  // Internal data
  let config: Config;
  let templateId: number;
  let template: TemplateStructOutput;

  beforeEach(async () => {
    ({ deployer, admin, player1, player2 } = await getTestAccounts());
    ({ LaunchSale, Pookyball, InvalidReceiver, config } = await loadFixture(stackFixture));

    templateId = faker.datatype.boolean() ? 0 : 1; // common or rare
    template = await LaunchSale.templates(templateId);
  });

  describe('templates', async () => {
    it('should iterate over the available templates', async () => {
      const nextTemplateId = (await LaunchSale.nextTemplateId()).toNumber();

      for (let i = 0; i < nextTemplateId; i++) {
        const template = await LaunchSale.templates(i);
        expect(template.supply).gt(0);
      }
    });
  });

  describe('getTemplates', async () => {
    it('should return all the available templates', async () => {
      const templates = await LaunchSale.getTemplates();
      const nextTemplateId = (await LaunchSale.nextTemplateId()).toNumber();

      for (let i = 0; i < nextTemplateId; i++) {
        const template = await LaunchSale.templates(i);
        expect(template).to.deep.eq(templates[i]);
      }
    });
  });

  describe('mint', () => {
    let quantity: number;

    beforeEach(async () => {
      quantity = 3 + faker.datatype.number(2);

      // Sometimes, the test fails with the following error:
      // InvalidInputError: sender doesn't have enough funds to send tx.
      // The max upfront cost is: xxxx and the sender's account only has: 10000000000000000000000
      // Setting player1's balance to 1,000,000,000 ETH fixes the problem.
      await setBalance(player1.address, parseEther(1e9));
    });

    it('should revert if mint would exhaust the supply', async () => {
      // Attempt to mint all the supply + 1
      const supply = template.supply.toNumber();
      const quantity = supply + 1;

      await expect(
        LaunchSale.connect(player2).mint(templateId, player2.address, quantity, {
          value: template.price.mul(quantity),
        }),
      )
        .to.be.revertedWithCustomError(LaunchSale, 'InsufficientSupply')
        .withArgs(templateId, supply);
    });

    it('should revert not enough value is sent to cover the mint cost', async () => {
      const quantity = 1;
      const value = template.price.mul(9).div(10);

      await expect(LaunchSale.connect(player1).mint(templateId, player1.address, quantity, { value }))
        .to.be.revertedWithCustomError(LaunchSale, 'InsufficientValue')
        .withArgs(template.price.mul(quantity), value);
    });

    it('should revert if treasury is is invalid', async () => {
      const LaunchSale = await new LaunchSale__factory().connect(deployer).deploy(
        Pookyball.address,
        InvalidReceiver.address,
        config.templates.map((t) => ({ ...t, minted: 0 })),
      );
      await Pookyball.connect(admin).grantRole(MINTER, LaunchSale.address);
      const value = template.price.mul(quantity);

      await expect(LaunchSale.connect(player1).mint(templateId, player1.address, quantity, { value }))
        .to.be.revertedWithCustomError(LaunchSale, 'TransferFailed')
        .withArgs(InvalidReceiver.address, value);
    });

    it('should allow account to mint multiple Pookyball tokens', async () => {
      const value = template.price.mul(quantity);

      await expect(LaunchSale.connect(player1).mint(templateId, player1.address, quantity, { value }))
        .to.changeTokenBalance(Pookyball, player1.address, quantity)
        .and.to.emit(LaunchSale, 'Sale')
        .withArgs(player1.address, templateId, quantity, value);
    });
  });

  describe('ineligibilityReason', () => {
    it('should return "insufficient supply" if mint would exhaust the supply', async () => {
      const quantity = template.supply.toNumber() + 1;
      expect(await LaunchSale.ineligibilityReason(templateId, quantity)).to.eq('insufficient supply');
    });

    it('should return "" mint should be allowed', async () => {
      const quantity = faker.datatype.number(2) + 1;
      expect(await LaunchSale.ineligibilityReason(templateId, quantity)).to.eq('');
    });
  });
});
