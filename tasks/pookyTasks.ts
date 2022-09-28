import { task } from "hardhat/config";
import { BigNumber, Wallet } from "ethers";
import { getContractFromJsonDb } from "../helpers/DbHelper";
import { HRE } from "./set-hre";
import { BallUpdates, signMatchweekClaimMessage } from "./helpers";
import {MOCK_POOK, POOKY_BALL_MINTER, MOCK_POOKY_BALL, POOKY_GAME} from "./contracts";

// MOCK MINTS

  task("mockPookMint", "Mints mock pook token to address")
    .addPositionalParam("toAddress", "address to mint")
    .addPositionalParam("amount", "amount to mint")
    .setAction(async (taskArgs, hre) => {
        let mockPook = await hre.ethers.getContractAt(MOCK_POOK.name, MOCK_POOK.address);

        console.log("Mock minting", taskArgs.amount, "to", taskArgs.toAddress);

        let amount = hre.ethers.utils.parseEther(taskArgs.amount);

        let tx = await mockPook.mock_mint(taskArgs.toAddress, amount);
        await tx.wait();

        console.log(`Tx hash: ${tx.hash}`);
    });



  task("createMintTemplate", "Creates new mint template")
    .addPositionalParam("rarity", "Minting ball with this rarity")
    .addPositionalParam("maxmints", "Maximum number of mints")
    .addPositionalParam("price", "Price of one mint")
    .setAction(async (params, hre) => {
      await hre.run("set-hre");
  
      let [, , , MOD] = await hre.ethers.getSigners();
  
      let pookyMintEventContract = await getContractFromJsonDb(
        "PookyMintEvent",
        hre
      );
      let pokToken = await getContractFromJsonDb("POK", hre);
  
      console.log("Creating new mint template with specificatons:");
      console.log("Rarity: ", params.rarity);
      console.log("Maximum mints: ", params.maxmints);
      console.log("Price: ", params.price);
  
      //Mint template with POOK as paying token
      let mintTemplate = {
        canMint: true,
        rarity: params.rarity,
        maxMints: params.maxmints,
        currentMints: 0,
        price: hre.ethers.utils.parseEther(params.price),
        payingToken: pokToken.address,
      };
  
      let tx = await pookyMintEventContract
        .connect(MOD)
        .createMintTemplate(mintTemplate);
      await tx.wait();
  
      console.log(`Tx hash: ${tx.hash}`);
    });
  
  task("changeMintTemplate", "Change canMint option in mint template")
    .addPositionalParam("templateId", "Id of template to change")
    .addPositionalParam(
      "mintable",
      "0 for non mintable any other number for mintable"
    )
    .setAction(async (params, hre) => {
      await hre.run("set-hre");
  
      let [, , , MOD] = await hre.ethers.getSigners();
      const mintable = params.mintable ? true : false;
  
      let pookyMintEventContract = await getContractFromJsonDb(
        "PookyMintEvent",
        hre
      );
      const tx = await pookyMintEventContract
        .connect(MOD)
        .changeMintTemplateCanMint(params.templateId, mintable);
      await tx.wait();
  
      console.log("Done");
    });
  
  task("mintBall", "Mint ball from mint template for given user")
    .addPositionalParam("number", "Number of balls")
    .addPositionalParam("templateNumber", "Template idex")
    .setAction(async (params, hre) => {
      await hre.run("set-hre");
      let [, , , , player] = await hre.ethers.getSigners();
  
      let pookyMintEventContract = await getContractFromJsonDb(
        "PookyMintEvent",
        hre
      );
      const template = await pookyMintEventContract.mintTemplates(
        parseInt(params.templateNumber) + 1
      );
  
      const tx = await pookyMintEventContract
        .connect(player)
        .mintBalls(params.number, params.templateNumber, {
          value: template.price,
        });
      await tx.wait();
  
      console.log("Minted");
    });
  
  task("levelUpBall", "Level up ball with given index")
    .addPositionalParam("index", "Ball index")
    .setAction(async (params, hre) => {
      await hre.run("set-hre");
      let [, , , , player] = await hre.ethers.getSigners();
      const MAX_UINT =
        "1157920892373161954235709850086879078532699846656405640394";
  
      let pookyGameContract = await getContractFromJsonDb("PookyGame", hre);
      let pookContract = await getContractFromJsonDb("POK", hre);
  
      let tx = await pookContract
        .connect(player)
        .approve(pookyGameContract.address, MAX_UINT);
      await tx.wait();
  
      tx = await pookyGameContract.connect(player).levelUp(params.index);
      await tx.wait();
  
      console.log("Done");
    });
  
  task("mintBallsAuthorized", "Backend signer mint balls for user")
    .addPositionalParam("user", "Address of user")
    .addPositionalParam("numberOfBalls", "Number of balls to mint")
    .addPositionalParam("templateId", "Id of template to mint from")
    .setAction(async (params, hre) => {
      await hre.run("set-hre");
      let [, backendSigner, , ,] = await hre.ethers.getSigners();
  
      let pookyMintEventContract = await getContractFromJsonDb(
        "PookyMintEvent",
        hre
      );
  
      const tx = await pookyMintEventContract
        .connect(backendSigner)
        .mintBallsAuthorized(
          params.user,
          params.numberOfBalls,
          params.templateId
        );
      await tx.wait();
  
      console.log("Done");
    });
  
  task("revokeBallAuthorized", "Backend signer revokes ball")
    .addPositionalParam("ballId", "ID of balls to revoke")
    .setAction(async (params, hre) => {
      await hre.run("set-hre");
      let [, backendSigner, , ,] = await hre.ethers.getSigners();
  
      let pookyMintEventContract = await getContractFromJsonDb(
        "PookyMintEvent",
        hre
      );
  
      const tx = await pookyMintEventContract
        .connect(backendSigner)
        .revokeBallAuthorized(params.ballId);
      await tx.wait();
  
      console.log("Done");
    });
  
  task("matchweekClaim", "Level up ball with given index").setAction(
    async (params, hre) => {
      await hre.run("set-hre");
      let [deployer, backendSigner, , , player] = await hre.ethers.getSigners();
  
      const pookyGameContract = await getContractFromJsonDb("PookyGame", hre);
  
      const pookAmount = hre.ethers.utils.parseEther("10");
      const ballUpdates: BallUpdates = {
        ballId: BigNumber.from(1),
        addPxp: hre.ethers.utils.parseEther("100"),
        toLevelUp: false,
      };
      const ttl = hre.ethers.utils.parseEther("9999999999999");
      const nonce = hre.ethers.utils.parseEther("8");
  
      const signature = await signMatchweekClaimMessage(
        pookAmount,
        [ballUpdates],
        ttl,
        nonce,
        new Wallet(
          "0x8f282f032216244d71f32a6d967c3962b553bd7bf40e5adfd9bb9a6b5af54a67"
        )
      );
  
      const tx = await pookyGameContract
        .connect(player)
        .matchweekClaim(pookAmount, [ballUpdates], ttl, nonce, signature);
      await tx.wait();
  
      console.log("Done");
    }
  );
  
  task("grantRoles", "Grant all necessary roles to all contracts").setAction(
    async (params, hre) => {
      await hre.run("set-hre");
      console.log(hre.network.name);
      let [, backendSigner, , MOD] = await hre.ethers.getSigners();
  
      let pokContract = await getContractFromJsonDb("POK", hre);
      let pookyBallContract = await getContractFromJsonDb("PookyBall", hre);
      let pookyMintEventContract = await getContractFromJsonDb(
        "PookyMintEvent",
        hre
      );
      let pookyGameContract = await getContractFromJsonDb("PookyGame", hre);
  
      await (
        await pokContract.functions.grantRole(
          hre.ethers.utils.solidityKeccak256(["string"], ["POOKY_CONTRACT"]),
          pookyMintEventContract.address
        )
      ).wait();
  
      await (
        await pokContract.grantRole(
          hre.ethers.utils.solidityKeccak256(["string"], ["POOKY_CONTRACT"]),
          pookyGameContract.address
        )
      ).wait();
  
      await (
        await pookyBallContract.grantRole(
          hre.ethers.utils.solidityKeccak256(["string"], ["POOKY_CONTRACT"]),
          pookyMintEventContract.address
        )
      ).wait();
  
      await (
        await pookyBallContract.grantRole(
          hre.ethers.utils.solidityKeccak256(["string"], ["POOKY_CONTRACT"]),
          pookyGameContract.address
        )
      ).wait();
  
      await (
        await pookyMintEventContract.grantRole(
          hre.ethers.utils.solidityKeccak256(["string"], ["BE"]),
          backendSigner.address
        )
      ).wait();
  
      await (
        await pookyMintEventContract.grantRole(
          hre.ethers.utils.solidityKeccak256(["string"], ["MOD"]),
          MOD.address
        )
      ).wait();
  
      console.log("Done");
    }
  );
  