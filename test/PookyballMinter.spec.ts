import { ZERO_ADDRESS } from '../lib/constants';
import { DEFAULT_ADMIN_ROLE, TECH } from '../lib/roles';
import getTestAccounts from '../lib/testing/getTestAccounts';
import { randAccount, randUint256 } from '../lib/testing/rand';
import { expectMissingRole } from '../lib/testing/roles';
import stackFixture from '../lib/testing/stackFixture';
import { BallLuxury, BallRarity } from '../lib/typings/DataTypes';
import parseEther from '../lib/utils/parseEther';
import { PookyballGenesisMinter } from '../typings';
import { MintTemplateStruct } from '../typings/contracts/PookyballMinter';
import { faker } from '@faker-js/faker';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { randomBytes } from 'crypto';
import { ethers } from 'ethers';

describe('PookyballMinter', () => {
  let tech: SignerWithAddress;
  let player1: SignerWithAddress;

  let PookyballMinter: PookyballGenesisMinter;

  beforeEach(async () => {
    ({ tech, player1 } = await getTestAccounts());
    ({ PookyballGenesisMinter: PookyballMinter } = await loadFixture(stackFixture));
  });

  describe('setVrfParameters', async () => {
    const newAddress = randAccount();
    const newSubscriptionId = faker.datatype.number(100);
    const newCallbackGasLimit = faker.datatype.number(10000);
    const newRequestConfirmations = faker.datatype.number(20);
    const newKeyHash = ethers.utils.keccak256(randomBytes(32));

    it('should allow TECH role to change the VRF parameters', async () => {
      await PookyballMinter.connect(tech).setVrfParameters(
        newAddress,
        newSubscriptionId,
        newCallbackGasLimit,
        newRequestConfirmations,
        newKeyHash,
      );

      expect(await PookyballMinter.vrf_coordinator()).to.equals(newAddress);
      expect(await PookyballMinter.vrf_subscriptionId()).to.equals(newSubscriptionId);
      expect(await PookyballMinter.vrf_callbackGasLimit()).to.equals(newCallbackGasLimit);
      expect(await PookyballMinter.vrf_requestConfirmations()).to.equals(newRequestConfirmations);
      expect(await PookyballMinter.vrf_keyHash()).to.equals(newKeyHash);
    });

    it('should revert if non-TECH account tries to change the VRF parameters', async () => {
      await expectMissingRole(
        PookyballMinter.connect(player1).setVrfParameters(
          newAddress,
          newSubscriptionId,
          newCallbackGasLimit,
          newRequestConfirmations,
          newKeyHash,
        ),
        player1,
        TECH,
      );
    });
  });

  describe('setPookyballContract', () => {
    it('should allow DEFAULT_ADMIN_ROLE to set the Pookyball contract address', async () => {
      const newAddress = randAccount();
      await PookyballMinter.setPookyballContract(newAddress);
      expect(await PookyballMinter.pookyBall()).to.equals(newAddress);
    });

    it('should revert if non-DEFAULT_ADMIN_ROLE account tries to set Pookyball contract address', async () => {
      await expectMissingRole(
        PookyballMinter.connect(player1).setPookyballContract(player1.address),
        player1,
        DEFAULT_ADMIN_ROLE,
      );
    });
  });

  describe('createMintTemplate', () => {
    let templateParams: MintTemplateStruct;

    beforeEach(() => {
      templateParams = {
        enabled: true,
        rarity: BallRarity.Common,
        luxury: BallLuxury.Common,
        maxMints: faker.datatype.number({ min: 100, max: 200 }),
        currentMints: 0,
        price: parseEther(100),
        payingToken: ZERO_ADDRESS,
      };
    });

    it('should allow TECH account to create a mint template', async () => {
      const previousTemplateId = (await PookyballMinter.lastMintTemplateId()).toNumber();
      const expectedTemplateId = previousTemplateId + 1;

      await expect(PookyballMinter.connect(tech).createMintTemplate(templateParams))
        .to.emit(PookyballMinter, 'MintTemplateCreated')
        .withArgs(expectedTemplateId);
      expect(await PookyballMinter.lastMintTemplateId()).to.equals(expectedTemplateId);

      const template = await PookyballMinter.mintTemplates(previousTemplateId + 1);
      expect(template.enabled).to.equals(templateParams.enabled);
      expect(template.rarity).to.equals(templateParams.rarity);
      expect(template.luxury).to.equals(templateParams.luxury);
      expect(template.maxMints).to.equals(templateParams.maxMints);
      expect(template.currentMints).to.equals(templateParams.currentMints);
      expect(template.price).to.equals(templateParams.price);
      expect(template.payingToken).to.equals(templateParams.payingToken);
    });

    it('should revert if non-TECH account tries to create mint template', async () => {
      await expectMissingRole(PookyballMinter.connect(player1).createMintTemplate(templateParams), player1, TECH);
    });
  });

  describe('enableMintTemplate', () => {
    let lastMintTemplateId: number;

    beforeEach(async () => {
      lastMintTemplateId = (await PookyballMinter.lastMintTemplateId()).toNumber();
    });

    it('should allow TECH account to toggle mint template', async () => {
      const templateId = lastMintTemplateId;
      const { enabled } = await PookyballMinter.mintTemplates(templateId);
      const expected = !enabled;

      await expect(PookyballMinter.connect(tech).enableMintTemplate(templateId, expected))
        .to.emit(PookyballMinter, 'MintTemplateEnabled')
        .withArgs(templateId, expected);

      const { enabled: actual } = await PookyballMinter.mintTemplates(templateId);
      expect(actual).to.equals(expected);
    });

    it('should revert if non-TECH account tries to change mint template', async () => {
      await expectMissingRole(
        PookyballMinter.connect(player1).enableMintTemplate(await PookyballMinter.lastMintTemplateId(), true),
        player1,
        TECH,
      );
    });

    it('should revert if mint template id is zero', async () => {
      await expect(PookyballMinter.connect(tech).enableMintTemplate(0, false))
        .to.revertedWithCustomError(PookyballMinter, 'InvalidMintTemplateId')
        .withArgs(0, lastMintTemplateId);
    });

    it('should revert if mint template id is too high', async () => {
      const templateId = lastMintTemplateId + 1;
      await expect(PookyballMinter.connect(tech).enableMintTemplate(templateId, false))
        .to.revertedWithCustomError(PookyballMinter, 'InvalidMintTemplateId')
        .withArgs(templateId, lastMintTemplateId);
    });

    it('should revert if mint template is already enabled', async () => {
      const templateId = lastMintTemplateId;
      const enabled = (await PookyballMinter.mintTemplates(templateId)).enabled;
      await expect(PookyballMinter.connect(tech).enableMintTemplate(templateId, enabled))
        .to.revertedWithCustomError(PookyballMinter, 'MintTemplateEnabledAlreadySetTo')
        .withArgs(enabled);
    });
  });

  describe('rawFulfillRandomWords', () => {
    it('should revert if sender is not the VRF coordinator', async () => {
      await expect(PookyballMinter.connect(player1).rawFulfillRandomWords(1, [randUint256()]))
        .to.be.revertedWithCustomError(PookyballMinter, 'OnlyVRFCoordinator')
        .withArgs(await PookyballMinter.vrf_coordinator(), player1.address);
    });
  });
});
