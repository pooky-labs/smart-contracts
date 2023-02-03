import { BigNumber } from 'ethers';
import { sumBy } from 'lodash';
import { TemplateStruct } from '../../typechain-types/contracts/mint/GenesisMinter';
import Config from '../types/Config';
import PookyballLuxury from '../types/PookyballLuxury';
import PookyballRarity from '../types/PookyballRarity';

type Template = {
  rarity: PookyballRarity;
  luxury: PookyballLuxury.COMMON;
  supply: number;
  minted: number;
  price: BigNumber;
};

/**
 * Generate the Pooky Genesis Mint templates.
 */
export default function createTemplates(config: Config['mint']): TemplateStruct[] {
  const templates: Template[] = [
    {
      rarity: PookyballRarity.COMMON,
      luxury: PookyballLuxury.COMMON,
      supply: 0,
      minted: 0,
      price: BigNumber.from(config.pricing.base),
    },
    {
      rarity: PookyballRarity.RARE,
      luxury: PookyballLuxury.COMMON,
      supply: 0,
      minted: 0,
      price: BigNumber.from(0),
    },
    {
      rarity: PookyballRarity.EPIC,
      luxury: PookyballLuxury.COMMON,
      supply: 0,
      minted: 0,
      price: BigNumber.from(0),
    },
    {
      rarity: PookyballRarity.LEGENDARY,
      luxury: PookyballLuxury.COMMON,
      supply: config.supply.base,
      minted: 0,
      price: BigNumber.from(0),
    },
  ];

  // Compute the supplies
  templates[PookyballRarity.EPIC].supply = Math.floor(
    templates[PookyballRarity.LEGENDARY].supply * config.supply.multiplier,
  );
  templates[PookyballRarity.RARE].supply = Math.floor(
    templates[PookyballRarity.EPIC].supply * config.supply.multiplier,
  );
  templates[PookyballRarity.COMMON].supply = config.supply.total - sumBy(Object.values(templates), 'supply');

  // Compute the pricing
  templates[PookyballRarity.RARE].price = templates[PookyballRarity.COMMON].price.mul(config.pricing.multiplier);
  templates[PookyballRarity.EPIC].price = templates[PookyballRarity.RARE].price.mul(config.pricing.multiplier);
  templates[PookyballRarity.LEGENDARY].price = templates[PookyballRarity.EPIC].price.mul(config.pricing.multiplier);

  return templates;
}
