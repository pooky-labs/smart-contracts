import { BigNumber } from 'ethers';
import { sumBy } from 'lodash';
import { TemplateStruct } from '../../typechain-types/contracts/mint/GenesisSale';
import Config from '../types/Config';
import PookyballRarity from '../types/PookyballRarity';

type Template = {
  rarity: PookyballRarity;
  supply: number;
  minted: number;
  price: BigNumber;
};

const PRICING_BASE = 10_000;

/**
 * Generate the Pooky Genesis Mint templates.
 */
export default function createTemplates(config: Config['mint']): TemplateStruct[] {
  const templates: Template[] = [
    {
      rarity: PookyballRarity.COMMON,
      supply: 0,
      minted: 0,
      price: BigNumber.from(config.pricing.base),
    },
    {
      rarity: PookyballRarity.RARE,
      supply: 0,
      minted: 0,
      price: BigNumber.from(0),
    },
    {
      rarity: PookyballRarity.EPIC,
      supply: 0,
      minted: 0,
      price: BigNumber.from(0),
    },
    {
      rarity: PookyballRarity.LEGENDARY,
      supply: config.supply.base,
      minted: 0,
      price: BigNumber.from(0),
    },
  ];

  // Compute the supplies
  templates[PookyballRarity.EPIC].supply = templates[PookyballRarity.LEGENDARY].supply * config.supply.multiplier;
  templates[PookyballRarity.RARE].supply = templates[PookyballRarity.EPIC].supply * config.supply.multiplier;

  templates[PookyballRarity.EPIC].supply = Math.floor(templates[PookyballRarity.EPIC].supply);
  templates[PookyballRarity.RARE].supply = Math.floor(templates[PookyballRarity.RARE].supply);

  templates[PookyballRarity.COMMON].supply = config.supply.total - sumBy(Object.values(templates), 'supply');

  // Compute the pricing
  templates[PookyballRarity.RARE].price = templates[PookyballRarity.COMMON].price.mul(config.pricing.multiplier);
  templates[PookyballRarity.EPIC].price = templates[PookyballRarity.RARE].price.mul(config.pricing.multiplier);
  templates[PookyballRarity.LEGENDARY].price = templates[PookyballRarity.EPIC].price.mul(config.pricing.multiplier);

  // Apply the discount
  for (const [i] of templates.entries()) {
    templates[i].price = templates[i].price.mul(PRICING_BASE - config.pricing.discount).div(PRICING_BASE);
  }

  return templates;
}
