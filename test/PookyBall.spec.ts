import { BALL_MAXIMUM_RARITY, DEFAULT_ADMIN_ROLE, HUNDRED } from '../lib/constants';
import getSigners from '../lib/getSigners';
import { randInt } from '../lib/rand';
import { POOKY_CONTRACT } from '../lib/roles';
import { expectHasRole, expectMissingRole } from '../lib/testing/roles';
import stackFixture from '../lib/testing/stackFixture';
import waitTx from '../lib/waitTx';
import { PookyBall, PookyMintEvent } from '../typings';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';

describe('PookyBall', () => {
  let deployer: SignerWithAddress;
  let player: SignerWithAddress;
  let PookyBall: PookyBall;
  let PookyMintEvent: PookyMintEvent;

  beforeEach(async () => {
    ({ deployer, player } = await getSigners());
    ({ PookyBall, PookyMintEvent } = await loadFixture(stackFixture));
  });

  describe('configuration', () => {
    it('should have roles configured properly', async () => {
      await expectHasRole(PookyBall, PookyMintEvent, POOKY_CONTRACT);
    });
  });

  describe('setContractURI', () => {
    it('should allow DEFAULT_ADMIN_ROLE account to set contract URI', async () => {
      const contractUriBefore = await PookyBall.contractUri();
      const URI = contractUriBefore + 'Some random URI';

      await waitTx(PookyBall.connect(deployer).setContractURI(URI));

      const contractUriAfter = await PookyBall.contractURI();
      expect(contractUriAfter).to.be.equal(URI, 'Contract URI is not set correctly');
    });

    it('should revert if non-DEFAULT_ADMIN_ROLE account tries to set contract URI', async () => {
      await expectMissingRole(PookyBall.connect(player).setContractURI('Some random URI'), player, DEFAULT_ADMIN_ROLE);
    });
  });

  describe('addBallPxp', () => {
    it('should revert if non-POOKY_CONTRACT account tries to add ball pxp', async () => {
      const randomBallId = randInt(HUNDRED);
      const randomBallPxp = randInt(HUNDRED);

      await expectMissingRole(
        PookyBall.connect(player).addBallPxp(randomBallId, randomBallPxp),
        player,
        POOKY_CONTRACT,
      );
    });
  });

  describe('changeBallLevel', () => {
    it('should revert if non-POOKY_CONTRACT role tries to change ball level', async () => {
      const randomBallId = randInt(HUNDRED);
      const randomBallLevel = randInt(HUNDRED);

      await expectMissingRole(
        PookyBall.connect(player).changeBallLevel(randomBallId, randomBallLevel),
        player,
        POOKY_CONTRACT,
      );
    });
  });

  describe('mintWithRarity', () => {
    it('should revert if non-POOKY_CONTRACT account tries to mint ball with random rarity', async () => {
      const randomBallRarity = randInt(BALL_MAXIMUM_RARITY);

      await expectMissingRole(
        PookyBall.connect(player).mintWithRarity(player.address, randomBallRarity),
        player,
        POOKY_CONTRACT,
      );
    });
  });

  describe('mintWithRarityAndRevokableTimestamp', () => {
    it('should revert if non-POOKY_CONTRACT account tries to mint ball with random rarity and random revokable timestamp', async () => {
      const randomBallRarity = randInt(BALL_MAXIMUM_RARITY);
      const randomRevokableTimestamp = randInt(HUNDRED);

      await expectMissingRole(
        PookyBall.connect(player).mintWithRarityAndRevokableTimestamp(
          player.address,
          randomBallRarity,
          randomRevokableTimestamp,
        ),
        player,
        POOKY_CONTRACT,
      );
    });
  });

  describe('setRandomEntropy', () => {
    it('should revert if non-POOKY_CONTRACT account tries to set ball entropy', async () => {
      const randomBallId = randInt(HUNDRED);
      const randomBallEntropy = randInt(HUNDRED);

      await expectMissingRole(
        PookyBall.connect(player).setRandomEntropy(randomBallId, randomBallEntropy),
        player,
        POOKY_CONTRACT,
      );
    });
  });
});
