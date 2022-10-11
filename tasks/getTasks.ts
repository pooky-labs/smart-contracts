import { getContractFromJsonDb } from '../lib/helpers/DbHelper';
import { PookyBall, PookyBallGenesisMinter, PookyGame } from '../typings';
import { task } from 'hardhat/config';

task('getMinTierToBuy', 'Gets minimum tier to mint ball').setAction(async (params, hre) => {
  await hre.run('set-hre');

  const PookyBallGenesisMinter = await getContractFromJsonDb<PookyBallGenesisMinter>('PookyBallGenesisMinter', hre);
  const minTierToBuy = await PookyBallGenesisMinter.minTierToBuy();

  console.log(`Min tier to buy is ${minTierToBuy}`);
});

task('getAddressTier', 'Gets tier for address')
  .addPositionalParam('player', 'Player address')
  .setAction(async (params, hre) => {
    await hre.run('set-hre');

    const PookyBallGenesisMinter = await getContractFromJsonDb<PookyBallGenesisMinter>('PookyBallGenesisMinter', hre);
    const tier = await PookyBallGenesisMinter.userTiers(params.player);

    console.log(tier);
  });

task('getMaxBallsPerUser', 'Gets maximum balls per user').setAction(async (params, hre) => {
  await hre.run('set-hre');

  const PookyBallGenesisMinter = await getContractFromJsonDb<PookyBallGenesisMinter>('PookyBallGenesisMinter', hre);
  const maxBalls = await PookyBallGenesisMinter.maxBallsPerUser();

  console.log(`Maximum balls per user is ${hre.ethers.utils.formatEther(maxBalls)}`);
});

task('getMintsLeft', 'Gets mints left of player')
  .addPositionalParam('player', 'Player address')
  .setAction(async (params, hre) => {
    await hre.run('set-hre');

    const pookyMintEventContract = await getContractFromJsonDb<PookyBallGenesisMinter>('PookyBallGenesisMinter', hre);
    const mintLeft = await pookyMintEventContract.mintsLeft(params.player);

    console.log(`Number of mints left for player is ${hre.ethers.utils.formatEther(mintLeft)}`);
  });

task('getRevokePeriod', 'Gets revoke period').setAction(async (params, hre) => {
  await hre.run('set-hre');

  const pookyMintEventContract = await getContractFromJsonDb<PookyBallGenesisMinter>('PookyBallGenesisMinter', hre);
  const revokePeriod = await pookyMintEventContract.revokePeriod();

  console.log(`Revoke period is ${revokePeriod}`);
});

task('getAllMintTemplates', 'Prints all mint templates').setAction(async (params, hre) => {
  await hre.run('set-hre');

  const pookyMintEventContract = await getContractFromJsonDb<PookyBallGenesisMinter>('PookyBallGenesisMinter', hre);
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

task('getPookyBallContract', 'Gets PookyBall contract', async (taskArgs, hre) => {
  await hre.run('set-hre');

  const PookyBallGenesisMinter = await getContractFromJsonDb<PookyBallGenesisMinter>('PookyBallGenesisMinter', hre);
  let pookyBallAddress = await PookyBallGenesisMinter.pookyBall();
  console.log('Pooky ball contract address in PookyMintEvent contract is ' + pookyBallAddress);

  const PookyGame = await getContractFromJsonDb<PookyGame>('PookyGame', hre);
  pookyBallAddress = await PookyGame.pookyBall();
  console.log(`Pooky ball contract address in PookyGame contract is ${pookyBallAddress}`);
});

task('getPookySigner', 'Gets BE signer from PookyBall contract', async (taskArgs, hre) => {
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

    const PookyBall = await getContractFromJsonDb<PookyBall>('PookyBall', hre);
    const ballInfo = await PookyBall.getBallInfo(params.index);
    console.log(ballInfo);
  });

task('getPookyBallContractUri', 'Gets contract URI from PookyBall contract').setAction(async (params, hre) => {
  await hre.run('set-hre');

  const PookyBall = await getContractFromJsonDb<PookyBall>('PookyBall', hre);
  const contractURI = await PookyBall.contractURI();
  console.log(`ContractURI for PookyBall is ${contractURI}`);
});

task('getPookyBallBaseUri', 'Gets base URI from PookyBall contract').setAction(async (params, hre) => {
  await hre.run('set-hre');

  const PookyBall = await getContractFromJsonDb<PookyBall>('PookyBall', hre);
  const baseURI = await PookyBall.baseURI_();
  console.log(`BaseURI for PookyBall is ${baseURI}`);
});

task('getPookyBallTokenUri', 'Gets token URI from PookyBall contract')
  .addPositionalParam('tokenId', 'Token index')
  .setAction(async (params, hre) => {
    await hre.run('set-hre');

    const PookyBall = await getContractFromJsonDb<PookyBall>('PookyBall', hre);
    const tokenURI = await PookyBall.tokenURI(params.tokenId);
    console.log(`TokenURI for PookyBall is ${tokenURI}`);
  });
