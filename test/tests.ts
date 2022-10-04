import { ethers } from "hardhat";

import { prepareContracts } from "../scripts/deployContracts";
import { BigNumber, Contract, Signer, Wallet } from "ethers";
import { upgrades } from "hardhat";

import { expect } from "chai";
import { signMatchweekClaimMessage } from "../tasks/helpers";

import {
  ZERO,
  HUNDRED,
  ONE,
  MAX_UINT,
  DEFAULT_ADMIN_ROLE,
  BALL_MAXIMUM_RARITY,
  GAS_LIMIT,
  MAXIMUM_UNCOMMON_BALL_LEVEL,
} from "../scripts/constants";
import { timeStamp } from "console";

describe("Test", async function () {
  let deployer: Signer;
  let backendSigner: Signer;
  let treasury: Signer;
  let mod: Signer;
  let player: Signer;
  let pokContract: Contract;
  let pookyBallContract: Contract;
  let pookyMintEventContract: Contract;
  let pookyGameContract: Contract;
  let usedNonce: BigNumber;
  let vrfCoordinatorContract: Contract;

  function generateRandomNumberWithUpperLimit(limit: number) {
    return Math.ceil(Math.random() * (limit - ONE) + ONE);
  }

  async function grantRoles(contracts: Contract[]) {
    let [
      pokContract,
      pookyBallContract,
      pookyMintEventContract,
      pookyGameContract,
    ] = contracts;

    await (
      await pokContract.functions.grantRole(
        ethers.utils.solidityKeccak256(["string"], ["POOKY_CONTRACT"]),
        pookyMintEventContract.address
      )
    ).wait();

    await (
      await pokContract.grantRole(
        ethers.utils.solidityKeccak256(["string"], ["POOKY_CONTRACT"]),
        pookyGameContract.address
      )
    ).wait();

    await (
      await pookyBallContract.grantRole(
        ethers.utils.solidityKeccak256(["string"], ["POOKY_CONTRACT"]),
        pookyMintEventContract.address
      )
    ).wait();

    await (
      await pookyBallContract.grantRole(
        ethers.utils.solidityKeccak256(["string"], ["POOKY_CONTRACT"]),
        pookyGameContract.address
      )
    ).wait();

    await (
      await pookyMintEventContract.grantRole(
        ethers.utils.solidityKeccak256(["string"], ["BE"]),
        await backendSigner.getAddress()
      )
    ).wait();

    await (
      await pookyMintEventContract.grantRole(
        ethers.utils.solidityKeccak256(["string"], ["MOD"]),
        await mod.getAddress()
      )
    ).wait();
  }

  async function connectContract(contracts: Contract[]) {
    let [
      pokContract,
      pookyBallContract,
      pookyMintEventContract,
      pookyGameContract,
    ] = contracts;

    let tx = await pookyMintEventContract.setPookyBallContract(
      pookyBallContract.address
    );
    await tx.wait();

    tx = await pookyGameContract.setPookyBallContract(
      pookyBallContract.address
    );
    await tx.wait();

    tx = await pookyGameContract.setPookToken(pokContract.address);
    await tx.wait();

    tx = await pookyGameContract.setPookySigner(
      await backendSigner.getAddress()
    );
    await tx.wait();
  }

  async function setPookyGameContract(pookyGameContract: Contract) {
    let tx = await pookyGameContract._setLevelPxpNeeded();
    await tx.wait();

    tx = await pookyGameContract._setLevelCost();
    await tx.wait();

    tx = await pookyGameContract._setMaxBallLevel();
    await tx.wait();
  }

  async function deploy() {
    let contracts = await prepareContracts();
    let returnContracts = [];

    for (let i = 0; i < contracts.length; i++) {
      const ContractFactory = await ethers.getContractFactory(
        contracts[i].name
      );
      const contract = await upgrades.deployProxy(
        ContractFactory,
        contracts[i].initValues,
        { initializer: "initialize" }
      );

      returnContracts.push(contract);
    }

    [
      pokContract,
      pookyBallContract,
      pookyMintEventContract,
      pookyGameContract,
    ] = returnContracts;

    await grantRoles(returnContracts);
    await setPookyGameContract(pookyGameContract);
    await connectContract(returnContracts);
    return returnContracts;
  }

  describe("Initialization", function () {
    it("Check roles", async function () {
      [deployer, backendSigner, treasury, mod, player] =
        await ethers.getSigners();

      await deploy();

      let hasRole = await pokContract.hasRole(
        ethers.utils.solidityKeccak256(["string"], ["POOKY_CONTRACT"]),
        pookyMintEventContract.address
      );

      expect(hasRole.toString()).to.be.equal(
        "true",
        "PookyMintEvent contract should be POOKY_CONTRACT in POK smart contract"
      );

      hasRole = await pokContract.hasRole(
        ethers.utils.solidityKeccak256(["string"], ["POOKY_CONTRACT"]),
        await player.getAddress()
      );

      expect(hasRole.toString()).to.be.equal(
        "false",
        "Player should not be POOKY_CONTRACT"
      );

      hasRole = await pookyBallContract.hasRole(
        ethers.utils.solidityKeccak256(["string"], ["POOKY_CONTRACT"]),
        pookyMintEventContract.address
      );

      expect(hasRole.toString()).to.be.equal(
        "true",
        "PookyMintEvent contract should be POOKY_CONTRACT in PookyBall smart contract"
      );

      hasRole = await pookyMintEventContract.hasRole(
        ethers.utils.solidityKeccak256(["string"], ["MOD"]),
        await mod.getAddress()
      );

      expect(hasRole.toString()).to.be.equal(
        "true",
        "MOD wallet should have MOD role in PookyMintEvent smart contract"
      );

      hasRole = await pookyMintEventContract.hasRole(
        ethers.utils.solidityKeccak256(["string"], ["BE"]),
        await backendSigner.getAddress()
      );

      expect(hasRole.toString()).to.be.equal(
        "true",
        "Backend wallet should have BE role in PookyMintEvent smart contract"
      );
    });

    it("Check contract addresses", async function () {
      let address = await pookyMintEventContract.pookyBall();
      expect(address).to.be.equal(
        pookyBallContract.address,
        "PookyBall contract address is not setted correctly inside PookyMintEvent contract"
      );

      address = await pookyGameContract.pookyBall();
      expect(address).to.be.equal(
        pookyBallContract.address,
        "PookyBall contract address is not setted correctly inside PookyMintEvent contract"
      );

      address = await pookyGameContract.pookySigner();
      expect(address).to.be.equal(
        await backendSigner.getAddress(),
        "Backend signer is not setted correctly inside PookyGame contract"
      );

      address = await pookyGameContract.pookToken();
      expect(address).to.be.equal(
        pokContract.address,
        "POK token address is not setted correctly inside PookyGame contract"
      );
    });
  });

  describe("POK token", function () {
    it("User without POOKY_CONTRACT role tries to mint random amount of POK tokens and fails", async function () {
      const randomAmount = generateRandomNumberWithUpperLimit(HUNDRED);

      await expect(
        pokContract
          .connect(player)
          .mint(await player.getAddress(), randomAmount)
      ).to.be.revertedWith(
        "AccessControl: account " +
          (await player.getAddress()).toLowerCase() +
          " is missing role " +
          ethers.utils.solidityKeccak256(["string"], ["POOKY_CONTRACT"])
      );
    });

    it("User without DEFAULT_ADMIN_ROLE role tries to enable/disable POK token transfer and fails", async function () {
      let enabled = true;

      await expect(
        pokContract.connect(player).setTransferEnabled(enabled)
      ).to.be.revertedWith(
        "AccessControl: account " +
          (await player.getAddress()).toLowerCase() +
          " is missing role " +
          DEFAULT_ADMIN_ROLE
      );

      enabled = false;

      await expect(
        pokContract.connect(player).setTransferEnabled(enabled)
      ).to.be.revertedWith(
        "AccessControl: account " +
          (await player.getAddress()).toLowerCase() +
          " is missing role " +
          DEFAULT_ADMIN_ROLE
      );
    });

    it("User with DEFAULT_ADMIN_ROLE successfully enables transfer", async function () {
      const tx = await pokContract.connect(deployer).setTransferEnabled(true);
      await tx.wait();

      const transferEnabled = await pokContract.transferEnabled();
      expect(transferEnabled.toString()).to.be.equal(
        "true",
        "Transfer is not enabled"
      );
    });
  });

  describe("PookyBall", function () {
    it("User without DEFAULT_ADMIN_ROLE role tries to set contract URI and fails", async function () {
      await expect(
        pookyBallContract.connect(player).setContractURI("Some random URI")
      ).to.be.revertedWith(
        "AccessControl: account " +
          (await player.getAddress()).toLowerCase() +
          " is missing role " +
          DEFAULT_ADMIN_ROLE
      );
    });

    it("User without POOKY_CONTRACT role tries to add ball pxp and fails", async function () {
      const randomBallId = generateRandomNumberWithUpperLimit(HUNDRED);
      const randomBallPxp = generateRandomNumberWithUpperLimit(HUNDRED);

      await expect(
        pookyBallContract
          .connect(player)
          .addBallPxp(randomBallId, randomBallPxp)
      ).to.be.revertedWith(
        "AccessControl: account " +
          (await player.getAddress()).toLowerCase() +
          " is missing role " +
          ethers.utils.solidityKeccak256(["string"], ["POOKY_CONTRACT"])
      );
    });

    it("User without POOKY_CONTRACT role tries to change ball level and fails", async function () {
      const randomBallId = generateRandomNumberWithUpperLimit(HUNDRED);
      const randomBallLevel = generateRandomNumberWithUpperLimit(HUNDRED);

      await expect(
        pookyBallContract
          .connect(player)
          .changeBallLevel(randomBallId, randomBallLevel)
      ).to.be.revertedWith(
        "AccessControl: account " +
          (await player.getAddress()).toLowerCase() +
          " is missing role " +
          ethers.utils.solidityKeccak256(["string"], ["POOKY_CONTRACT"])
      );
    });

    it("User without POOKY_CONTRACT role tries to mint ball with random rarity and fails", async function () {
      const randomBallRarity =
        generateRandomNumberWithUpperLimit(BALL_MAXIMUM_RARITY);

      await expect(
        pookyBallContract
          .connect(player)
          .mintWithRarity(await player.getAddress(), randomBallRarity)
      ).to.be.revertedWith(
        "AccessControl: account " +
          (await player.getAddress()).toLowerCase() +
          " is missing role " +
          ethers.utils.solidityKeccak256(["string"], ["POOKY_CONTRACT"])
      );
    });

    it("User without POOKY_CONTRACT role tries to mint ball with random rarity and random revokable timestamp and fails", async function () {
      const randomBallRarity =
        generateRandomNumberWithUpperLimit(BALL_MAXIMUM_RARITY);
      const randomRevokableTimestamp =
        generateRandomNumberWithUpperLimit(HUNDRED);

      await expect(
        pookyBallContract
          .connect(player)
          .mintWithRarityAndRevokableTimestamp(
            await player.getAddress(),
            randomBallRarity,
            randomRevokableTimestamp
          )
      ).to.be.revertedWith(
        "AccessControl: account " +
          (await player.getAddress()).toLowerCase() +
          " is missing role " +
          ethers.utils.solidityKeccak256(["string"], ["POOKY_CONTRACT"])
      );
    });

    it("User without POOKY_CONTRACT role tries to set ball entropy and fails", async function () {
      const randomBallId = generateRandomNumberWithUpperLimit(HUNDRED);
      const randomBallEntropy = generateRandomNumberWithUpperLimit(HUNDRED);

      await expect(
        pookyBallContract
          .connect(player)
          .setRandomEntropy(randomBallId, randomBallEntropy)
      ).to.be.revertedWith(
        "AccessControl: account " +
          (await player.getAddress()).toLowerCase() +
          " is missing role " +
          ethers.utils.solidityKeccak256(["string"], ["POOKY_CONTRACT"])
      );
    });

    it("User with DEFAULT_ADMIN_ROLE role successfully sets contract URI", async function () {
      const contractUriBefore = await pookyBallContract.contractUri();
      const URI = contractUriBefore + "Some random URI";

      const tx = await pookyBallContract.connect(deployer).setContractURI(URI);
      await tx.wait();

      const contractUriAfter = await pookyBallContract.contractURI();
      expect(contractUriAfter).to.be.equal(
        URI,
        "Contract URI is not setted correctly"
      );
    });
  });

  describe("PookyMintEvent", function () {
    it("User without MOD role tries to set address tier and fails", async function () {
      const randomTier = generateRandomNumberWithUpperLimit(HUNDRED);

      await expect(
        pookyMintEventContract
          .connect(player)
          .setAddressTier(await player.getAddress(), randomTier)
      ).to.be.revertedWith(
        "AccessControl: account " +
          (await player.getAddress()).toLowerCase() +
          " is missing role " +
          ethers.utils.solidityKeccak256(["string"], ["MOD"])
      );
    });

    it("User without MOD role tries to set minimum tier to buy and fails", async function () {
      const randomMinimumTier = generateRandomNumberWithUpperLimit(HUNDRED);

      await expect(
        pookyMintEventContract
          .connect(player)
          .setMinTierToBuy(randomMinimumTier)
      ).to.be.revertedWith(
        "AccessControl: account " +
          (await player.getAddress()).toLowerCase() +
          " is missing role " +
          ethers.utils.solidityKeccak256(["string"], ["MOD"])
      );
    });

    it("User without MOD role tries to set maximum balls per user and fails", async function () {
      const randomMaximumBallsPerUser =
        generateRandomNumberWithUpperLimit(HUNDRED);

      await expect(
        pookyMintEventContract
          .connect(player)
          .setMaxBallsPerUser(randomMaximumBallsPerUser)
      ).to.be.revertedWith(
        "AccessControl: account " +
          (await player.getAddress()).toLowerCase() +
          " is missing role " +
          ethers.utils.solidityKeccak256(["string"], ["MOD"])
      );
    });

    it("User without MOD role tries to set revoke period and fails", async function () {
      const randomRevokePeriod = generateRandomNumberWithUpperLimit(HUNDRED);

      await expect(
        pookyMintEventContract
          .connect(player)
          .setRevokePeriod(randomRevokePeriod)
      ).to.be.revertedWith(
        "AccessControl: account " +
          (await player.getAddress()).toLowerCase() +
          " is missing role " +
          ethers.utils.solidityKeccak256(["string"], ["MOD"])
      );
    });

    it("User without MOD role tries to set Vrf parameters and fails", async function () {
      await expect(
        pookyMintEventContract
          .connect(player)
          .setVrfParameters(
            await player.getAddress(),
            0, 
            0, 
            0, 
            ethers.utils.solidityKeccak256(
              ["string"],
              ["RANDOM_KEY_HASH"]
            )
          )
      ).to.be.revertedWith(
        "AccessControl: account " +
          (await player.getAddress()).toLowerCase() +
          " is missing role " +
          ethers.utils.solidityKeccak256(["string"], ["MOD"])
      );
    });

    it("User without MOD role tries to create mint template and fails", async function () {
      const mintTemplate = {
        canMint: true,
        rarity: ZERO.toString(),
        maxMints: HUNDRED.toString(),
        currentMints: ZERO.toString(),
        price: ethers.utils.parseEther(ONE.toString()),
        payingToken: pokContract.address,
      };

      await expect(
        pookyMintEventContract.connect(player).createMintTemplate(mintTemplate)
      ).to.be.revertedWith(
        "AccessControl: account " +
          (await player.getAddress()).toLowerCase() +
          " is missing role " +
          ethers.utils.solidityKeccak256(["string"], ["MOD"])
      );
    });

    it("User without MOD role tries to change mint template and fails", async function () {
      const randomTemplateId = generateRandomNumberWithUpperLimit(HUNDRED);

      await expect(
        pookyMintEventContract
          .connect(player)
          .changeMintTemplateCanMint(randomTemplateId, true)
      ).to.be.revertedWith(
        "AccessControl: account " +
          (await player.getAddress()).toLowerCase() +
          " is missing role " +
          ethers.utils.solidityKeccak256(["string"], ["MOD"])
      );

      await expect(
        pookyMintEventContract
          .connect(player)
          .changeMintTemplateCanMint(randomTemplateId, false)
      ).to.be.revertedWith(
        "AccessControl: account " +
          (await player.getAddress()).toLowerCase() +
          " is missing role " +
          ethers.utils.solidityKeccak256(["string"], ["MOD"])
      );
    });

    it("User without DEFAULT_ADMIN_ROLE role tries to set PookyBall contract address and fails", async function () {
      await expect(
        pookyMintEventContract
          .connect(player)
          .setPookyBallContract(await player.getAddress())
      ).to.be.revertedWith(
        "AccessControl: account " +
          (await player.getAddress()).toLowerCase() +
          " is missing role " +
          DEFAULT_ADMIN_ROLE
      );
    });

    it("User without BE role tries to mint balls authorized and fails", async function () {
      const randomNumberOfBalls = generateRandomNumberWithUpperLimit(HUNDRED);
      const randomMintTemplate = generateRandomNumberWithUpperLimit(HUNDRED);

      await expect(
        pookyMintEventContract
          .connect(player)
          .mintBallsAuthorized(
            await player.getAddress(),
            randomNumberOfBalls,
            randomMintTemplate
          )
      ).to.be.revertedWith(
        "AccessControl: account " +
          (await player.getAddress()).toLowerCase() +
          " is missing role " +
          ethers.utils.solidityKeccak256(["string"], ["BE"])
      );
    });

    it("User without BE role tries to revoke ball authorized and fails", async function () {
      const randomBallId = generateRandomNumberWithUpperLimit(HUNDRED);

      await expect(
        pookyMintEventContract
          .connect(player)
          .revokeBallAuthorized(randomBallId)
      ).to.be.revertedWith(
        "AccessControl: account " +
          (await player.getAddress()).toLowerCase() +
          " is missing role " +
          ethers.utils.solidityKeccak256(["string"], ["BE"])
      );
    });

    it("User with MOD role successfully sets minimum tier to buy", async function () {
      const randomMinimumTierToBuy =
        generateRandomNumberWithUpperLimit(HUNDRED);

      const tx = await pookyMintEventContract
        .connect(mod)
        .setMinTierToBuy(randomMinimumTierToBuy);
      await tx.wait();

      const minTierToBuy = await pookyMintEventContract.minTierToBuy();

      expect(minTierToBuy).to.be.equal(
        randomMinimumTierToBuy,
        "Minimum tier to buy is not setted successfully"
      );
    });

    it("User with MOD role successfully sets maximum balls per user", async function () {
      const randomMaximumBallsPerUser =
        generateRandomNumberWithUpperLimit(HUNDRED);

      const tx = await pookyMintEventContract
        .connect(mod)
        .setMaxBallsPerUser(randomMaximumBallsPerUser);
      await tx.wait();

      const maximumBallsPerUser =
        await pookyMintEventContract.maxBallsPerUser();

      expect(maximumBallsPerUser).to.be.equal(
        randomMaximumBallsPerUser,
        "Maximum balls per user is not setted successfully"
      );
    });

    it("User with MOD role successfully sets revoke period", async function () {
      const randomRevokePeriod = generateRandomNumberWithUpperLimit(HUNDRED);

      //Revoke period need to be a little bit bigger
      const tx = await pookyMintEventContract
        .connect(mod)
        .setRevokePeriod(randomRevokePeriod * HUNDRED);
      await tx.wait();

      const revokePeriod = await pookyMintEventContract.revokePeriod();

      expect(revokePeriod).to.be.equal(
        randomRevokePeriod * HUNDRED,
        "Revoke period is not setted successfully"
      );
    });

    it("User with MOD role successfully sets address tier", async function () {
      const randomAddressTierIncrement =
        generateRandomNumberWithUpperLimit(HUNDRED);
      const minTierToBuy = await pookyMintEventContract.minTierToBuy();
      const newAddressTier = minTierToBuy + randomAddressTierIncrement;

      const tx = await pookyMintEventContract
        .connect(mod)
        .setAddressTier(await player.getAddress(), newAddressTier);
      await tx.wait();

      const addressTierAfter = await pookyMintEventContract.userTiers(
        await player.getAddress()
      );

      expect(addressTierAfter).to.be.equal(
        newAddressTier,
        "Address tier is not setted successfully"
      );
    });

    it("User with MOD role successfully creates mint template", async function () {
      const templateNumberBefore =
        await pookyMintEventContract.lastMintTemplateId();

      let tx = await pookyMintEventContract.connect(mod).createMintTemplate({
        canMint: true,
        rarity: ZERO.toString(),
        maxMints: HUNDRED.toString(),
        currentMints: ZERO.toString(),
        price: ethers.utils.parseEther(ONE.toString()),
        payingToken: pokContract.address,
      });
      await tx.wait();

      const templateNumberAfter =
        await pookyMintEventContract.lastMintTemplateId();

      expect(templateNumberAfter).to.be.equal(
        templateNumberBefore.add(ONE),
        "Template not minted"
      );
    });

    it("User with MOD role successfully sets Vrf parameters", async function () {
      const VrfCoordinator = await ethers.getContractFactory(
        "VRFCoordinatorV2Mock"
      );
      vrfCoordinatorContract = await VrfCoordinator.deploy(
        ethers.utils.parseEther(ZERO.toString()),
        ethers.utils.parseEther(ZERO.toString())
      );

      let tx = await vrfCoordinatorContract.createSubscription();
      await tx.wait();

      tx = await vrfCoordinatorContract.addConsumer(
        ONE,
        pookyMintEventContract.address
      );
      await tx.wait();

      const randomGasLimitIncrement =
        generateRandomNumberWithUpperLimit(HUNDRED);
      const newCallbackGasLimit = GAS_LIMIT + randomGasLimitIncrement;

      const randomRequestConfirmations =
      generateRandomNumberWithUpperLimit(HUNDRED);

      const randomKeyHash = ethers.utils.solidityKeccak256(
        ["string"],
        ["RANDOM_KEY_HASH"]
      );

      tx = await pookyMintEventContract
        .connect(mod)
        .setVrfParameters(
          vrfCoordinatorContract.address,
          ONE,
          newCallbackGasLimit,
          randomRequestConfirmations,
          randomKeyHash
        );
      await tx.wait();

      expect(await pookyMintEventContract.vrf_coordinator()).to.be.equal(
        vrfCoordinatorContract.address,
        "Vrf Coordinator is not setted successfully"
      );
      expect(await pookyMintEventContract.vrf_subscriptionId()).to.be.equal(
        ONE,
        "Vrf Subscription Id is not setted successfully"
      );
      expect(await pookyMintEventContract.vrf_callbackGasLimit()).to.be.equal(
        newCallbackGasLimit,
        "Vrf Callback gas limit is not setted successfully"
      );
      expect(await pookyMintEventContract.vrf_requestConfirmations()).to.be.equal(
        randomRequestConfirmations,
        "Vrf request confirmations is not setted successfully"
      );
      expect(await pookyMintEventContract.vrf_keyHash()).to.be.equal(
        randomKeyHash,
        "Vrf key hash is not setted successfully"
      );

    });

    it("Mint ball fails due to small user tier", async function () {
      const numberOfBalls = ONE;
      const minTierToBuy = await pookyMintEventContract.minTierToBuy();
      const lastMintTemplateId =
        await pookyMintEventContract.lastMintTemplateId();
      const ballPrice = (
        await pookyMintEventContract.mintTemplates(lastMintTemplateId)
      ).price;

      let tx = await pookyMintEventContract
        .connect(mod)
        .setAddressTier(await player.getAddress(), minTierToBuy.sub(ONE));
      await tx.wait();

      await expect(
        pookyMintEventContract
          .connect(player)
          .mintBalls(numberOfBalls, lastMintTemplateId, {
            value: (ballPrice * numberOfBalls).toString(),
          })
      ).to.be.reverted;
    });

    it("Mint ball fails due to big number of balls wanted", async function () {
      const minTierToBuy = await pookyMintEventContract.minTierToBuy();
      const mintsLeft = await pookyMintEventContract.mintsLeft(
        await player.getAddress()
      );
      const numberOfBalls = mintsLeft.add(ONE);
      const lastMintTemplateId =
        await pookyMintEventContract.lastMintTemplateId();
      const ballPrice = (
        await pookyMintEventContract.mintTemplates(lastMintTemplateId)
      ).price;

      let tx = await pookyMintEventContract
        .connect(mod)
        .setAddressTier(await player.getAddress(), minTierToBuy.add(ONE));
      await tx.wait();

      await expect(
        pookyMintEventContract
          .connect(player)
          .mintBalls(numberOfBalls, lastMintTemplateId, {
            value: (ballPrice * numberOfBalls).toString(),
          })
      ).to.be.reverted;
    });

    it("Mint ball fails due to maximum mint supply break", async function () {
      const maxMintSupply = await pookyMintEventContract.maxMintSupply();
      const minTierToBuy = await pookyMintEventContract.minTierToBuy();
      const numberOfBalls = maxMintSupply.add(ONE);
      const lastMintTemplateId =
        await pookyMintEventContract.lastMintTemplateId();
      const ballPrice = (
        await pookyMintEventContract.mintTemplates(lastMintTemplateId)
      ).price;

      let tx = await pookyMintEventContract
        .connect(mod)
        .setAddressTier(await player.getAddress(), minTierToBuy.add(ONE));
      await tx.wait();

      await expect(
        pookyMintEventContract
          .connect(player)
          .mintBalls(numberOfBalls, lastMintTemplateId, {
            value: (ballPrice * numberOfBalls).toString(),
          })
      ).to.be.reverted;
    });

    it("Mint ball fails due to small value passed", async function () {
      const minTierToBuy = await pookyMintEventContract.minTierToBuy();
      const numberOfBalls = ONE;
      const lastMintTemplateId =
        await pookyMintEventContract.lastMintTemplateId();
      const ballPrice = (
        await pookyMintEventContract.mintTemplates(lastMintTemplateId)
      ).price;

      let tx = await pookyMintEventContract
        .connect(mod)
        .setAddressTier(await player.getAddress(), minTierToBuy.add(ONE));
      await tx.wait();

      await expect(
        pookyMintEventContract
          .connect(player)
          .mintBalls(numberOfBalls, lastMintTemplateId, {
            value: ethers.utils.parseEther(ZERO.toString()),
          })
      ).to.be.reverted;
    });

    it("User successfully mints ball", async function () {
      const numberOfBalls = ONE;
      const lastMintTemplateId =
        await pookyMintEventContract.lastMintTemplateId();

      const ballPrice = (
        await pookyMintEventContract.mintTemplates(lastMintTemplateId)
      ).price;

      const treasuryBalanceBeforeMint = await ethers.provider.getBalance(
        await treasury.getAddress()
      );

      const userBallanceOfBallsBefore = await pookyBallContract.balanceOf(
        await player.getAddress()
      );

      let tx = await pookyMintEventContract
        .connect(player)
        .mintBalls(numberOfBalls, lastMintTemplateId, {
          value: (numberOfBalls * ballPrice).toString(),
        });
      await tx.wait();

      let ballId =  await pookyBallContract.lastBallId();

      expect(await pookyBallContract.ownerOf(ballId)).to.be.equal(
        pookyMintEventContract.address
      );

      const randomEntropy = generateRandomNumberWithUpperLimit(HUNDRED);

      tx = await vrfCoordinatorContract.fulfillRandomWordsWithOverride(
        1,
        pookyMintEventContract.address,
        [randomEntropy]
      );
      await tx.wait();

      let ball = await pookyBallContract.getBallInfo(ballId);

      expect(ball.randomEntropy).to.be.equal(randomEntropy);

      expect(await pookyBallContract.ownerOf(ballId)).to.be.equal(
        await player.getAddress()
      );

      const treasuryBalanceAfterMint = await ethers.provider.getBalance(
        await treasury.getAddress()
      );

      const userBallanceOfBallsAfter = await pookyBallContract.balanceOf(
        await player.getAddress()
      );

      expect(treasuryBalanceAfterMint).to.be.equal(
        treasuryBalanceBeforeMint.add(ballPrice)
      );
      expect(userBallanceOfBallsAfter).to.be.equal(
        userBallanceOfBallsBefore.add(numberOfBalls)
      );
    });

    it("Check ball info", async function () {
      let ballId =  await pookyBallContract.lastBallId();

      expect(await pookyBallContract.getBallPxp(ballId)).to.be.equal(0);

      expect(await pookyBallContract.tokenURI(ballId)).to.be.equal(
        await pookyBallContract.baseUri() + ballId + ".json"
      );
    });

    it("User with BE role successfully mints ball authorized", async function () {
      const numberOfBalls = ONE;
      const lastMintTemplateId =
        await pookyMintEventContract.lastMintTemplateId();

      const userBallanceOfBallsBefore = await pookyBallContract.balanceOf(
        await player.getAddress()
      );

      let tx = await pookyMintEventContract
        .connect(backendSigner)
        .mintBallsAuthorized(
          await player.getAddress(),
          numberOfBalls,
          lastMintTemplateId
        );
      await tx.wait();

      const randomEntropy = generateRandomNumberWithUpperLimit(HUNDRED);
      tx = await vrfCoordinatorContract.fulfillRandomWordsWithOverride(
        2,
        pookyMintEventContract.address,
        [randomEntropy]
      );
      await tx.wait();

      const userBallanceOfBallsAfter = await pookyBallContract.balanceOf(
        await player.getAddress()
      );

      expect(userBallanceOfBallsAfter).to.be.equal(
        userBallanceOfBallsBefore.add(numberOfBalls)
      );
    });
  });

  describe("PookyGame", function () {
    it("matchweekClaim fails due false signature", async function () {
      const randomNonce = generateRandomNumberWithUpperLimit(HUNDRED);
      const randomAmount = generateRandomNumberWithUpperLimit(HUNDRED);
      const block = await ethers.provider.getBlock("latest");
      const currentTimestamp = block.timestamp;
      const randomTTLIncrement = generateRandomNumberWithUpperLimit(HUNDRED);
      const pookAmount = ethers.utils.parseEther(randomAmount.toString());

      const ballUpdates = {
        ballId: BigNumber.from(ONE),
        addPxp: ethers.utils.parseEther(HUNDRED.toString()),
        toLevelUp: false,
      };
      const ttl = currentTimestamp + randomTTLIncrement;
      const nonce = ethers.utils.parseEther(randomNonce.toString());

      const signature = await signMatchweekClaimMessage(
        pookAmount,
        [ballUpdates],
        BigNumber.from(ttl),
        nonce,
        deployer
      );

      await expect(
        pookyGameContract
          .connect(player)
          .matchweekClaim(pookAmount, [ballUpdates], ttl, nonce, signature)
      ).to.be.revertedWith("8");
    });

    it("matchweekClaim fails due to small time to live", async function () {
      const randomNonce = generateRandomNumberWithUpperLimit(HUNDRED);
      const randomAmount = generateRandomNumberWithUpperLimit(HUNDRED);
      const block = await ethers.provider.getBlock("latest");
      const currentTimestamp = block.timestamp;
      const randomTTLDecrement = generateRandomNumberWithUpperLimit(HUNDRED);
      const pookAmount = ethers.utils.parseEther(randomAmount.toString());

      const ballUpdates = {
        ballId: BigNumber.from(ONE),
        addPxp: ethers.utils.parseEther(HUNDRED.toString()),
        toLevelUp: false,
      };
      const ttl = currentTimestamp - randomTTLDecrement;
      const nonce = ethers.utils.parseEther(randomNonce.toString());

      const signature = await signMatchweekClaimMessage(
        pookAmount,
        [ballUpdates],
        BigNumber.from(ttl),
        nonce,
        backendSigner
      );

      await expect(
        pookyGameContract
          .connect(player)
          .matchweekClaim(pookAmount, [ballUpdates], ttl, nonce, signature)
      ).to.be.revertedWith("9");
    });

    it("matchweekClaim fails because caller is not ball owner", async function () {
      const randomNonce = generateRandomNumberWithUpperLimit(HUNDRED);
      const randomAmount = generateRandomNumberWithUpperLimit(HUNDRED);
      const block = await ethers.provider.getBlock("latest");
      const currentTimestamp = block.timestamp;
      const randomTTLIncrement = generateRandomNumberWithUpperLimit(HUNDRED);
      const pookAmount = ethers.utils.parseEther(randomAmount.toString());

      const ballUpdates = {
        ballId: BigNumber.from(ONE),
        addPxp: ethers.utils.parseEther(HUNDRED.toString()),
        toLevelUp: true,
      };
      const ttl = currentTimestamp + randomTTLIncrement;
      const nonce = ethers.utils.parseEther(randomNonce.toString());

      const signature = await signMatchweekClaimMessage(
        pookAmount,
        [ballUpdates],
        BigNumber.from(ttl),
        nonce,
        backendSigner
      );

      await expect(
        pookyGameContract
          .connect(deployer)
          .matchweekClaim(pookAmount, [ballUpdates], ttl, nonce, signature)
      ).to.be.revertedWith("5");
    });

    it("matchweekClaim fails due to not enough pxp to level up", async function () {
      const randomNonce = generateRandomNumberWithUpperLimit(HUNDRED);
      const randomAmount = generateRandomNumberWithUpperLimit(HUNDRED);
      const block = await ethers.provider.getBlock("latest");
      const currentTimestamp = block.timestamp;
      const randomTTLIncrement = generateRandomNumberWithUpperLimit(HUNDRED);
      const pookAmount = ethers.utils.parseEther(randomAmount.toString());
      const ballLevelBefore = await pookyBallContract.getBallLevel(ONE);
      const pxpNeededToLevelUp = await pookyGameContract.levelPxpNeeded(
        ballLevelBefore.add(ONE)
      );
      const ballUpdates = {
        ballId: BigNumber.from(ONE),
        addPxp: pxpNeededToLevelUp.sub(ONE),
        toLevelUp: true,
      };
      const ttl = currentTimestamp + randomTTLIncrement;
      const nonce = ethers.utils.parseEther(randomNonce.toString());

      const signature = await signMatchweekClaimMessage(
        pookAmount,
        [ballUpdates],
        BigNumber.from(ttl),
        nonce,
        backendSigner
      );
      let tx = await pokContract
        .connect(player)
        .approve(pookyGameContract.address, MAX_UINT);
      await tx.wait();

      await expect(
        pookyGameContract
          .connect(player)
          .matchweekClaim(pookAmount, [ballUpdates], ttl, nonce, signature)
      ).to.be.revertedWith("6");
    });

    it("matchweekClaim", async function () {
      const randomNonce = generateRandomNumberWithUpperLimit(HUNDRED);
      const randomAmount = generateRandomNumberWithUpperLimit(HUNDRED);
      const block = await ethers.provider.getBlock("latest");
      const currentTimestamp = block.timestamp;
      const randomTTLIncrement = generateRandomNumberWithUpperLimit(HUNDRED);
      const pookAmount = ethers.utils.parseEther(randomAmount.toString());
      const ballLevelBefore = await pookyBallContract.getBallLevel(ONE);
      const pxpNeededToLevelUp = await pookyGameContract.levelPxpNeeded(
        ballLevelBefore.add(ONE)
      );
      const ballUpdates = {
        ballId: BigNumber.from(ONE),
        addPxp: pxpNeededToLevelUp.add(ONE),
        toLevelUp: true,
      };
      const ttl = currentTimestamp + randomTTLIncrement;
      const nonce = ethers.utils.parseEther(randomNonce.toString());

      const signature = await signMatchweekClaimMessage(
        pookAmount,
        [ballUpdates],
        BigNumber.from(ttl),
        nonce,
        backendSigner
      );
      let tx = await pokContract
        .connect(player)
        .approve(pookyGameContract.address, MAX_UINT);
      await tx.wait();

      tx = await pookyGameContract
        .connect(player)
        .matchweekClaim(pookAmount, [ballUpdates], ttl, nonce, signature);
      await tx.wait();

      const ballLevelAfter = await pookyBallContract.getBallLevel(ONE);
      expect(ballLevelAfter).to.be.equal(ballLevelBefore.add(ONE));
      usedNonce = nonce;
    });

    it("matchweekClaim fails due to used nonce", async function () {
      const randomAmount = generateRandomNumberWithUpperLimit(HUNDRED);
      const block = await ethers.provider.getBlock("latest");
      const currentTimestamp = block.timestamp;
      const randomTTLDecrement = generateRandomNumberWithUpperLimit(HUNDRED);
      const pookAmount = ethers.utils.parseEther(randomAmount.toString());

      const ballUpdates = {
        ballId: BigNumber.from(ONE),
        addPxp: ethers.utils.parseEther(HUNDRED.toString()),
        toLevelUp: false,
      };
      const ttl = currentTimestamp - randomTTLDecrement;
      const nonce = usedNonce;

      const signature = await signMatchweekClaimMessage(
        pookAmount,
        [ballUpdates],
        BigNumber.from(ttl),
        nonce,
        backendSigner
      );

      await expect(
        pookyGameContract
          .connect(player)
          .matchweekClaim(pookAmount, [ballUpdates], ttl, nonce, signature)
      ).to.be.revertedWith("10");
    });

    it("Leveling up fails due to maximum level reach", async function () {
      const randomNonce = generateRandomNumberWithUpperLimit(HUNDRED);
      const block = await ethers.provider.getBlock("latest");
      const currentTimestamp = block.timestamp;
      const randomTTLIncrement = generateRandomNumberWithUpperLimit(HUNDRED);
      const ballLevel = await pookyBallContract.getBallLevel(ONE);

      let levelIterator = ballLevel.add(ONE);
      const maximumLevelForUncommonBall = BigNumber.from(
        MAXIMUM_UNCOMMON_BALL_LEVEL
      );
      let pxpNeeded = BigNumber.from(ZERO);
      let pookyAmount = BigNumber.from(ZERO);

      while (levelIterator.lte(maximumLevelForUncommonBall)) {
        const pxpNeededToLevelUp = await pookyGameContract.levelPxpNeeded(
          levelIterator
        );
        const currentlevelCost = await pookyGameContract.levelCost(
          levelIterator
        );
        pxpNeeded = pxpNeeded.add(pxpNeededToLevelUp);
        pookyAmount = pookyAmount.add(currentlevelCost);
        levelIterator = levelIterator.add(ONE);
      }

      const ballUpdates = {
        ballId: BigNumber.from(ONE),
        addPxp: pxpNeeded,
        toLevelUp: false,
      };
      const ttl = currentTimestamp + randomTTLIncrement;
      const nonce = ethers.utils.parseEther(randomNonce.toString());

      const signature = await signMatchweekClaimMessage(
        pookyAmount,
        [ballUpdates],
        BigNumber.from(ttl),
        nonce,
        backendSigner
      );

      let tx = await pookyGameContract
        .connect(player)
        .matchweekClaim(pookyAmount, [ballUpdates], ttl, nonce, signature);
      await tx.wait();

      for (let i = ballLevel; i < MAXIMUM_UNCOMMON_BALL_LEVEL; i++) {
        tx = await pookyGameContract.connect(player).levelUp(ONE);
        await tx.wait();
      }

      await expect(
        pookyGameContract.connect(player).levelUp(ONE)
      ).to.be.revertedWith("7");
    });
  });

  describe("Revoking Balls", function () {
    it("User fails to send ball while it is revokable", async function() {
      const ballId = await pookyMintEventContract.ballsMinted();
 
      await expect(
        pookyBallContract
          .connect(player)
          .transferFrom(await player.getAddress(), await mod.getAddress(), ballId)
      ).to.be.revertedWith("13");
    });

    it("User with BE role successfully revokes ball authorized", async function () {
      const ballBalanceBefore = await pookyBallContract.balanceOf(
        await player.getAddress()
      );

      const ballId = await pookyMintEventContract.ballsMinted();

      const tx = await pookyMintEventContract
        .connect(backendSigner)
        .revokeBallAuthorized(ballId);
      await tx.wait();

      const ballBalanceAfter = await pookyBallContract.balanceOf(
        await player.getAddress()
      );

      expect(ballBalanceAfter).to.be.equal(ballBalanceBefore.sub(ONE));
    });
  });

  describe("POK soulbound", function () {
    it("User is able to send POK while transfers enabled", async function() {
      await pokContract.connect(player).transfer(
        await mod.getAddress(),
        ethers.utils.parseEther("1")
      );

      expect(await pokContract.balanceOf(await mod.getAddress())).to.be.equal(
        ethers.utils.parseEther("1")
      );
    });

    it("User fails to send POK while not transferable", async function() {

      await pokContract.connect(deployer).setTransferEnabled(false);

      await expect(
        pokContract.connect(player).transfer(
          await mod.getAddress(),
          ethers.utils.parseEther("1")
        ))
      .to.be.revertedWith("11");
    });
  });
});
