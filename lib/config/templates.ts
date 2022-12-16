import PookyballLuxury from '../types/PookyballLuxury';
import PookyballRarity from '../types/PookyballRarity';
import parseEther from '../utils/parseEther';

/**
 * Contains the ball templates that will be sold during genesis mint.
 * Note: price and supply are subject to change before final mint.
 */
const templates = [
  {
    rarity: PookyballRarity.RARE,
    luxury: PookyballLuxury.COMMON,
    supply: 1688,
    price: parseEther(140),
  },
  {
    rarity: PookyballRarity.EPIC,
    luxury: PookyballLuxury.COMMON,
    supply: 367,
    price: parseEther(560),
  },
  {
    rarity: PookyballRarity.EPIC,
    luxury: PookyballLuxury.ALPHA,
    supply: 80,
    price: parseEther(1680),
  },
  {
    rarity: PookyballRarity.LEGENDARY,
    luxury: PookyballLuxury.COMMON,
    supply: 80,
    price: parseEther(2240),
  },
  {
    rarity: PookyballRarity.LEGENDARY,
    luxury: PookyballLuxury.ALPHA,
    supply: 20,
    price: parseEther(6720),
  },

  // Common balls takes the rest of the supply
  {
    rarity: PookyballRarity.COMMON,
    luxury: PookyballLuxury.COMMON,
    supply: null,
    price: parseEther(35),
  },
];

export default templates;
