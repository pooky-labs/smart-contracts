import { getContractFromJsonDb } from '../lib/helpers/DbHelper';
import { task } from 'hardhat/config';

task('getMinTierToBuy', 'Gets minimum tier to mint ball').setAction(async (params, hre) => {
  await hre.run('set-hre');

  const pookyMintEventContract = await getContractFromJsonDb('PookyMintEvent', hre);
  const minTierToBuy = await pookyMintEventContract.minTierToBuy();

  console.log('Min tier to buy is ' + minTierToBuy);
});

task('getAddressTier', 'Gets tier for address')
  .addPositionalParam('player', 'Player number')
  .setAction(async (params, hre) => {
    await hre.run('set-hre');
    const [, , , , player] = await hre.ethers.getSigners();

    const pookyMintEventContract = await getContractFromJsonDb('PookyMintEvent', hre);
    const tier = await pookyMintEventContract.userTiers(player.address);

    console.log(tier);
  });

task('getMaxBallsPerUser', 'Gets maximum balls per user').setAction(async (params, hre) => {
  await hre.run('set-hre');

  const pookyMintEventContract = await getContractFromJsonDb('PookyMintEvent', hre);
  const maxBalls = await pookyMintEventContract.maxBallsPerUser();

  console.log('Maximum balls per user is ' + hre.ethers.utils.formatEther(maxBalls));
});

task('getMintsLeft', 'Gets mints left of player').setAction(async (params, hre) => {
  await hre.run('set-hre');
  const [, , , , player] = await hre.ethers.getSigners();

  const pookyMintEventContract = await getContractFromJsonDb('PookyMintEvent', hre);
  const mintLeft = await pookyMintEventContract.mintsLeft(player.address);

  console.log('Number of mints left for player is ' + hre.ethers.utils.formatEther(mintLeft));
});

task('getRevokePeriod', 'Gets revoke period').setAction(async (params, hre) => {
  await hre.run('set-hre');
  const [, , , MOD] = await hre.ethers.getSigners();

  const pookyMintEventContract = await getContractFromJsonDb('PookyMintEvent', hre);
  const revokePeriod = await pookyMintEventContract.revokePeriod();

  console.log('Revoke period is ' + revokePeriod);
});

task('getAllMintTemplates', 'Prints all mint templates').setAction(async (params, hre) => {
  await hre.run('set-hre');

  const pookyMintEventContract = await getContractFromJsonDb('PookyMintEvent', hre);
  const numberOfTemplates = await pookyMintEventContract.lastMintTemplateId();

  for (let i = 0; i < numberOfTemplates; i++) {
    const template = await pookyMintEventContract.mintTemplates(i + 1);
    console.log('');
    console.log('Template number ' + i);
    console.log('canMint: ' + template.canMint);
    console.log('rarity: ' + template.rarity);
    console.log('maxMints: ' + template.maxMints.toString());
    console.log('currentMints: ' + template.currentMints.toString());
    console.log('price: ' + template.price.toString());
    console.log('payingToken: ' + template.payingToken);
  }
});

task('getPookyBallContract', 'Gets PookyBall contract', async (taskArgs, hre) => {
  await hre.run('set-hre');

  const pookyMintEventContract = await getContractFromJsonDb('PookyMintEvent', hre);
  let pookyBallContractAddress = await pookyMintEventContract.pookyBall();
  console.log('Pooky ball contract address in PookyMintEvent contract is ' + pookyBallContractAddress);

  const pookyGameContract = await getContractFromJsonDb('PookyGame', hre);
  pookyBallContractAddress = await pookyGameContract.pookyBall();
  console.log('Pooky ball contract address in PookyGame contract is ' + pookyBallContractAddress);
});

task('getPookySigner', 'Gets BE signer from PookyBall contract', async (taskArgs, hre) => {
  await hre.run('set-hre');

  const pookyGameContract = await getContractFromJsonDb('PookyGame', hre);
  const pookySignerAddress = await pookyGameContract.pookySigner();
  console.log('Pooky signer in PookyGame contract is ' + pookySignerAddress);
});

task('getPOKToken', 'Gets POK token address from PookyGame contract', async (taskArgs, hre) => {
  await hre.run('set-hre');

  const pookyGameContract = await getContractFromJsonDb('PookyGame', hre);
  const pokTokenAddress = await pookyGameContract.pookToken();
  console.log('Pook Token address in PookyGame contract is ' + pokTokenAddress);
});

task('getBallInfo', 'Gets informations of ball')
  .addPositionalParam('index', 'Index of ball')
  .setAction(async (params, hre) => {
    await hre.run('set-hre');
    const [, , , , player] = await hre.ethers.getSigners();

    const pookyBallContract = await getContractFromJsonDb('PookyBall', hre);
    const ballInfo = await pookyBallContract.getBallInfo(params.index);
    console.log(ballInfo);
  });

task('getPookyBallContractUri', 'Gets contract URI from PookyBall contract').setAction(async (params, hre) => {
  await hre.run('set-hre');

  const pookyBallContract = await getContractFromJsonDb('PookyBall', hre);
  const contractURI = await pookyBallContract.contractURI();
  console.log('ContractURI for PookyBall is ' + contractURI);
});

task('getPookyBallBaseUri', 'Gets base URI from PookyBall contract').setAction(async (params, hre) => {
  await hre.run('set-hre');

  const pookyBallContract = await getContractFromJsonDb('PookyBall', hre);
  const baseURI = await pookyBallContract._baseURI();
  console.log('BaseURI for PookyBall is ' + baseURI);
});

task('getPookyBallTokenUri', 'Gets token URI from PookyBall contract')
  .addPositionalParam('tokenId', 'Token index')
  .setAction(async (params, hre) => {
    await hre.run('set-hre');

    const pookyBallContract = await getContractFromJsonDb('PookyBall', hre);
    const tokenURI = await pookyBallContract.tokenURI(params.tokenId);
    console.log('TokenURI for PookyBall is ' + tokenURI);
  });
