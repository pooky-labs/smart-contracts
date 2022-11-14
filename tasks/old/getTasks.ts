import { getContractFromJsonDb } from '../../lib/utils/DbHelper';
import { Pookyball, PookyballGenesisMinter, PookyGame } from '../../typings';
import { task } from 'hardhat/config';

task('getMinTierToBuy', 'Gets minimum tier to mint ball').setAction(async (params, hre) => {
  await hre.run('set-hre');

  const PookyballGenesisMinter = await getContractFromJsonDb<PookyballGenesisMinter>('PookyballGenesisMinter', hre);
  const minTierToBuy = await PookyballGenesisMinter.minTierToBuy();

  console.log(`Min tier to buy is ${minTierToBuy}`);
});

task('getMaxBallsPerUser', 'Gets maximum balls per user').setAction(async (params, hre) => {
  await hre.run('set-hre');

  const PookyballGenesisMinter = await getContractFromJsonDb<PookyballGenesisMinter>('PookyballGenesisMinter', hre);
  const maxBalls = await PookyballGenesisMinter.maxBallsPerUser();

  console.log(`Maximum balls per user is ${hre.ethers.utils.formatEther(maxBalls)}`);
});

task('getMintsLeft', 'Gets mints left of player')
  .addPositionalParam('player', 'Player address')
  .setAction(async (params, hre) => {
    await hre.run('set-hre');

    const pookyMintEventContract = await getContractFromJsonDb<PookyballGenesisMinter>('PookyballGenesisMinter', hre);
    const mintLeft = await pookyMintEventContract.mintsLeft(params.player);

    console.log(`Number of mints left for player is ${hre.ethers.utils.formatEther(mintLeft)}`);
  });

task('getRevokePeriod', 'Gets revoke period').setAction(async (params, hre) => {
  await hre.run('set-hre');

  const pookyMintEventContract = await getContractFromJsonDb<PookyballGenesisMinter>('PookyballGenesisMinter', hre);
  const revokePeriod = await pookyMintEventContract.revokePeriod();

  console.log(`Revoke period is ${revokePeriod}`);
});

task('getAllMintTemplates', 'Prints all mint templates').setAction(async (params, hre) => {
  await hre.run('set-hre');

  const pookyMintEventContract = await getContractFromJsonDb<PookyballGenesisMinter>('PookyballGenesisMinter', hre);
  const numberOfTemplates = (await pookyMintEventContract.lastMintTemplateId()).toNumber();

  for (let i = 0; i < numberOfTemplates; i++) {
    const template = await pookyMintEventContract.mintTemplates(i + 1);
    console.log('');
    console.log('Template number ' + i);
    console.log(`enabled: ${template.enabled}`);
    console.log(`rarity: ${template.rarity}`);
    console.log(`maxMints: ${template.maxMints.toString()}`);
    console.log(`currentMints: ${template.currentMints.toString()}`);
    console.log(`price: ${template.price.toString()}`);
    console.log(`payingToken: ${template.payingToken}`);
  }
});

task('getPookyballContract', 'Gets Pookyball contract', async (taskArgs, hre) => {
  await hre.run('set-hre');

  const PookyballGenesisMinter = await getContractFromJsonDb<PookyballGenesisMinter>('PookyballGenesisMinter', hre);
  let pookyBallAddress = await PookyballGenesisMinter.pookyBall();
  console.log('Pooky ball contract address in PookyMintEvent contract is ' + pookyBallAddress);

  const PookyGame = await getContractFromJsonDb<PookyGame>('PookyGame', hre);
  pookyBallAddress = await PookyGame.pookyBall();
  console.log(`Pooky ball contract address in PookyGame contract is ${pookyBallAddress}`);
});

task('getPookySigner', 'Gets BE signer from Pookyball contract', async (taskArgs, hre) => {
  await hre.run('set-hre');

  const PookyGame = await getContractFromJsonDb<PookyGame>('PookyGame', hre);
  const pookySignerAddress = await PookyGame.pok();
  console.log('Pooky signer in PookyGame contract is ' + pookySignerAddress);
});

task('getPOKToken', 'Gets POK token address from PookyGame contract', async (taskArgs, hre) => {
  await hre.run('set-hre');

  const PookyGame = await getContractFromJsonDb<PookyGame>('PookyGame', hre);
  const pokTokenAddress = await PookyGame.pok();
  console.log('Pook Token address in PookyGame contract is ' + pokTokenAddress);
});

task('getBallInfo', 'Gets informations of ball')
  .addPositionalParam('index', 'Index of ball')
  .setAction(async (params, hre) => {
    await hre.run('set-hre');

    const Pookyball = await getContractFromJsonDb<Pookyball>('Pookyball', hre);
    const ballInfo = await Pookyball.getBallInfo(params.index);
    console.log(ballInfo);
  });

task('getPookyballContractUri', 'Gets contract URI from Pookyball contract').setAction(async (params, hre) => {
  await hre.run('set-hre');

  const Pookyball = await getContractFromJsonDb<Pookyball>('Pookyball', hre);
  const contractURI = await Pookyball.contractURI();
  console.log(`ContractURI for Pookyball is ${contractURI}`);
});

task('getPookyballBaseUri', 'Gets base URI from Pookyball contract').setAction(async (params, hre) => {
  await hre.run('set-hre');

  const Pookyball = await getContractFromJsonDb<Pookyball>('Pookyball', hre);
  const baseURI = await Pookyball.baseURI_();
  console.log(`BaseURI for Pookyball is ${baseURI}`);
});

task('getPookyballTokenUri', 'Gets token URI from Pookyball contract')
  .addPositionalParam('tokenId', 'Token index')
  .setAction(async (params, hre) => {
    await hre.run('set-hre');

    const Pookyball = await getContractFromJsonDb<Pookyball>('Pookyball', hre);
    const tokenURI = await Pookyball.tokenURI(params.tokenId);
    console.log(`TokenURI for Pookyball is ${tokenURI}`);
  });
