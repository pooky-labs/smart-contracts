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
  BytesLike,
  CallOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";

export interface ErrorsInterface extends utils.Interface {
  functions: {
    "CANT_TRNSFER_WHILE_REVOKABLE()": FunctionFragment;
    "FALSE_SIGNATURE()": FunctionFragment;
    "MAX_LEVEL_REACHED()": FunctionFragment;
    "MAX_MINTS_REACHED()": FunctionFragment;
    "MAX_MINTS_USER_REACHED()": FunctionFragment;
    "MAX_MINT_SUPPLY_REACHED()": FunctionFragment;
    "MINTING_DISABLED()": FunctionFragment;
    "MSG_VALUE_SMALL()": FunctionFragment;
    "MUST_BE_OWNER()": FunctionFragment;
    "NEEDS_BIGGER_TIER()": FunctionFragment;
    "NOT_ENOUGH_PXP()": FunctionFragment;
    "ONLY_MOD()": FunctionFragment;
    "ONLY_POOKY_CONTRACTS()": FunctionFragment;
    "ONLY_VRF_COORDINATOR()": FunctionFragment;
    "POK_TRANSFER_NOT_ENABLED()": FunctionFragment;
    "REVOKABLE_TIMESTAMP_PASSED()": FunctionFragment;
    "TOKEN_DOESNT_EXIST()": FunctionFragment;
    "TREASURY_TRANSFER_FAIL()": FunctionFragment;
    "TTL_PASSED()": FunctionFragment;
    "USED_NONCE()": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "CANT_TRNSFER_WHILE_REVOKABLE"
      | "FALSE_SIGNATURE"
      | "MAX_LEVEL_REACHED"
      | "MAX_MINTS_REACHED"
      | "MAX_MINTS_USER_REACHED"
      | "MAX_MINT_SUPPLY_REACHED"
      | "MINTING_DISABLED"
      | "MSG_VALUE_SMALL"
      | "MUST_BE_OWNER"
      | "NEEDS_BIGGER_TIER"
      | "NOT_ENOUGH_PXP"
      | "ONLY_MOD"
      | "ONLY_POOKY_CONTRACTS"
      | "ONLY_VRF_COORDINATOR"
      | "POK_TRANSFER_NOT_ENABLED"
      | "REVOKABLE_TIMESTAMP_PASSED"
      | "TOKEN_DOESNT_EXIST"
      | "TREASURY_TRANSFER_FAIL"
      | "TTL_PASSED"
      | "USED_NONCE"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "CANT_TRNSFER_WHILE_REVOKABLE",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "FALSE_SIGNATURE",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "MAX_LEVEL_REACHED",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "MAX_MINTS_REACHED",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "MAX_MINTS_USER_REACHED",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "MAX_MINT_SUPPLY_REACHED",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "MINTING_DISABLED",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "MSG_VALUE_SMALL",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "MUST_BE_OWNER",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "NEEDS_BIGGER_TIER",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "NOT_ENOUGH_PXP",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "ONLY_MOD", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "ONLY_POOKY_CONTRACTS",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "ONLY_VRF_COORDINATOR",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "POK_TRANSFER_NOT_ENABLED",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "REVOKABLE_TIMESTAMP_PASSED",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "TOKEN_DOESNT_EXIST",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "TREASURY_TRANSFER_FAIL",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "TTL_PASSED",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "USED_NONCE",
    values?: undefined
  ): string;

  decodeFunctionResult(
    functionFragment: "CANT_TRNSFER_WHILE_REVOKABLE",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "FALSE_SIGNATURE",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "MAX_LEVEL_REACHED",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "MAX_MINTS_REACHED",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "MAX_MINTS_USER_REACHED",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "MAX_MINT_SUPPLY_REACHED",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "MINTING_DISABLED",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "MSG_VALUE_SMALL",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "MUST_BE_OWNER",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "NEEDS_BIGGER_TIER",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "NOT_ENOUGH_PXP",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "ONLY_MOD", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "ONLY_POOKY_CONTRACTS",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "ONLY_VRF_COORDINATOR",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "POK_TRANSFER_NOT_ENABLED",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "REVOKABLE_TIMESTAMP_PASSED",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "TOKEN_DOESNT_EXIST",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "TREASURY_TRANSFER_FAIL",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "TTL_PASSED", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "USED_NONCE", data: BytesLike): Result;

  events: {};
}

export interface Errors extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: ErrorsInterface;

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
    CANT_TRNSFER_WHILE_REVOKABLE(overrides?: CallOverrides): Promise<[string]>;

    FALSE_SIGNATURE(overrides?: CallOverrides): Promise<[string]>;

    MAX_LEVEL_REACHED(overrides?: CallOverrides): Promise<[string]>;

    MAX_MINTS_REACHED(overrides?: CallOverrides): Promise<[string]>;

    MAX_MINTS_USER_REACHED(overrides?: CallOverrides): Promise<[string]>;

    MAX_MINT_SUPPLY_REACHED(overrides?: CallOverrides): Promise<[string]>;

    MINTING_DISABLED(overrides?: CallOverrides): Promise<[string]>;

    MSG_VALUE_SMALL(overrides?: CallOverrides): Promise<[string]>;

    MUST_BE_OWNER(overrides?: CallOverrides): Promise<[string]>;

    NEEDS_BIGGER_TIER(overrides?: CallOverrides): Promise<[string]>;

    NOT_ENOUGH_PXP(overrides?: CallOverrides): Promise<[string]>;

    ONLY_MOD(overrides?: CallOverrides): Promise<[string]>;

    ONLY_POOKY_CONTRACTS(overrides?: CallOverrides): Promise<[string]>;

    ONLY_VRF_COORDINATOR(overrides?: CallOverrides): Promise<[string]>;

    POK_TRANSFER_NOT_ENABLED(overrides?: CallOverrides): Promise<[string]>;

    REVOKABLE_TIMESTAMP_PASSED(overrides?: CallOverrides): Promise<[string]>;

    TOKEN_DOESNT_EXIST(overrides?: CallOverrides): Promise<[string]>;

    TREASURY_TRANSFER_FAIL(overrides?: CallOverrides): Promise<[string]>;

    TTL_PASSED(overrides?: CallOverrides): Promise<[string]>;

    USED_NONCE(overrides?: CallOverrides): Promise<[string]>;
  };

  CANT_TRNSFER_WHILE_REVOKABLE(overrides?: CallOverrides): Promise<string>;

  FALSE_SIGNATURE(overrides?: CallOverrides): Promise<string>;

  MAX_LEVEL_REACHED(overrides?: CallOverrides): Promise<string>;

  MAX_MINTS_REACHED(overrides?: CallOverrides): Promise<string>;

  MAX_MINTS_USER_REACHED(overrides?: CallOverrides): Promise<string>;

  MAX_MINT_SUPPLY_REACHED(overrides?: CallOverrides): Promise<string>;

  MINTING_DISABLED(overrides?: CallOverrides): Promise<string>;

  MSG_VALUE_SMALL(overrides?: CallOverrides): Promise<string>;

  MUST_BE_OWNER(overrides?: CallOverrides): Promise<string>;

  NEEDS_BIGGER_TIER(overrides?: CallOverrides): Promise<string>;

  NOT_ENOUGH_PXP(overrides?: CallOverrides): Promise<string>;

  ONLY_MOD(overrides?: CallOverrides): Promise<string>;

  ONLY_POOKY_CONTRACTS(overrides?: CallOverrides): Promise<string>;

  ONLY_VRF_COORDINATOR(overrides?: CallOverrides): Promise<string>;

  POK_TRANSFER_NOT_ENABLED(overrides?: CallOverrides): Promise<string>;

  REVOKABLE_TIMESTAMP_PASSED(overrides?: CallOverrides): Promise<string>;

  TOKEN_DOESNT_EXIST(overrides?: CallOverrides): Promise<string>;

  TREASURY_TRANSFER_FAIL(overrides?: CallOverrides): Promise<string>;

  TTL_PASSED(overrides?: CallOverrides): Promise<string>;

  USED_NONCE(overrides?: CallOverrides): Promise<string>;

  callStatic: {
    CANT_TRNSFER_WHILE_REVOKABLE(overrides?: CallOverrides): Promise<string>;

    FALSE_SIGNATURE(overrides?: CallOverrides): Promise<string>;

    MAX_LEVEL_REACHED(overrides?: CallOverrides): Promise<string>;

    MAX_MINTS_REACHED(overrides?: CallOverrides): Promise<string>;

    MAX_MINTS_USER_REACHED(overrides?: CallOverrides): Promise<string>;

    MAX_MINT_SUPPLY_REACHED(overrides?: CallOverrides): Promise<string>;

    MINTING_DISABLED(overrides?: CallOverrides): Promise<string>;

    MSG_VALUE_SMALL(overrides?: CallOverrides): Promise<string>;

    MUST_BE_OWNER(overrides?: CallOverrides): Promise<string>;

    NEEDS_BIGGER_TIER(overrides?: CallOverrides): Promise<string>;

    NOT_ENOUGH_PXP(overrides?: CallOverrides): Promise<string>;

    ONLY_MOD(overrides?: CallOverrides): Promise<string>;

    ONLY_POOKY_CONTRACTS(overrides?: CallOverrides): Promise<string>;

    ONLY_VRF_COORDINATOR(overrides?: CallOverrides): Promise<string>;

    POK_TRANSFER_NOT_ENABLED(overrides?: CallOverrides): Promise<string>;

    REVOKABLE_TIMESTAMP_PASSED(overrides?: CallOverrides): Promise<string>;

    TOKEN_DOESNT_EXIST(overrides?: CallOverrides): Promise<string>;

    TREASURY_TRANSFER_FAIL(overrides?: CallOverrides): Promise<string>;

    TTL_PASSED(overrides?: CallOverrides): Promise<string>;

    USED_NONCE(overrides?: CallOverrides): Promise<string>;
  };

  filters: {};

  estimateGas: {
    CANT_TRNSFER_WHILE_REVOKABLE(overrides?: CallOverrides): Promise<BigNumber>;

    FALSE_SIGNATURE(overrides?: CallOverrides): Promise<BigNumber>;

    MAX_LEVEL_REACHED(overrides?: CallOverrides): Promise<BigNumber>;

    MAX_MINTS_REACHED(overrides?: CallOverrides): Promise<BigNumber>;

    MAX_MINTS_USER_REACHED(overrides?: CallOverrides): Promise<BigNumber>;

    MAX_MINT_SUPPLY_REACHED(overrides?: CallOverrides): Promise<BigNumber>;

    MINTING_DISABLED(overrides?: CallOverrides): Promise<BigNumber>;

    MSG_VALUE_SMALL(overrides?: CallOverrides): Promise<BigNumber>;

    MUST_BE_OWNER(overrides?: CallOverrides): Promise<BigNumber>;

    NEEDS_BIGGER_TIER(overrides?: CallOverrides): Promise<BigNumber>;

    NOT_ENOUGH_PXP(overrides?: CallOverrides): Promise<BigNumber>;

    ONLY_MOD(overrides?: CallOverrides): Promise<BigNumber>;

    ONLY_POOKY_CONTRACTS(overrides?: CallOverrides): Promise<BigNumber>;

    ONLY_VRF_COORDINATOR(overrides?: CallOverrides): Promise<BigNumber>;

    POK_TRANSFER_NOT_ENABLED(overrides?: CallOverrides): Promise<BigNumber>;

    REVOKABLE_TIMESTAMP_PASSED(overrides?: CallOverrides): Promise<BigNumber>;

    TOKEN_DOESNT_EXIST(overrides?: CallOverrides): Promise<BigNumber>;

    TREASURY_TRANSFER_FAIL(overrides?: CallOverrides): Promise<BigNumber>;

    TTL_PASSED(overrides?: CallOverrides): Promise<BigNumber>;

    USED_NONCE(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    CANT_TRNSFER_WHILE_REVOKABLE(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    FALSE_SIGNATURE(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    MAX_LEVEL_REACHED(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    MAX_MINTS_REACHED(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    MAX_MINTS_USER_REACHED(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    MAX_MINT_SUPPLY_REACHED(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    MINTING_DISABLED(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    MSG_VALUE_SMALL(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    MUST_BE_OWNER(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    NEEDS_BIGGER_TIER(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    NOT_ENOUGH_PXP(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    ONLY_MOD(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    ONLY_POOKY_CONTRACTS(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    ONLY_VRF_COORDINATOR(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    POK_TRANSFER_NOT_ENABLED(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    REVOKABLE_TIMESTAMP_PASSED(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    TOKEN_DOESNT_EXIST(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    TREASURY_TRANSFER_FAIL(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    TTL_PASSED(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    USED_NONCE(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
