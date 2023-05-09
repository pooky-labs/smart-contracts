import {
  loadFixture,
  setBalance,
} from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { parseEther } from "ethers";
import { DEFAULT_ADMIN_ROLE, MINTER, SELLER } from "../../lib/roles";
import connect from "../../lib/testing/connect";
import getTestAccounts from "../../lib/testing/getTestAccounts";
import { expectHasRole } from "../../lib/testing/roles";
import stackFixture from "../../lib/testing/stackFixture";
import PookyballRarity from "../../lib/types/PookyballRarity";
import now from "../../lib/utils/now";
import {
  InvalidReceiver,
  Pookyball,
  RefillableSale,
  RefillableSale__factory,
} from "../../typechain-types";
import { RefillStruct } from "../../typechain-types/contracts/mint/RefillableSale";

describe("RefillableSale", () => {
  let deployer: SignerWithAddress;
  let admin: SignerWithAddress;
  let seller: SignerWithAddress;
  let player1: SignerWithAddress;

  let RefillableSale: RefillableSale;
  let Pookyball: Pookyball;
  let InvalidReceiver: InvalidReceiver;

  const refills: RefillStruct[] = [
    { rarity: PookyballRarity.COMMON, quantity: 77, price: parseEther("20") },
    { rarity: PookyballRarity.RARE, quantity: 18, price: parseEther("80") },
    { rarity: PookyballRarity.EPIC, quantity: 4, price: parseEther("320") },
    {
      rarity: PookyballRarity.LEGENDARY,
      quantity: 1,
      price: parseEther("1280"),
    },
  ];

  beforeEach(async () => {
    ({ deployer, admin, seller, player1 } = await getTestAccounts());
    ({ RefillableSale, Pookyball, InvalidReceiver } = await loadFixture(
      stackFixture
    ));

    // Default sale configuration
    await connect(RefillableSale, seller).restock(refills, now() - 10);
  });

  describe("permissions", () => {
    it("should have granted permissions correctly", async () => {
      await expectHasRole(RefillableSale, admin, DEFAULT_ADMIN_ROLE);
      await expectHasRole(RefillableSale, seller, SELLER);
    });
  });

  describe("getTemplates", () => {
    it("should returns the template data", async () => {
      const templates = await RefillableSale.getTemplates();
      expect(templates.length).to.eq(refills.length);
    });
  });

  describe("isClosed", () => {
    it("should returns true if closedUntil is zero", async () => {
      await connect(RefillableSale, seller).restock([], 0);
      expect(await RefillableSale.isClosed()).to.be.true;
    });

    it("should returns true if closedUntil is in the future", async () => {
      await connect(RefillableSale, seller).restock([], now() + 10000);
      expect(await RefillableSale.isClosed()).to.be.true;
    });
  });

  describe("eligible", () => {
    it('should return "sale is closed" if sale is closed', async () => {
      await connect(RefillableSale, seller).restock([], now() + 3600);

      for (const { rarity } of refills) {
        expect(await RefillableSale.eligible(rarity, 1)).to.eq(
          "sale is closed"
        );
      }
    });

    it('should return "insufficient supply" if sale supply is insufficient', async () => {
      await connect(RefillableSale, seller).restock(
        [
          {
            rarity: PookyballRarity.COMMON,
            quantity: 1,
            price: parseEther("20"),
          },
        ],
        now() - 10
      );
      expect(await RefillableSale.eligible(PookyballRarity.COMMON, 2)).to.eq(
        "insufficient supply"
      );
    });

    it('should return "" if purchase request is valid', async () => {
      await connect(RefillableSale, seller).restock(
        [
          {
            rarity: PookyballRarity.COMMON,
            quantity: 100,
            price: parseEther("20"),
          },
        ],
        now() - 10
      );
      expect(await RefillableSale.eligible(PookyballRarity.COMMON, 2)).to.eq(
        ""
      );
    });
  });

  describe("mint", () => {
    beforeEach(async () => {
      // Sometimes, the test fails with the following error:
      // InvalidInputError: sender doesn't have enough funds to send tx.
      // The max upfront cost is: xxxx and the sender's account only has: 10000000000000000000000
      // Setting player1's balance to 1,000,000,000 ETH fixes the problem.
      await setBalance(player1.address, parseEther("1000000000"));
    });

    it("should revert if sale is closed", async () => {
      const closedUntil = now() + 3600;
      await connect(RefillableSale, seller).restock([], closedUntil);
      const item = await RefillableSale.items(PookyballRarity.COMMON);

      await expect(
        connect(RefillableSale, player1).mint(
          PookyballRarity.COMMON,
          player1.address,
          1,
          {
            value: item.price,
          }
        )
      )
        .to.be.revertedWithCustomError(RefillableSale, "Closed")
        .withArgs(closedUntil);
    });

    it("should revert if mint would exhaust the supply", async () => {
      let item = await RefillableSale.items(PookyballRarity.RARE);
      const quantity = 3n;
      await connect(RefillableSale, seller).restock(
        [{ rarity: PookyballRarity.RARE, quantity: 2, price: item.price }],
        1
      );
      item = await RefillableSale.items(PookyballRarity.RARE);

      await expect(
        connect(RefillableSale, player1).mint(
          PookyballRarity.RARE,
          player1.address,
          quantity,
          {
            value: item.price * quantity,
          }
        )
      )
        .to.be.revertedWithCustomError(RefillableSale, "InsufficientSupply")
        .withArgs(PookyballRarity.RARE, item.supply);
    });

    it("should revert not enough value is sent to cover the mint cost", async () => {
      const item = await RefillableSale.items(PookyballRarity.RARE);
      const quantity = 3n;
      const value = (item.price * 9n) / 10n;
      await connect(RefillableSale, seller).restock(
        [
          {
            rarity: PookyballRarity.RARE,
            quantity: 10,
            price: item.price,
          },
        ],
        1
      );

      await expect(
        connect(RefillableSale, player1).mint(
          PookyballRarity.RARE,
          player1.address,
          quantity,
          { value }
        )
      )
        .to.be.revertedWithCustomError(RefillableSale, "InsufficientValue")
        .withArgs(item.price * quantity, value);
    });

    it("should revert if treasury is invalid", async () => {
      const RefillableSale = await new RefillableSale__factory()
        .connect(deployer)
        .deploy(Pookyball.target, InvalidReceiver.target, admin.address, [
          seller.address,
        ]);
      await connect(Pookyball, admin).grantRole(MINTER, RefillableSale.target);

      const item = await RefillableSale.items(PookyballRarity.COMMON);
      await connect(RefillableSale, seller).restock(
        [{ rarity: PookyballRarity.COMMON, quantity: 2, price: item.price }],
        1
      );

      await expect(
        connect(RefillableSale, player1).mint(
          PookyballRarity.COMMON,
          player1.address,
          1,
          { value: item.price }
        )
      )
        .to.be.revertedWithCustomError(RefillableSale, "TransferFailed")
        .withArgs(InvalidReceiver.target, item.price);
    });

    it("should allow account to mint multiple Pookyball tokens", async () => {
      const item = await RefillableSale.items(PookyballRarity.RARE);
      const quantity = 3n;
      await connect(RefillableSale, seller).restock(
        [{ rarity: PookyballRarity.RARE, quantity: 10, price: item.price }],
        1
      );

      const value = item.price * quantity;
      await expect(
        connect(RefillableSale, player1).mint(
          PookyballRarity.RARE,
          player1.address,
          quantity,
          { value }
        )
      )
        .to.changeTokenBalance(Pookyball, player1.address, quantity)
        .and.to.emit(RefillableSale, "Sale")
        .withArgs(player1.address, PookyballRarity.RARE, quantity, value);
    });
  });
});
