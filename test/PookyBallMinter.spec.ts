import { ZERO_ADDRESS } from '../lib/constants';
import parseEther from '../lib/parseEther';
import { DEFAULT_ADMIN_ROLE, TECH } from '../lib/roles';
import getTestAccounts from '../lib/testing/getTestAccounts';
import { randAccount } from '../lib/testing/rand';
import { expectMissingRole } from '../lib/testing/roles';
import stackFixture from '../lib/testing/stackFixture';
import { BallLuxury, BallRarity } from '../lib/types';
import { PookyBallGenesisMinter } from '../typings';
import { MintTemplateStruct } from '../typings/contracts/PookyBallMinter';
import { faker } from '@faker-js/faker';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { randomBytes } from 'crypto';
import { ethers } from 'ethers';

describe('PookyBallMinter', () => {
  let tech: SignerWithAddress;
  let player1: SignerWithAddress;

  let PookyBallMinter: PookyBallGenesisMinter;

  beforeEach(async () => {
    ({ tech, player1 } = await getTestAccounts());
    ({ PookyBallGenesisMinter: PookyBallMinter } = await loadFixture(stackFixture));
  });

  describe('setVrfParameters', async () => {
    const newAddress = randAccount();
    const newSubscriptionId = faker.datatype.number(100);
    const newCallbackGasLimit = faker.datatype.number(10000);
    const newRequestConfirmations = faker.datatype.number(20);
    const newKeyHash = ethers.utils.keccak256(randomBytes(32));

    it('should allow TECH role to change the VRF parameters', async () => {
      await PookyBallMinter.connect(tech).setVrfParameters(
        newAddress,
        newSubscriptionId,
        newCallbackGasLimit,
        newRequestConfirmations,
        newKeyHash,
      );

      expect(await PookyBallMinter.vrf_coordinator()).to.equals(newAddress);
      expect(await PookyBallMinter.vrf_subscriptionId()).to.equals(newSubscriptionId);
      expect(await PookyBallMinter.vrf_callbackGasLimit()).to.equals(newCallbackGasLimit);
      expect(await PookyBallMinter.vrf_requestConfirmations()).to.equals(newRequestConfirmations);
      expect(await PookyBallMinter.vrf_keyHash()).to.equals(newKeyHash);
    });

    it('should revert if non-TECH account tries to change the VRF parameters', async () => {
      await expectMissingRole(
        PookyBallMinter.connect(player1).setVrfParameters(
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

  describe('setPookyBallContract', () => {
    it('should allow DEFAULT_ADMIN_ROLE to set the PookyBall contract address', async () => {
      const newAddress = randAccount();
      await PookyBallMinter.setPookyBallContract(newAddress);
      expect(await PookyBallMinter.pookyBall()).to.equals(newAddress);
    });

    it('should revert if non-DEFAULT_ADMIN_ROLE account tries to set PookyBall contract address', async () => {
      await expectMissingRole(
        PookyBallMinter.connect(player1).setPookyBallContract(player1.address),
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
      const previousTemplateId = (await PookyBallMinter.lastMintTemplateId()).toNumber();
      const expectedTemplateId = previousTemplateId + 1;

      await expect(PookyBallMinter.connect(tech).createMintTemplate(templateParams))
        .to.emit(PookyBallMinter, 'MintTemplateCreated')
        .withArgs(expectedTemplateId);
      expect(await PookyBallMinter.lastMintTemplateId()).to.equals(expectedTemplateId);

      const template = await PookyBallMinter.mintTemplates(previousTemplateId + 1);
      expect(template.enabled).to.equals(templateParams.enabled);
      expect(template.rarity).to.equals(templateParams.rarity);
      expect(template.luxury).to.equals(templateParams.luxury);
      expect(template.maxMints).to.equals(templateParams.maxMints);
      expect(template.currentMints).to.equals(templateParams.currentMints);
      expect(template.price).to.equals(templateParams.price);
      expect(template.payingToken).to.equals(templateParams.payingToken);
    });

    it('should revert if non-TECH account tries to create mint template', async () => {
      await expectMissingRole(PookyBallMinter.connect(player1).createMintTemplate(templateParams), player1, TECH);
    });
  });

  describe('enableMintTemplate', () => {
    it('should allow TECH account to toggle mint template', async () => {
      const templateId = await PookyBallMinter.lastMintTemplateId();
      const { enabled } = await PookyBallMinter.mintTemplates(templateId);
      const expected = !enabled;

      await expect(PookyBallMinter.connect(tech).enableMintTemplate(templateId, expected))
        .to.emit(PookyBallMinter, 'MintTemplateEnabled')
        .withArgs(templateId, expected);

      const { enabled: actual } = await PookyBallMinter.mintTemplates(templateId);
      expect(actual).to.equals(expected);
    });

    it('should revert if non-TECH account tries to change mint template', async () => {
      await expectMissingRole(
        PookyBallMinter.connect(player1).enableMintTemplate(await PookyBallMinter.lastMintTemplateId(), true),
        player1,
        TECH,
      );
    });
  });
});
