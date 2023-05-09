import { faker } from "@faker-js/faker";
import {
  loadFixture,
  setBalance,
} from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { parseEther, solidityPackedKeccak256 } from "ethers";
import { DEFAULT_ADMIN_ROLE, REWARDER } from "../../lib/roles";
import connect from "../../lib/testing/connect";
import getTestAccounts from "../../lib/testing/getTestAccounts";
import { expectHasRole } from "../../lib/testing/roles";
import { signRewards } from "../../lib/testing/signRewards";
import stackFixture from "../../lib/testing/stackFixture";
import PookyballRarity from "../../lib/types/PookyballRarity";
import getAddress from "../../lib/utils/getAddress";
import { POK, Pookyball, Rewards } from "../../typechain-types";

describe("Rewards", () => {
  // Signers
  let admin: SignerWithAddress;
  let player1: SignerWithAddress;
  let backend: SignerWithAddress;
  let minter: SignerWithAddress;

  // Contracts
  let Rewards: Rewards;
  let Pookyball: Pookyball;
  let POK: POK;
  let data: string;

  beforeEach(async () => {
    ({ admin, player1, backend, minter } = await getTestAccounts());
    ({ Rewards, Pookyball, POK } = await loadFixture(stackFixture));
    await setBalance(getAddress(Rewards), parseEther("1000"));
    data = "test data";
  });

  describe("permissions", () => {
    it("should have granted the DEFAULT_ADMIN_ROLE to the admin account", async () => {
      await expectHasRole(Rewards, admin, DEFAULT_ADMIN_ROLE);
    });

    it("should have granted the REWARDER role to the backend account", async () => {
      await expectHasRole(Rewards, backend, REWARDER);
    });
  });

  describe("withdraw", () => {
    it("should prevent non admin accounts to withdraw", async () => {
      await expect(
        connect(Rewards, player1).withdraw()
      ).to.be.revertedMissingRole(player1, DEFAULT_ADMIN_ROLE);
      await expect(
        connect(Rewards, backend).withdraw()
      ).to.be.revertedMissingRole(backend, DEFAULT_ADMIN_ROLE);
    });

    it("should allow admin account to withdraw", async () => {
      const totalAmount = parseEther(
        (faker.datatype.number(10) + 1).toString(10)
      );
      await setBalance(getAddress(Rewards), totalAmount);

      await expect(connect(Rewards, admin).withdraw()).to.changeEtherBalance(
        admin,
        totalAmount
      );
    });
  });

  describe("claim", () => {
    let amountNAT: bigint;
    let amountPOK: bigint;
    let tokenId: bigint;
    let tokenPXP: bigint;

    beforeEach(async () => {
      amountNAT = parseEther(
        faker.datatype.number({ min: 5, max: 10 }).toString()
      );
      amountPOK = parseEther(
        faker.datatype.number({ min: 5, max: 10 }).toString()
      );

      await connect(Pookyball, minter).mint(
        [player1.address],
        [PookyballRarity.COMMON]
      );
      tokenId = await Pookyball.lastTokenId();
      tokenPXP = parseEther(
        faker.datatype.number({ min: 5, max: 10 }).toString()
      );
    });

    it("should revert if signature is invalid", async () => {
      // This simulates an attack where the player attempts to get 100x his rewards
      const [sig, rewards] = await signRewards(
        player1.address,
        { amountNAT: amountNAT * 100n, amountPOK },
        data,
        player1
      );

      await expect(connect(Rewards, player1).claim(rewards, sig, data))
        .to.be.revertedWithCustomError(Rewards, "InvalidSignature")
        .withArgs();
    });

    it("should revert if hashes were claimed more that once", async () => {
      const nonce = solidityPackedKeccak256(
        ["string"],
        [faker.datatype.string(10)]
      );

      // This simulates an attack where the player attempts to get 100x his rewards
      const [sig, rewards] = await signRewards(
        player1.address,
        { amountNAT, amountPOK, nonces: [nonce] },
        data,
        backend
      );

      await connect(Rewards, player1).claim(rewards, sig, data); // This should pass
      await expect(connect(Rewards, player1).claim(rewards, sig, data))
        .to.be.revertedWithCustomError(Rewards, "AlreadyClaimed")
        .withArgs(nonce);
    });

    it("should revert if data was not passed correctly", async () => {
      // This simulates an attack where the player attempts to get 100x his rewards
      const [sig, rewards] = await signRewards(
        player1.address,
        { amountNAT: amountNAT * 100n, amountPOK },
        data,
        player1
      );

      // we give another data to the claim function which was not signed
      const invalidData = "invalid data";

      await expect(connect(Rewards, player1).claim(rewards, sig, invalidData))
        .to.be.revertedWithCustomError(Rewards, "InvalidSignature")
        .withArgs();
    });

    it("should revert if contract balance is less that the claimed native currency", async () => {
      await setBalance(getAddress(Rewards), amountNAT / 2n);

      const [signature, rewards] = await signRewards(
        player1.address,
        { amountNAT, amountPOK },
        data,
        backend
      );
      await expect(connect(Rewards, player1).claim(rewards, signature, data))
        .to.be.revertedWithCustomError(Rewards, "InsufficientBalance")
        .withArgs(amountNAT, amountNAT / 2n);
    });

    it("should allow players to claim rewards", async () => {
      const [signature, rewards] = await signRewards(
        player1.address,
        {
          amountNAT,
          amountPOK,
          pxp: [{ tokenId, amountPXP: tokenPXP }],
          pookyballs: [PookyballRarity.COMMON, PookyballRarity.RARE],
        },
        data,
        backend
      );

      await expect(connect(Rewards, player1).claim(rewards, signature, data))
        .to.emit(Rewards, "RewardsClaimed")
        .withArgs(player1.address, rewards, "")
        .and.to.changeTokenBalance(POK, player1.address, amountPOK)
        .and.to.changeTokenBalance(Pookyball, player1.address, 2)
        .and.to.changeEtherBalance(player1.address, rewards.amountNAT);
    });
  });
});
