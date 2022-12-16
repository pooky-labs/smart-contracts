import getTestAccounts from '../../lib/testing/getTestAccounts';
import { signRewards } from '../../lib/testing/signRewards';
import stackFixture from '../../lib/testing/stackFixture';
import PookyballLuxury from '../../lib/types/PookyballLuxury';
import PookyballRarity from '../../lib/types/PookyballRarity';
import parseEther from '../../lib/utils/parseEther';
import { Pookyball, Rewards, POK } from '../../types';
import { faker } from '@faker-js/faker';
import { loadFixture, setBalance } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { BigNumber } from 'ethers';

describe('Rewards', () => {
  // Signers
  let player1: SignerWithAddress;
  let rewarder: SignerWithAddress;
  let minter: SignerWithAddress;

  // Contracts
  let Rewards: Rewards;
  let Pookyball: Pookyball;
  let POK: POK;

  beforeEach(async () => {
    ({ player1, rewarder, minter } = await getTestAccounts());
    ({ Rewards, Pookyball, POK } = await loadFixture(stackFixture));
    await setBalance(Rewards.address, parseEther(1000));
  });

  describe('claim', () => {
    let nextNonce: number;
    let amountNative: BigNumber;
    let amountPOK: BigNumber;
    let tokenId: number;
    let tokenPXP: BigNumber;

    beforeEach(async () => {
      nextNonce = (await Rewards.nonces(player1.address)).toNumber() + 1;
      amountNative = parseEther(faker.datatype.number(5) + 5);
      amountPOK = parseEther(faker.datatype.number(5) + 5);

      await Pookyball.connect(minter).mint(player1.address, PookyballRarity.COMMON, PookyballLuxury.COMMON);
      tokenId = (await Pookyball.lastTokenId()).toNumber();
      tokenPXP = parseEther(faker.datatype.number(5) + 5);
    });

    it('should revert if signature is invalid', async () => {
      // This simulates an attack where the player attempts to get 100x his rewards
      const malicious = await signRewards(
        player1.address,
        amountNative.mul(100),
        amountPOK,
        [],
        [],
        nextNonce,
        player1,
      );

      await expect(Rewards.connect(player1).claim(amountNative, amountPOK, [], [], malicious))
        .to.be.revertedWithCustomError(Rewards, 'InvalidSignature')
        .withArgs();
    });

    it('should revert if tokenIds and tokenPXP arguments sizes mismatch', async () => {
      const sizeMismatch = await signRewards(player1.address, amountNative, amountPOK, [], [122], nextNonce, rewarder);
      await expect(Rewards.connect(player1).claim(amountNative, amountPOK, [], [122], sizeMismatch))
        .to.be.revertedWithCustomError(Rewards, 'ArgumentSizeMismatch')
        .withArgs(0, 1);
    });

    it('should revert if contract balance is less that the clamed native currency', async () => {
      await setBalance(Rewards.address, amountNative.div(2));

      const signature = await signRewards(player1.address, amountNative, amountPOK, [], [], nextNonce, rewarder);
      await expect(Rewards.connect(player1).claim(amountNative, amountPOK, [], [], signature))
        .to.be.revertedWithCustomError(Rewards, 'InsufficientBalance')
        .withArgs(amountNative, amountNative.div(2));
    });

    it('should allow players to claim rewards', async () => {
      const signature = await signRewards(
        player1.address,
        amountNative,
        amountPOK,
        [tokenId],
        [tokenPXP],
        nextNonce,
        rewarder,
      );

      await expect(Rewards.connect(player1).claim(amountNative, amountPOK, [tokenId], [tokenPXP], signature))
        .to.emit(Rewards, 'POKClaimed')
        .withArgs(player1.address, amountPOK)
        .and.to.changeTokenBalance(POK, player1.address, amountPOK)
        .and.to.emit(Rewards, 'PookyballPXPClaimed')
        .withArgs(player1.address, tokenId, tokenPXP)
        .and.to.emit(Rewards, 'NativeClaimed')
        .withArgs(player1.address, amountNative);

      const metadata = await Pookyball.metadata(tokenId);
      expect(await metadata.pxp).to.eq(tokenPXP);
    });
  });
});
