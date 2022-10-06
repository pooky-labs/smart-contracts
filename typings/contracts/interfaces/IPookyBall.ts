/* Autogenerated file. Do not edit manually. */

/* tslint:disable */

/* eslint-disable */
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../../common";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";

export type BallInfoStruct = {
  rarity: PromiseOrValue<BigNumberish>;
  randomEntropy: PromiseOrValue<BigNumberish>;
  level: PromiseOrValue<BigNumberish>;
  pxp: PromiseOrValue<BigNumberish>;
  revokableUntilTimestamp: PromiseOrValue<BigNumberish>;
};

export type BallInfoStructOutput = [
  number,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber
] & {
  rarity: number;
  randomEntropy: BigNumber;
  level: BigNumber;
  pxp: BigNumber;
  revokableUntilTimestamp: BigNumber;
};

export interface IPookyBallInterface extends utils.Interface {
  functions: {
    "addBallPxp(uint256,uint256)": FunctionFragment;
    "changeBallLevel(uint256,uint256)": FunctionFragment;
    "getBallInfo(uint256)": FunctionFragment;
    "getBallLevel(uint256)": FunctionFragment;
    "getBallPxp(uint256)": FunctionFragment;
    "mintWithRarityAndRevokableTimestamp(address,uint8,uint256)": FunctionFragment;
    "revokeBall(uint256)": FunctionFragment;
    "setRandomEntropy(uint256,uint256)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "addBallPxp"
      | "changeBallLevel"
      | "getBallInfo"
      | "getBallLevel"
      | "getBallPxp"
      | "mintWithRarityAndRevokableTimestamp"
      | "revokeBall"
      | "setRandomEntropy"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "addBallPxp",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "changeBallLevel",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "getBallInfo",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "getBallLevel",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "getBallPxp",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "mintWithRarityAndRevokableTimestamp",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "revokeBall",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "setRandomEntropy",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]
  ): string;

  decodeFunctionResult(functionFragment: "addBallPxp", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "changeBallLevel",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getBallInfo",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getBallLevel",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getBallPxp", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "mintWithRarityAndRevokableTimestamp",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "revokeBall", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "setRandomEntropy",
    data: BytesLike
  ): Result;

  events: {};
}

export interface IPookyBall extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IPookyBallInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    addBallPxp(
      ballId: PromiseOrValue<BigNumberish>,
      addPxpAmount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    changeBallLevel(
      ballId: PromiseOrValue<BigNumberish>,
      newLevel: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    getBallInfo(
      ballId: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    getBallLevel(
      ballId: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    getBallPxp(
      ballId: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    mintWithRarityAndRevokableTimestamp(
      to: PromiseOrValue<string>,
      rarity: PromiseOrValue<BigNumberish>,
      revokableUntil: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    revokeBall(
      ballId: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    setRandomEntropy(
      ballId: PromiseOrValue<BigNumberish>,
      _randomEntropy: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  addBallPxp(
    ballId: PromiseOrValue<BigNumberish>,
    addPxpAmount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  changeBallLevel(
    ballId: PromiseOrValue<BigNumberish>,
    newLevel: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  getBallInfo(
    ballId: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  getBallLevel(
    ballId: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  getBallPxp(
    ballId: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  mintWithRarityAndRevokableTimestamp(
    to: PromiseOrValue<string>,
    rarity: PromiseOrValue<BigNumberish>,
    revokableUntil: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  revokeBall(
    ballId: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  setRandomEntropy(
    ballId: PromiseOrValue<BigNumberish>,
    _randomEntropy: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    addBallPxp(
      ballId: PromiseOrValue<BigNumberish>,
      addPxpAmount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    changeBallLevel(
      ballId: PromiseOrValue<BigNumberish>,
      newLevel: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    getBallInfo(
      ballId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BallInfoStructOutput>;

    getBallLevel(
      ballId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getBallPxp(
      ballId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    mintWithRarityAndRevokableTimestamp(
      to: PromiseOrValue<string>,
      rarity: PromiseOrValue<BigNumberish>,
      revokableUntil: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    revokeBall(
      ballId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    setRandomEntropy(
      ballId: PromiseOrValue<BigNumberish>,
      _randomEntropy: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    addBallPxp(
      ballId: PromiseOrValue<BigNumberish>,
      addPxpAmount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    changeBallLevel(
      ballId: PromiseOrValue<BigNumberish>,
      newLevel: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    getBallInfo(
      ballId: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    getBallLevel(
      ballId: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    getBallPxp(
      ballId: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    mintWithRarityAndRevokableTimestamp(
      to: PromiseOrValue<string>,
      rarity: PromiseOrValue<BigNumberish>,
      revokableUntil: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    revokeBall(
      ballId: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    setRandomEntropy(
      ballId: PromiseOrValue<BigNumberish>,
      _randomEntropy: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    addBallPxp(
      ballId: PromiseOrValue<BigNumberish>,
      addPxpAmount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    changeBallLevel(
      ballId: PromiseOrValue<BigNumberish>,
      newLevel: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    getBallInfo(
      ballId: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    getBallLevel(
      ballId: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    getBallPxp(
      ballId: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    mintWithRarityAndRevokableTimestamp(
      to: PromiseOrValue<string>,
      rarity: PromiseOrValue<BigNumberish>,
      revokableUntil: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    revokeBall(
      ballId: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    setRandomEntropy(
      ballId: PromiseOrValue<BigNumberish>,
      _randomEntropy: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
