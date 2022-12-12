import State from '../lib/state';
import { BallLuxury, BallRarity } from '../lib/typings/DataTypes';
import labelize from '../lib/utils/labelize';
import { PookyballMinter } from '../typings';
import { utils } from 'ethers';
import { task } from 'hardhat/config';
import range from 'lodash/range';

task('listMintTemplates', 'List the Pookyball mint templates').setAction(async (args, hre) => {
  const state = new State(hre.network.name);
  const PookyballMinter = state.connect('PookyballGenesisMinter', hre.ethers.provider);
  const lastMintTemplate = (await PookyballMinter.lastMintTemplateId()).toNumber();

  const raw: Awaited<ReturnType<PookyballMinter['mintTemplates']>>[] = await Promise.all(
    range(1, lastMintTemplate + 1).map((templateId) => PookyballMinter.mintTemplates(templateId)),
  );

  const templates = raw.map((r, i) => ({
    templateId: i + 1,
    enabled: r.enabled,
    rarity: labelize(BallRarity, r.rarity),
    luxury: labelize(BallLuxury, r.luxury),
    price: parseFloat(utils.formatEther(r.price)),
    maxMints: r.maxMints.toNumber(),
    currentMints: r.currentMints.toNumber(),
  }));

  console.table(templates);
});
