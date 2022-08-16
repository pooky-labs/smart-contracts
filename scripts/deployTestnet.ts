import { ethers } from "hardhat";
import { deployContracts } from "./deployContracts";

async function main() {
    let [deployer, proxyAdmin, backendSigner] = await ethers.getSigners();

    let contracts : Contract[] = [
        {name: "MockPook", initValues: ["Pook Token test", "POOKtest"], address: ""},
        {name: "MockPookyBall", initValues: ["Pooky Ball test", "POOKY BALL test", "", ""], address: ""},
        {name: "PookyBallMinter", initValues: [], address: ""},
        {name: "PookyGame", initValues: [], address: ""}
    ];

    await deployContracts(contracts, true);

    console.log(contracts);

    // setPookyContracts
      console.log("Setting pooky contract addresses...");
      let Pook = await ethers.getContractFactory(contracts[0].name);
      let PookContract = Pook.attach(contracts[0].address);

      await PookContract.setPookyContract(contracts[2].address, true);
      await PookContract.setPookyContract(contracts[3].address, true);

      let PookyBall = await ethers.getContractFactory(contracts[1].name);
      let PookyBallContract = PookyBall.attach(contracts[1].address);

      await PookyBallContract.setPookyContract(contracts[2].address, true);
      await PookyBallContract.setPookyContract(contracts[3].address, true);

      console.log("Setting pooky contract addresses done")

    // init PookyBallMinter
      let PookyBallMinter = await ethers.getContractFactory(contracts[2].name);
      let PookyBallMinterContract = PookyBallMinter.attach(contracts[2].address);

      await PookyBallMinterContract.setPookyBallContract(contracts[1].address);
      console.log("Init PookyBallMinter done")

    // init PookyGame
      let PookyGame =  await ethers.getContractFactory(contracts[3].name);
      let PookyGameContract = PookyGame.attach(contracts[3].address);
      
      await PookyGameContract.setPookToken(contracts[0].address);
      await PookyGameContract.setPookyBallContract(contracts[1].address);
      await PookyGameContract.setPookySigner(backendSigner.address);
      console.log("Init PookyGame done");
}   

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
