import { getContractFromJsonDb } from '../lib/utils/DbHelper';
import waitTx from '../lib/waitTx';
import { POK, Pookyball, PookyballGenesisMinter, PookyGame } from '../typings';
import { task } from 'hardhat/config';

task('setPookyballContract', 'Sets Pookyball contract', async (taskArgs, hre) => {
  await hre.run('set-hre');

  const Pookyball = await getContractFromJsonDb<Pookyball>('Pookyball', hre);
  const PookyballGenesisMinter = await getContractFromJsonDb<PookyballGenesisMinter>('PookyballGenesisMinter', hre);
  const PookyGame = await getContractFromJsonDb<PookyGame>('PookyGame', hre);

  await waitTx(PookyballGenesisMinter.setPookyballContract(Pookyball.address));
  await waitTx(PookyGame.setPookyballContract(Pookyball.address));

  console.log('Done');
});

task('setPOKToken', 'Sets POK token address', async (taskArgs, hre) => {
  await hre.run('set-hre');

  const POK = await getContractFromJsonDb<POK>('POK', hre);
  const PookyGame = await getContractFromJsonDb<PookyGame>('PookyGame', hre);

  await waitTx(PookyGame.setPOKContract(POK.address));

  console.log('Done');
});

task('setMinTierToBuy', 'Sets minimum tier to mint ball')
  .addPositionalParam('tier', 'Minimum tier')
  .setAction(async (params, hre) => {
    await hre.run('set-hre');
    const [, , , MOD] = await hre.ethers.getSigners();

    const PookyballGenesisMinter = await getContractFromJsonDb<PookyballGenesisMinter>('PookyballGenesisMinter', hre);
    await waitTx(PookyballGenesisMinter.connect(MOD).setMinTierToMint(hre.ethers.utils.parseEther(params.tier)));

    console.log('Done');
  });

task('setAddressTier', 'Sets minimum tier to mint ball')
  .addPositionalParam('player', 'Player number')
  .addPositionalParam('tier', 'Tier')
  .setAction(async (params, hre) => {
    await hre.run('set-hre');
    const [, , , MOD, player] = await hre.ethers.getSigners();

    const PookyballGenesisMinter = await getContractFromJsonDb<PookyballGenesisMinter>('PookyballGenesisMinter', hre);
    await waitTx(PookyballGenesisMinter.connect(MOD).setTierBatch([player.address], params.tier));

    console.log('Done');
  });

task('setMaxBallsPerUser', 'Sets maximum balls per user')
  .addPositionalParam('maximum', 'Maximum number')
  .setAction(async (params, hre) => {
    await hre.run('set-hre');
    const [, , , MOD] = await hre.ethers.getSigners();

    const PookyballGenesisMinter = await getContractFromJsonDb<PookyballGenesisMinter>('PookyballGenesisMinter', hre);
    await waitTx(PookyballGenesisMinter.connect(MOD).setMaxAccountMints(params.maximum));

    console.log('Done');
  });

task('setRevokePeriod', 'Sets revoke period')
  .addPositionalParam('period', 'Revoke period')
  .setAction(async (params, hre) => {
    await hre.run('set-hre');
    const [, , , MOD] = await hre.ethers.getSigners();

    const PookyballGenesisMinter = await getContractFromJsonDb<PookyballGenesisMinter>('PookyballGenesisMinter', hre);
    await waitTx(PookyballGenesisMinter.connect(MOD).setRevokePeriod(params.period));

    console.log('Done');
  });

task('setMaxBallLevel', 'Sets maximum ball level for every ball type').setAction(async (params, hre) => {
  await hre.run('set-hre');

  const PookyGame = await getContractFromJsonDb<PookyGame>('PookyGame', hre);
  await waitTx(PookyGame._setMaxBallLevel());

  console.log('Done');
});

task('setTransferEnabled', 'Sets transfer enabled on POK contract')
  .addPositionalParam('enabled', '0 to disable any other number to enable')
  .setAction(async (params, hre) => {
    await hre.run('set-hre');

    const POK = await getContractFromJsonDb<POK>('POK', hre);
    await waitTx(POK.setTransferEnabled(Boolean(params.enabled)));

    console.log('Done');
  });

task('setContractURI', 'Sets contract URI from Pookyball contract')
  .addPositionalParam('contractURI', 'ContractURI')
  .setAction(async (params, hre) => {
    await hre.run('set-hre');

    const Pookyball = await getContractFromJsonDb<Pookyball>('Pookyball', hre);
    await waitTx(Pookyball.setContractURI(params.contractURI));

    console.log('Done');
  });

task('setVrfSubscriptionId', 'Sets contract URI from Pookyball contract')
  .addPositionalParam('coordinator', 'VRF subscription id')
  .addPositionalParam('subscriptionID', 'VRF subscription id')
  .addPositionalParam('callbackGasLimit', 'VRF callback gas limit')
  .addPositionalParam('requestConfirmations', 'VRF request confirmations')
  .addPositionalParam('keyHash', 'VRF key hash')
  .setAction(async (params, hre) => {
    await hre.run('set-hre');
    const [, , , MOD] = await hre.ethers.getSigners();

    const PookyballGenesisMinter = await getContractFromJsonDb<PookyballGenesisMinter>('PookyballGenesisMinter', hre);

    await waitTx(
      PookyballGenesisMinter.connect(MOD).setVrfParameters(
        params.coordinator,
        params.subscriptionID,
        params.callbackGasLimit,
        params.requestConfirmations,
        params.keyHash,
      ),
    );

    console.log('Done');
  });
