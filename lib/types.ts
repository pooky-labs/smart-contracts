import { POK, Pookyball, PookyballGenesisMinter, PookyGame } from '../typings';
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ContractWithInitialize<P extends any[] = any[]> extends BaseContract {
  initialize: (...args: P) => void;
}

export type InitializeArgs<C extends ContractWithInitialize> = Parameters<C['initialize']>;

export interface TypeContractFactory<C extends BaseContract = BaseContract> extends ContractFactory {
  deploy(): Promise<C>;
}

export type ContractStack = {
  POK: POK;
  Pookyball: Pookyball;
  PookyballGenesisMinter: PookyballGenesisMinter;
  PookyGame: PookyGame;
};
