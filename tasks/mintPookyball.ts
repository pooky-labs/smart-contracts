import State from '../lib/state';
import { BallLuxury, BallRarity } from '../lib/typings/DataTypes';
import labelize from '../lib/utils/labelize';
import waitTx from '../lib/waitTx';
import { ethers } from 'ethers';
import { task } from 'hardhat/config';
import range from 'lodash/range';
import prompts from 'prompts';
import { format } from 'util';

task('mintPookyball', 'Mint a Pookyball to a specific address').setAction(async (args, hre) => {
  const [signer] = await hre.ethers.getSigners();
  const state = new State(hre.network.name);
  const PookyballGenesisMinter = state.connect('PookyballGenesisMinter', signer);

  const templateIds = range(1, (await PookyballGenesisMinter.lastMintTemplateId()).toNumber() + 1);
  const templates = await Promise.all(
    templateIds.map(async (i) => {
      const { enabled, luxury, price, rarity } = await PookyballGenesisMinter.mintTemplates(i);
      return {
        title: format(
          `Rarity: %s - Luxury: %s - %s MATIC`,
          labelize(BallRarity, rarity),
          labelize(BallLuxury, luxury),
          ethers.utils.formatEther(price),
        ),
        value: [i, price],
        disabled: !enabled,
      };
    }),
  );

  const answers = await prompts([
    {
      type: 'select',
      name: 'templateId',
      message: 'Choose template',
      choices: templates,
    },
    {
      type: 'text',
      name: 'recipient',
      message: 'Choose recipient',
      initial: signer.address,
    },
  ]);

  await waitTx(
    PookyballGenesisMinter.mintTo(answers.templateId[0], answers.recipient, 1, {
      value: answers.templateId[1],
    }),
  );
});
