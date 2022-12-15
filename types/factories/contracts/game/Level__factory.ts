/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type { Level, LevelInterface } from "../../../contracts/game/Level";

const _abi = [
  {
    inputs: [
      {
        internalType: "contract IPOK",
        name: "_pok",
        type: "address",
      },
      {
        internalType: "contract IPookyball",
        name: "_pookyball",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "expected",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "actual",
        type: "uint256",
      },
    ],
    name: "InsufficientPOKBalance",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxLevel",
        type: "uint256",
      },
    ],
    name: "MaximumLevelReached",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "expected",
        type: "address",
      },
      {
        internalType: "address",
        name: "actual",
        type: "address",
      },
    ],
    name: "OwnershipRequired",
    type: "error",
  },
  {
    inputs: [],
    name: "PXP_BASE",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "PXP_DECIMALS",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "RATIO_DECIMALS",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "RATIO_POK",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "RATIO_PXP",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "level",
        type: "uint256",
      },
    ],
    name: "levelPOK",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "levels",
        type: "uint256",
      },
    ],
    name: "levelPOKCost",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "level",
        type: "uint256",
      },
    ],
    name: "levelPXP",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "levels",
        type: "uint256",
      },
    ],
    name: "levelUp",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "enum PookyballRarity",
        name: "",
        type: "uint8",
      },
    ],
    name: "maxLevels",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pok",
    outputs: [
      {
        internalType: "contract IPOK",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pookyball",
    outputs: [
      {
        internalType: "contract IPookyball",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60c060405234801561001057600080fd5b50604051610e51380380610e5183398101604081905261002f9161011e565b6001600160a01b0391821660a052166080526000602081905260287fad3228b676f7d3cd4284a5443f17f1962b36e491b30a40b2405849e597ba5fb555603c7fada5013122d395ba3c54772283fb069b10426056ef8ca54750cb9bb552a59e7d5560507f101e368776582e57ab3d116ffe2517c0a585cd5b23174b01e275c2d8329c3d835560647fabbb5caa7dda850e60932de0934eb1f9d0f59695050f761dc64e443e5030a56981905560049091527f52d75039926638d3c558b2bdefb945d5be8dae29dedd1c313212a4d472d9fde555610158565b6001600160a01b038116811461011b57600080fd5b50565b6000806040838503121561013157600080fd5b825161013c81610106565b602084015190925061014d81610106565b809150509250929050565b60805160a051610c966101bb6000396000818160be01528181610428015281816104b90152610627015260008181610102015281816101e2015281816102ca0152818161035b015281816106a60152818161072701526107d30152610c966000f3fe608060405234801561001057600080fd5b50600436106100b45760003560e01c806383f465701161007157806383f46570146101825780639980286414610195578063a83622e01461019d578063bef20e6b146101a5578063c75b44d4146101ae578063fb86af4c146101c157600080fd5b806305f197aa146100b957806310987683146100fd5780632bcc10bc146101245780635226dc9314610152578063540fda301461016757806373f239af1461016f575b600080fd5b6100e07f000000000000000000000000000000000000000000000000000000000000000081565b6040516001600160a01b0390911681526020015b60405180910390f35b6100e07f000000000000000000000000000000000000000000000000000000000000000081565b6101446101323660046109a4565b60006020819052908152604090205481565b6040519081526020016100f4565b6101656101603660046109c8565b6101c9565b005b610144610796565b61014461017d3660046109c8565b6107b0565b6101446101903660046109ea565b6108fb565b610144601281565b610144600381565b61014461043d81565b6101446101bc3660046109ea565b610967565b610144605a81565b60405163e3684e3960e01b8152600481018390526000907f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03169063e3684e399060240160a060405180830381865afa158015610231573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102559190610a03565b905060008282604001516102699190610aa0565b905060008060015b8581116102a95761028b8186604001516101909190610aa0565b6102959083610aa0565b9150806102a181610ab3565b915050610271565b506040516331a9108f60e11b81526004810187905233906001600160a01b037f00000000000000000000000000000000000000000000000000000000000000001690636352211e90602401602060405180830381865afa158015610311573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103359190610acc565b6001600160a01b031614610404576040516331a9108f60e11b81526004810187905286907f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031690636352211e90602401602060405180830381865afa1580156103aa573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103ce9190610acc565b604051634bdd6e6360e01b815260048101929092526001600160a01b031660248201523360448201526064015b60405180910390fd5b600061041087876107b0565b6040516370a0823160e01b81523360048201529091507f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316906370a0823190602401602060405180830381865afa158015610477573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061049b9190610af5565b81111561054e576040516370a0823160e01b815233600482015281907f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316906370a0823190602401602060405180830381865afa158015610508573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061052c9190610af5565b60405163a593377760e01b8152600481019290925260248201526044016103fb565b6000808660000151600481111561056757610567610b0e565b600481111561057857610578610b0e565b8152602001908152602001600020548411156105ec5786600080876000015160048111156105a8576105a8610b0e565b60048111156105b9576105b9610b0e565b815260200190815260200160002054604051633acd96f760e21b81526004016103fb929190918252602082015260400190565b818560600151111561060b578185606001516106089190610b24565b92505b604051632770a7eb60e21b8152336004820152602481018290527f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031690639dc29fac90604401600060405180830381600087803b15801561067357600080fd5b505af1158015610687573d6000803e3d6000fd5b505060405163b7cf12cf60e01b8152600481018a9052602481018690527f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316925063b7cf12cf9150604401600060405180830381600087803b1580156106f457600080fd5b505af1158015610708573d6000803e3d6000fd5b50506040516338549d9b60e11b8152600481018a9052602481018790527f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031692506370a93b369150604401600060405180830381600087803b15801561077557600080fd5b505af1158015610789573d6000803e3d6000fd5b5050505050505050505050565b6107a26012600a610c1b565b6107ad90603c610c27565b81565b60405163e3684e3960e01b81526004810183905260009081906001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000169063e3684e399060240160a060405180830381865afa15801561081a573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061083e9190610a03565b905060008060015b85811161089d576108608185604001516101909190610aa0565b61086a9084610aa0565b925061087f8185604001516101bc9190610aa0565b6108899083610aa0565b91508061089581610ab3565b915050610846565b50826060015182116108b35792506108f5915050565b6108bf6003600a610c1b565b605a8460600151846108d19190610b24565b6108db9190610c27565b6108e59190610c3e565b6108ef9082610aa0565b93505050505b92915050565b60008160000361090d57506000919050565b600061091b6012600a610c1b565b61092690603c610c27565b905060015b83811015610960576103e861094261043d84610c27565b61094c9190610c3e565b91508061095881610ab3565b91505061092b565b5092915050565b60006109756003600a610c1b565b605a610980846108fb565b61098a9190610c27565b6108f59190610c3e565b600581106109a157600080fd5b50565b6000602082840312156109b657600080fd5b81356109c181610994565b9392505050565b600080604083850312156109db57600080fd5b50508035926020909101359150565b6000602082840312156109fc57600080fd5b5035919050565b600060a08284031215610a1557600080fd5b60405160a0810181811067ffffffffffffffff82111715610a4657634e487b7160e01b600052604160045260246000fd5b6040528251610a5481610994565b80825250602083015160208201526040830151604082015260608301516060820152608083015160808201528091505092915050565b634e487b7160e01b600052601160045260246000fd5b808201808211156108f5576108f5610a8a565b600060018201610ac557610ac5610a8a565b5060010190565b600060208284031215610ade57600080fd5b81516001600160a01b03811681146109c157600080fd5b600060208284031215610b0757600080fd5b5051919050565b634e487b7160e01b600052602160045260246000fd5b818103818111156108f5576108f5610a8a565b600181815b80851115610b72578160001904821115610b5857610b58610a8a565b80851615610b6557918102915b93841c9390800290610b3c565b509250929050565b600082610b89575060016108f5565b81610b96575060006108f5565b8160018114610bac5760028114610bb657610bd2565b60019150506108f5565b60ff841115610bc757610bc7610a8a565b50506001821b6108f5565b5060208310610133831016604e8410600b8410161715610bf5575081810a6108f5565b610bff8383610b37565b8060001904821115610c1357610c13610a8a565b029392505050565b60006109c18383610b7a565b80820281158282048414176108f5576108f5610a8a565b600082610c5b57634e487b7160e01b600052601260045260246000fd5b50049056fea2646970667358221220ac2da51580090606f13382dbeef9636f0820c25dd2ac18eff5140a5c7f8bde4a64736f6c63430008110033";

type LevelConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: LevelConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class Level__factory extends ContractFactory {
  constructor(...args: LevelConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    _pok: PromiseOrValue<string>,
    _pookyball: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<Level> {
    return super.deploy(_pok, _pookyball, overrides || {}) as Promise<Level>;
  }
  override getDeployTransaction(
    _pok: PromiseOrValue<string>,
    _pookyball: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_pok, _pookyball, overrides || {});
  }
  override attach(address: string): Level {
    return super.attach(address) as Level;
  }
  override connect(signer: Signer): Level__factory {
    return super.connect(signer) as Level__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): LevelInterface {
    return new utils.Interface(_abi) as LevelInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): Level {
    return new Contract(address, _abi, signerOrProvider) as Level;
  }
}
