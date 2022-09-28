import { task } from "hardhat/config";
import { getContractFromJsonDb } from "../helpers/DbHelper";

task(
  "setPookyBallContract",
  "Sets PookyBall contract",
  async (taskArgs, hre) => {
    await hre.run("set-hre");

    let pookyBallContract = await getContractFromJsonDb("PookyBall", hre);
    let pookyMintEventContract = await getContractFromJsonDb(
      "PookyMintEvent",
      hre
    );
    let pookyGameContract = await getContractFromJsonDb("PookyGame", hre);

    let tx = await pookyMintEventContract.setPookyBallContract(
      pookyBallContract.address
    );
    await tx.wait();

    tx = await pookyGameContract.setPookyBallContract(
      pookyBallContract.address
    );
    await tx.wait();

    console.log("Done");
  }
);

task("setPookySigner", "Sets BE signer", async (taskArgs, hre) => {
  await hre.run("set-hre");
  let [, backendSigner, , ,] = await hre.ethers.getSigners();
  let pookyGameContract = await getContractFromJsonDb("PookyGame", hre);

  let tx = await pookyGameContract.setPookySigner(backendSigner.address);
  await tx.wait();

  console.log("Done");
});

task("setPOKToken", "Sets POK token address", async (taskArgs, hre) => {
  await hre.run("set-hre");

  let pokContract = await getContractFromJsonDb("POK", hre);
  let pookyGameContract = await getContractFromJsonDb("PookyGame", hre);

  let tx = await pookyGameContract.setPookToken(pokContract.address);
  await tx.wait();

  console.log("Done");
});

task("setMinTierToBuy", "Sets minimum tier to mint ball")
  .addPositionalParam("tier", "Minimum tier")
  .setAction(async (params, hre) => {
    await hre.run("set-hre");
    let [, , , MOD, player] = await hre.ethers.getSigners();

    let pookyMintEventContract = await getContractFromJsonDb(
      "PookyMintEvent",
      hre
    );
    const tx = await pookyMintEventContract
      .connect(MOD)
      .setMinTierToBuy(hre.ethers.utils.parseEther(params.tier));
    await tx.wait();

    console.log("Done");
  });

task("setAddressTier", "Sets minimum tier to mint ball")
  .addPositionalParam("player", "Player number")
  .addPositionalParam("tier", "Tier")
  .setAction(async (params, hre) => {
    await hre.run("set-hre");
    let [, , , MOD, player] = await hre.ethers.getSigners();

    let pookyMintEventContract = await getContractFromJsonDb(
      "PookyMintEvent",
      hre
    );
    const tx = await pookyMintEventContract
      .connect(MOD)
      .setAddressTier(player.address, hre.ethers.utils.parseEther(params.tier));
    await tx.wait();

    console.log("Done");
  });

task("setMaxBallsPerUser", "Sets maximum balls per user")
  .addPositionalParam("maximum", "Maximum number")
  .setAction(async (params, hre) => {
    await hre.run("set-hre");
    let [, , , MOD] = await hre.ethers.getSigners();

    let pookyMintEventContract = await getContractFromJsonDb(
      "PookyMintEvent",
      hre
    );
    const tx = await pookyMintEventContract
      .connect(MOD)
      .setMaxBallsPerUser(hre.ethers.utils.parseEther(params.maximum));
    await tx.wait();

    console.log("Done");
  });

task("setRevokePeriod", "Sets revoke period")
  .addPositionalParam("period", "Revoke period")
  .setAction(async (params, hre) => {
    await hre.run("set-hre");
    let [, , , MOD] = await hre.ethers.getSigners();

    let pookyMintEventContract = await getContractFromJsonDb(
      "PookyMintEvent",
      hre
    );
    const tx = await pookyMintEventContract
      .connect(MOD)
      .setRevokePeriod(params.period);
    await tx.wait();

    console.log("Done");
  });

task("setLevelPxpNeeded", "Sets pxp needed for all levels").setAction(
  async (params, hre) => {
    await hre.run("set-hre");

    let pookyGameContract = await getContractFromJsonDb("PookyGame", hre);
    const tx = await pookyGameContract._setLevelPxpNeeded();
    await tx.wait();

    console.log("Done");
  }
);

task("setLevelCost", "Sets cost for all levels").setAction(
  async (params, hre) => {
    await hre.run("set-hre");

    let pookyGameContract = await getContractFromJsonDb("PookyGame", hre);
    const tx = await pookyGameContract._setLevelCost();
    await tx.wait();

    console.log("Done");
  }
);

task(
  "setMaxBallLevel",
  "Sets maximum ball level for every ball type"
).setAction(async (params, hre) => {
  await hre.run("set-hre");

  let pookyGameContract = await getContractFromJsonDb("PookyGame", hre);
  const tx = await pookyGameContract._setMaxBallLevel();
  await tx.wait();

  console.log("Done");
});

task("setTransferEnabled", "Sets transfer enabled on POK contract")
  .addPositionalParam("enabled", "0 to disable any other number to enable")
  .setAction(async (params, hre) => {
    await hre.run("set-hre");

    const enabled = params.enabled ? true : false;

    let pokContract = await getContractFromJsonDb("POK", hre);
    const tx = await pokContract.setTransferEnabled(enabled);
    await tx.wait();

    console.log("Done");
  });

task("setPookyBallUri", "Sets contract URI from PookyBall contract")
  .addPositionalParam("contractURI", "ContractURI")
  .setAction(async (params, hre) => {
    await hre.run("set-hre");

    let pookyBallContract = await getContractFromJsonDb("PookyBall", hre);
    const tx = await pookyBallContract.setContractURI(params.contractURI);
    await tx.wait();

    console.log("Done");
  });

task("setVrfSubscriptionId", "Sets contract URI from PookyBall contract")
  .addPositionalParam("subscriptionID", "VRF subscription id")
  .setAction(async (params, hre) => {
    await hre.run("set-hre");
    let [, , , MOD] = await hre.ethers.getSigners();

    let pookyMintEventContract = await getContractFromJsonDb(
      "PookyMintEvent",
      hre
    );

    const tx = await pookyMintEventContract
      .connect(MOD)
      .setVrfSubscriptionId(params.subscriptionID);
    await tx.wait();

    console.log("Done");
  });

task("setVrfCallbackGasLimit", "Sets contract URI from PookyBall contract")
  .addPositionalParam("callbackGasLimit", "VRF callback gas limit")
  .setAction(async (params, hre) => {
    await hre.run("set-hre");
    let [, , , MOD] = await hre.ethers.getSigners();

    let pookyMintEventContract = await getContractFromJsonDb(
      "PookyMintEvent",
      hre
    );
    const tx = await pookyMintEventContract
      .connect(MOD)
      .setVrfCallbackGasLimit(params.callbackGasLimit);
    await tx.wait();

    console.log("Done");
  });

task("setVrfRequestConfirmations", "Sets contract URI from PookyBall contract")
  .addPositionalParam("requestConfirmations", "VRF request confirmations")
  .setAction(async (params, hre) => {
    await hre.run("set-hre");
    let [, , , MOD] = await hre.ethers.getSigners();

    let pookyMintEventContract = await getContractFromJsonDb(
      "PookyMintEvent",
      hre
    );
    const tx = await pookyMintEventContract
      .connect(MOD)
      .setVrfRequestConfirmations(params.requestConfirmations);
    await tx.wait();

    console.log("Done");
  });

task("setVrfKeyHash", "Sets contract URI from PookyBall contract")
  .addPositionalParam("keyHash", "VRF key hash")
  .setAction(async (params, hre) => {
    await hre.run("set-hre");
    let [, , , MOD] = await hre.ethers.getSigners();

    let pookyMintEventContract = await getContractFromJsonDb(
      "PookyMintEvent",
      hre
    );
    const tx = await pookyMintEventContract
      .connect(MOD)
      .setVrfKeyHash(params.keyHash);
    await tx.wait();

    console.log("Done");
  });
