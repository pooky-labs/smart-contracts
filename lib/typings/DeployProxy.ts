import { BaseContract, ContractFactory } from 'ethers';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ContractWithInitialize<P extends any[] = any[]> extends BaseContract {
  initialize: (...args: P) => void;
}

export type InitializeArgs<C extends ContractWithInitialize> = Parameters<C['initialize']>;

export interface TypeContractFactory<C extends BaseContract = BaseContract> extends ContractFactory {
  deploy(): Promise<C>;
}
