import { faker } from '@faker-js/faker';
import { loadFixture, setBalance } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { BigNumber, utils } from 'ethers';
import getTestAccounts from '../../lib/testing/getTestAccounts';
import { signRewards } from '../../lib/testing/signRewards';
import stackFixture from '../../lib/testing/stackFixture';
import PookyballLuxury from '../../lib/types/PookyballLuxury';
import PookyballRarity from '../../lib/types/PookyballRarity';
import parseEther from '../../lib/utils/parseEther';
import { POK, Pookyball, Rewards } from '../../typechain-types';

describe('Rewards', () => {
  // Signers
  let player1: SignerWithAddress;
  let backend: SignerWithAddress;
  let minter: SignerWithAddress;

  // Contracts
  let Rewards: Rewards;
  let Pookyball: Pookyball;
  let POK: POK;
  let data: string;

  beforeEach(async () => {
    ({ player1, backend, minter } = await getTestAccounts());
    ({ Rewards, Pookyball, POK } = await loadFixture(stackFixture));
    await setBalance(Rewards.address, parseEther(1000));
    data = 'test data';
  });

  describe('claim', () => {
    let amountNAT: BigNumber;
    let amountPOK: BigNumber;
    let tokenId: number;
    let tokenPXP: BigNumber;

    beforeEach(async () => {
      amountNAT = parseEther(faker.datatype.number(5) + 5);
      amountPOK = parseEther(faker.datatype.number(5) + 5);

      await Pookyball.connect(minter).mint([player1.address], [PookyballRarity.COMMON], [PookyballLuxury.COMMON]);
      tokenId = (await Pookyball.lastTokenId()).toNumber();
      tokenPXP = parseEther(faker.datatype.number(5) + 5);
    });

    it('should revert if signature is invalid', async () => {
      // This simulates an attack where the player attempts to get 100x his rewards
      const [sig, rewards] = await signRewards(
        player1.address,
        { amountNAT: amountNAT.mul(100), amountPOK },
        data,
        player1,
      );

      await expect(Rewards.connect(player1).claim(rewards, sig, data))
        .to.be.revertedWithCustomError(Rewards, 'InvalidSignature')
        .withArgs();
    });

    it('should revert if hashes were claimed more that once', async () => {
      const hash = utils.solidityKeccak256(['string'], [faker.datatype.string(10)]);

      // This simulates an attack where the player attempts to get 100x his rewards
      const [sig, rewards] = await signRewards(
        player1.address,
        { amountNAT, amountPOK, hashes: [hash] },
        data,
        backend,
      );

      await Rewards.connect(player1).claim(rewards, sig, data); // This should pass
      await expect(Rewards.connect(player1).claim(rewards, sig, data))
        .to.be.revertedWithCustomError(Rewards, 'AlreadyClaimed')
        .withArgs(hash);
    });

    it('should revert if data was not passed correctly', async () => {
      // This simulates an attack where the player attempts to get 100x his rewards
      const [sig, rewards] = await signRewards(
        player1.address,
        { amountNAT: amountNAT.mul(100), amountPOK },
        data,
        player1,
      );

      // we give another data to the claim function which was not signed
      const invalidData = 'invalid data';

      await expect(Rewards.connect(player1).claim(rewards, sig, invalidData))
        .to.be.revertedWithCustomError(Rewards, 'InvalidSignature')
        .withArgs();
    });

    it('should revert if contract balance is less that the claimed native currency', async () => {
      await setBalance(Rewards.address, amountNAT.div(2));

      const [signature, rewards] = await signRewards(player1.address, { amountNAT, amountPOK }, data, backend);
      await expect(Rewards.connect(player1).claim(rewards, signature, data))
        .to.be.revertedWithCustomError(Rewards, 'InsufficientBalance')
        .withArgs(amountNAT, amountNAT.div(2));
    });

    it('should allow players to claim rewards', async () => {
      const [signature, rewards] = await signRewards(
        player1.address,
        {
          amountNAT,
          amountPOK,
          pxp: [{ tokenId, amountPXP: tokenPXP }],
        },
        data,
        backend,
      );

      await expect(Rewards.connect(player1).claim(rewards, signature, data))
        .to.emit(Rewards, 'RewardsClaimed')
        .withArgs(player1.address, rewards, '')
        .and.to.changeTokenBalance(POK, player1.address, amountPOK)
        .and.to.changeEtherBalance(player1.address, rewards.amountNAT);
    });
  });
});
