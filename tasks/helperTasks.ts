
import { task } from "hardhat/config";
import { Wallet } from "ethers";

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();

    for (const account of accounts) {
      console.log(account.address);
    }
});

task("createTestAccount", "Creates new wallet (use only for dev testing)", async (taskArgs, hre) => {
    let newWallet = hre.ethers.Wallet.createRandom();
    console.log("address: ", newWallet.address);
    console.log("private key: ", newWallet.privateKey);
});

task("sendNativeToken", "Sends native token (ETH/MATIC) from one to another address")
    .addPositionalParam("fromPK", "Private key from address")
    .addPositionalParam("toAddress", "address to send")
    .addPositionalParam("amount", "amount to send")
    .setAction(async (taskArgs, hre) => {
        let wallet = new Wallet(taskArgs.fromPK, hre.ethers.provider);

        console.log("Sending", taskArgs.amount, "from", wallet.address, "to", taskArgs.toAddress);
        const tx = await wallet.sendTransaction({  
            to: taskArgs.toAddress, 
            value: hre.ethers.utils.parseEther(taskArgs.amount)
        });
        await tx.wait();
        
        console.log(`Tx hash: ${tx.hash}`);
    });



