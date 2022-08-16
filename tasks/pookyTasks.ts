
import { BigNumber, Wallet } from "ethers";
import { task } from "hardhat/config";
import { text } from "stream/consumers";

import {MOCK_POOK, POOKY_BALL_MINTER, MOCK_POOKY_BALL, POOKY_GAME} from "./contracts";
import { BallUpdates, signMatchweekClaimMessage } from "./helpers";

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


// PokyBall contract
task("getBallInfo", "Reads ball info from the contract")
    .addPositionalParam("ballId", "ball id")
    .setAction(async(taskArgs, hre) => {
        let mockPookyBall  = await hre.ethers.getContractAt(MOCK_POOKY_BALL.name, MOCK_POOKY_BALL.address);
        let ballInfo = await mockPookyBall.balls(taskArgs.ballId);
        let ballOwner = await mockPookyBall.ownerOf(taskArgs.ballId);

        console.log("Ball info id ", taskArgs.ballId);
        console.log(ballInfo);
        console.log("Owner: ", ballOwner);
    });

// PookyBallMinter contract
task("createMintTemplate", "Creates new mint template")
    .addPositionalParam("rarity", "Minting ball with this rarity")
    .addPositionalParam("maxMints", "Maximum number of mints")
    .addPositionalParam("price", "Price of one mint")
    .setAction(async (taskArgs, hre) => {

        let ballMinter = await hre.ethers.getContractAt(POOKY_BALL_MINTER.name, POOKY_BALL_MINTER.address);

        console.log("Creating new mint template with ball rarity", taskArgs.rarity, ", max mints", taskArgs.maxMints, ", price", taskArgs.price);

        // mint template with POOK as paying token
        let mintTemplate = {
            canMint: true,
            rarity: taskArgs.rarity,
            maxMints: taskArgs.maxMints,
            currentMints: 0,
            price: hre.ethers.utils.parseEther(taskArgs.price),
            payingToken: MOCK_POOK.address
        }

        let [deployer] = await hre.ethers.getSigners();

        let tx = await ballMinter.connect(deployer).createMintTemplate(mintTemplate);
        await tx.wait();

        console.log(`Tx hash: ${tx.hash}`);
    });

task("getMintTemplate", "Reads mint template status from the contract")
    .addPositionalParam("templateId", "mint template id")
    .setAction(async(taskArgs, hre) => {
        let ballMinter = await hre.ethers.getContractAt(POOKY_BALL_MINTER.name, POOKY_BALL_MINTER.address);
        let mintTemplate = await ballMinter.mintTemplates(taskArgs.templateId);

        console.log("Template with id ", taskArgs.templateId);
        console.log(mintTemplate);
    });

// hh mintFromTemplate 0x8a3c739351bdf9cfd18be05df02d84594b2d5b3c86f120d9fac0abbc55b0a0b5 2 --network mumbai

task("mintFromTemplate", "Mints from existing template")
    .addPositionalParam("userPK", "private key of sender")
    .addPositionalParam("templateId", "mint template id")
    .setAction(async(taskArgs, hre) => {
        let mockPook = await hre.ethers.getContractAt(MOCK_POOK.name, MOCK_POOK.address);
        let ballMinter = await hre.ethers.getContractAt(POOKY_BALL_MINTER.name, POOKY_BALL_MINTER.address);
        let user = new Wallet(taskArgs.userPK, hre.ethers.provider);

        console.log("Minting for user", user.address, ", templateId ", taskArgs.templateId);

        let tx_ap = await mockPook.connect(user).approve(ballMinter.address, hre.ethers.utils.parseEther("1000000"));
        await tx_ap.wait();

        let tx = await ballMinter.connect(user).mintFromTemplate(taskArgs.templateId);
        await tx.wait();

        console.log(`Tx hash: ${tx.hash}`);
    });
