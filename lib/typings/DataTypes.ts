import { POK, Pookyball, PookyballGenesisMinter, PookyGame } from '../../typings';
import { BaseContract, ContractFactory } from 'ethers';

export enum BallRarity {
  Common,
  Rare,
  Epic,
  Legendary,
  Mythic,
}

export enum BallLuxury {
  Common,
  Alpha,
}

export type ContractStack = {
  POK: POK;
  Pookyball: Pookyball;
  PookyballGenesisMinter: PookyballGenesisMinter;
  PookyGame: PookyGame;
};
