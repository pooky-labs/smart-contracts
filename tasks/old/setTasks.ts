import { getContractFromJsonDb } from '../../lib/utils/DbHelper';
import waitTx from '../../lib/waitTx';
import { Pookyball, PookyballGenesisMinter } from '../../typings';
import { task } from 'hardhat/config';

task('setMinTierToBuy', 'Sets minimum tier to mint ball')
  .addPositionalParam('tier', 'Minimum tier')
  .setAction(async (params, hre) => {
    await hre.run('set-hre');
    const [, , , MOD] = await hre.ethers.getSigners();

    const PookyballGenesisMinter = await getContractFromJsonDb<PookyballGenesisMinter>('PookyballGenesisMinter', hre);
    await waitTx(PookyballGenesisMinter.connect(MOD).setMinTierToMint(hre.ethers.utils.parseEther(params.tier)));

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
