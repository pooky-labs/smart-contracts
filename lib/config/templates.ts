import { BallLuxury, BallRarity } from '../typings/DataTypes';
import parseEther from '../utils/parseEther';

/**
 * Contains the ball templates that will be sold during genesis mint.
 * Note: price and supply are subject to change before final mint.
 */
const templates = [
  {
    rarity: BallRarity.Rare,
    luxury: BallLuxury.Common,
    supply: 1688,
    price: parseEther(140),
  },
  {
    rarity: BallRarity.Epic,
    luxury: BallLuxury.Common,
    supply: 367,
    price: parseEther(560),
  },
  {
    rarity: BallRarity.Epic,
    luxury: BallLuxury.Alpha,
    supply: 80,
    price: parseEther(1680),
  },
  {
    rarity: BallRarity.Legendary,
    luxury: BallLuxury.Common,
    supply: 80,
    price: parseEther(2240),
  },
  {
    rarity: BallRarity.Legendary,
    luxury: BallLuxury.Alpha,
    supply: 20,
    price: parseEther(6720),
  },

  // Common balls takes the rest of the supply
  {
    rarity: BallRarity.Common,
    luxury: BallLuxury.Common,
    supply: null,
    price: parseEther(35),
  },
];

export default templates;
