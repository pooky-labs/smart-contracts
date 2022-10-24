import { getContractFromJsonDb } from '../lib/utils/DbHelper';
import { signRewardsClaim } from '../lib/utils/signRewardsClaim';
import waitTx from '../lib/waitTx';
import { POK, POKMock, PookyballGenesisMinter, PookyGame } from '../typings';
import { BallUpdatesStruct } from '../typings/contracts/PookyGame';
import { MintTemplateStruct } from '../typings/contracts/PookyballGenesisMinter';
import { BigNumber, Wallet } from 'ethers';
import { task } from 'hardhat/config';

// MOCK MINTS

task('mockPookMint', 'Mints mock pook token to address')
  .addPositionalParam('toAddress', 'address to mint')
  .addPositionalParam('amount', 'amount to mint')
  .setAction(async (taskArgs, hre) => {
    const POKMock = await getContractFromJsonDb<POKMock>('POKMock', hre);

    console.log('Mock minting', taskArgs.amount, 'to', taskArgs.toAddress);

    const amount = hre.ethers.utils.parseEther(taskArgs.amount);
    const receipt = await waitTx(POKMock.mock_mint(taskArgs.toAddress, amount));

    console.log(`Tx hash: ${receipt.transactionHash}`);
  });

task('createMintTemplate', 'Creates new mint template')
  .addPositionalParam('rarity', 'Minting ball with this rarity')
  .addPositionalParam('maxmints', 'Maximum number of mints')
  .addPositionalParam('price', 'Price of one mint')
  .setAction(async (params, hre) => {
    await hre.run('set-hre');

    const [, , , MOD] = await hre.ethers.getSigners();

    const PookyballGenesisMinter = await getContractFromJsonDb<PookyballGenesisMinter>('PookyballGenesisMinter', hre);
    const POK = await getContractFromJsonDb<POK>('POK', hre);

    console.log('Creating new mint template with specifications:');
    console.log('Rarity: ', params.rarity);
    console.log('Maximum mints: ', params.maxmints);
    console.log('Price: ', params.price);

    // Mint template with POOK as paying token
    const mintTemplate: MintTemplateStruct = {
      enabled: true,
      rarity: params.rarity,
      maxMints: params.maxmints,
      currentMints: 0,
      price: hre.ethers.utils.parseEther(params.price),
      payingToken: POK.address,
    };

    const tx = await PookyballGenesisMinter.connect(MOD).createMintTemplate(mintTemplate);
    await tx.wait();

    console.log(`Tx hash: ${tx.hash}`);
  });

task('changeMintTemplate', 'Change canMint option in mint template')
  .addPositionalParam('templateId', 'Id of template to change')
  .addPositionalParam('mintable', '0 for non mintable any other number for mintable')
  .setAction(async (params, hre) => {
    await hre.run('set-hre');

    const [, , , MOD] = await hre.ethers.getSigners();

    const PookyballGenesisMinter = await getContractFromJsonDb<PookyballGenesisMinter>('PookyballGenesisMinter', hre);
    await waitTx(PookyballGenesisMinter.connect(MOD).enableMintTemplate(params.templateId, Boolean(params.mintable)));

    console.log('Done');
  });

task('mintBall', 'Mint ball from mint template for given user')
  .addPositionalParam('templateNumber', 'MintTemplate id')
  .addPositionalParam('number', 'Number of balls')
  .setAction(async (params, hre) => {
    await hre.run('set-hre');
    const [, , , , player] = await hre.ethers.getSigners();

    const PookyballGenesisMinter = await getContractFromJsonDb<PookyballGenesisMinter>('PookyballGenesisMinter', hre);
    const template = await PookyballGenesisMinter.mintTemplates(parseInt(params.templateNumber) + 1);

    await waitTx(
      PookyballGenesisMinter.connect(player).mint(params.templateNumber, params.number, {
        value: template.price,
      }),
    );

    console.log('Minted');
  });

task('levelUpBall', 'Level up ball with given index')
  .addPositionalParam('tokenId', 'Ball index')
  .setAction(async (params, hre) => {
    await hre.run('set-hre');
    const [, , , , player] = await hre.ethers.getSigners();

    const PookyGame = await getContractFromJsonDb<PookyGame>('PookyGame', hre);
    await waitTx(PookyGame.connect(player).levelUp(params.tokenId));

    console.log('Done');
  });

task('mintBallsAuthorized', 'Backend signer mint balls for user')
  .addPositionalParam('recipient', 'Address of user')
  .addPositionalParam('templateId', 'Id of template to mint from')
  .addPositionalParam('amount', 'Number of balls to mint')
  .setAction(async (params, hre) => {
    await hre.run('set-hre');
    const [, backendSigner, , ,] = await hre.ethers.getSigners();

    const PookyballGenesisMinter = await getContractFromJsonDb<PookyballGenesisMinter>('PookyballGenesisMinter', hre);

    await waitTx(
      PookyballGenesisMinter.connect(backendSigner).mintAuthorized(params.recipient, params.templateId, params.amount),
    );

    console.log('Done');
  });

task('revokeBallAuthorized', 'Backend signer revokes ball')
  .addPositionalParam('ballId', 'ID of balls to revoke')
  .setAction(async (params, hre) => {
    await hre.run('set-hre');
    const [, backendSigner, , ,] = await hre.ethers.getSigners();

    const PookyballGenesisMinter = await getContractFromJsonDb<PookyballGenesisMinter>('PookyballGenesisMinter', hre);

    await waitTx(PookyballGenesisMinter.connect(backendSigner).revokeBallAuthorized(params.ballId));

    console.log('Done');
  });

task('claimRewards', 'Claim rewards').setAction(async (params, hre) => {
  await hre.run('set-hre');
  const [, , , , player] = await hre.ethers.getSigners();

  const PookyGame = await getContractFromJsonDb<PookyGame>('PookyGame', hre);

  const pookAmount = hre.ethers.utils.parseEther('10');
  const ballUpdates: BallUpdatesStruct = {
    tokenId: BigNumber.from(1),
    addPXP: hre.ethers.utils.parseEther('100'),
    shouldLevelUp: false,
  };
  const ttl = hre.ethers.utils.parseEther('9999999999999');
  const nonce = hre.ethers.utils.parseEther('8');

  const signature = await signRewardsClaim(
    pookAmount,
    [ballUpdates],
    ttl,
    nonce,
    new Wallet('0x8f282f032216244d71f32a6d967c3962b553bd7bf40e5adfd9bb9a6b5af54a67'),
  );

  await waitTx(PookyGame.connect(player).claimRewards(pookAmount, [ballUpdates], ttl, nonce, signature));

  console.log('Done');
});
