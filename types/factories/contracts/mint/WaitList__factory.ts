/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type {
  WaitList,
  WaitListInterface,
} from "../../../contracts/mint/WaitList";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "y",
        type: "uint256",
      },
    ],
    name: "ArgumentSizeMismatch",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "previousAdminRole",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "newAdminRole",
        type: "bytes32",
      },
    ],
    name: "RoleAdminChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleGranted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleRevoked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "tier",
        type: "uint256",
      },
    ],
    name: "TierSet",
    type: "event",
  },
  {
    inputs: [],
    name: "DEFAULT_ADMIN_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "OPERATOR",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
    ],
    name: "getRoleAdmin",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "grantRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "hasRole",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "renounceRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "revokeRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "accounts",
        type: "address[]",
      },
      {
        internalType: "uint256[]",
        name: "tiers_",
        type: "uint256[]",
      },
    ],
    name: "setBatch",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "tier",
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
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b50610afd806100206000396000f3fe608060405234801561001057600080fd5b506004361061009e5760003560e01c806391d148541161006657806391d148541461014d578063983d273714610160578063a217fddf14610187578063d32b95e61461018f578063d547741f146101a257600080fd5b806301ffc9a7146100a3578063248a9ca3146100cb5780632785f8bb146100fc5780632f2ff15d1461012557806336568abe1461013a575b600080fd5b6100b66100b1366004610739565b6101b5565b60405190151581526020015b60405180910390f35b6100ee6100d9366004610763565b60009081526020819052604090206001015490565b6040519081526020016100c2565b6100ee61010a366004610798565b6001600160a01b031660009081526001602052604090205490565b6101386101333660046107b3565b6101ec565b005b6101386101483660046107b3565b610216565b6100b661015b3660046107b3565b610299565b6100ee7f523a704056dcd17bcf83bed8b68c59416dac1119be77755efe3bde0a64e46e0c81565b6100ee600081565b61013861019d3660046108b5565b6102c2565b6101386101b03660046107b3565b610410565b60006001600160e01b03198216637965db0b60e01b14806101e657506301ffc9a760e01b6001600160e01b03198316145b92915050565b60008281526020819052604090206001015461020781610435565b6102118383610442565b505050565b6001600160a01b038116331461028b5760405162461bcd60e51b815260206004820152602f60248201527f416363657373436f6e74726f6c3a2063616e206f6e6c792072656e6f756e636560448201526e103937b632b9903337b91039b2b63360891b60648201526084015b60405180910390fd5b61029582826104c6565b5050565b6000918252602082815260408084206001600160a01b0393909316845291905290205460ff1690565b7f523a704056dcd17bcf83bed8b68c59416dac1119be77755efe3bde0a64e46e0c6102ec81610435565b815183511461031b578251825160405163990d9df760e01b815260048101929092526024820152604401610282565b60005b835181101561040a5782818151811061033957610339610975565b60200260200101516001600086848151811061035757610357610975565b60200260200101516001600160a01b03166001600160a01b031681526020019081526020016000208190555083818151811061039557610395610975565b60200260200101516001600160a01b03167f58ffae0baf944226215848ca67070a6dfb7d3693f5abd4a1a76285ea4230f1528483815181106103d9576103d9610975565b60200260200101516040516103f091815260200190565b60405180910390a280610402816109a1565b91505061031e565b50505050565b60008281526020819052604090206001015461042b81610435565b61021183836104c6565b61043f813361052b565b50565b61044c8282610299565b610295576000828152602081815260408083206001600160a01b03851684529091529020805460ff191660011790556104823390565b6001600160a01b0316816001600160a01b0316837f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a45050565b6104d08282610299565b15610295576000828152602081815260408083206001600160a01b0385168085529252808320805460ff1916905551339285917ff6391f5c32d9c69d2a47ea670b442974b53935d1edc7fd64eb21e047a839171b9190a45050565b6105358282610299565b6102955761054281610584565b61054d836020610596565b60405160200161055e9291906109de565b60408051601f198184030181529082905262461bcd60e51b825261028291600401610a53565b60606101e66001600160a01b03831660145b606060006105a5836002610a86565b6105b0906002610a9d565b67ffffffffffffffff8111156105c8576105c86107df565b6040519080825280601f01601f1916602001820160405280156105f2576020820181803683370190505b509050600360fc1b8160008151811061060d5761060d610975565b60200101906001600160f81b031916908160001a905350600f60fb1b8160018151811061063c5761063c610975565b60200101906001600160f81b031916908160001a9053506000610660846002610a86565b61066b906001610a9d565b90505b60018111156106e3576f181899199a1a9b1b9c1cb0b131b232b360811b85600f166010811061069f5761069f610975565b1a60f81b8282815181106106b5576106b5610975565b60200101906001600160f81b031916908160001a90535060049490941c936106dc81610ab0565b905061066e565b5083156107325760405162461bcd60e51b815260206004820181905260248201527f537472696e67733a20686578206c656e67746820696e73756666696369656e746044820152606401610282565b9392505050565b60006020828403121561074b57600080fd5b81356001600160e01b03198116811461073257600080fd5b60006020828403121561077557600080fd5b5035919050565b80356001600160a01b038116811461079357600080fd5b919050565b6000602082840312156107aa57600080fd5b6107328261077c565b600080604083850312156107c657600080fd5b823591506107d66020840161077c565b90509250929050565b634e487b7160e01b600052604160045260246000fd5b604051601f8201601f1916810167ffffffffffffffff8111828210171561081e5761081e6107df565b604052919050565b600067ffffffffffffffff821115610840576108406107df565b5060051b60200190565b600082601f83011261085b57600080fd5b8135602061087061086b83610826565b6107f5565b82815260059290921b8401810191818101908684111561088f57600080fd5b8286015b848110156108aa5780358352918301918301610893565b509695505050505050565b600080604083850312156108c857600080fd5b823567ffffffffffffffff808211156108e057600080fd5b818501915085601f8301126108f457600080fd5b8135602061090461086b83610826565b82815260059290921b8401810191818101908984111561092357600080fd5b948201945b83861015610948576109398661077c565b82529482019490820190610928565b9650508601359250508082111561095e57600080fd5b5061096b8582860161084a565b9150509250929050565b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052601160045260246000fd5b6000600182016109b3576109b361098b565b5060010190565b60005b838110156109d55781810151838201526020016109bd565b50506000910152565b7f416363657373436f6e74726f6c3a206163636f756e7420000000000000000000815260008351610a168160178501602088016109ba565b7001034b99036b4b9b9b4b733903937b6329607d1b6017918401918201528351610a478160288401602088016109ba565b01602801949350505050565b6020815260008251806020840152610a728160408501602087016109ba565b601f01601f19169190910160400192915050565b80820281158282048414176101e6576101e661098b565b808201808211156101e6576101e661098b565b600081610abf57610abf61098b565b50600019019056fea2646970667358221220324fa9defc9644886516282c3adc350f5bd49777d09b912700f3689807f6a7b364736f6c63430008110033";

type WaitListConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: WaitListConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class WaitList__factory extends ContractFactory {
  constructor(...args: WaitListConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<WaitList> {
    return super.deploy(overrides || {}) as Promise<WaitList>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): WaitList {
    return super.attach(address) as WaitList;
  }
  override connect(signer: Signer): WaitList__factory {
    return super.connect(signer) as WaitList__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): WaitListInterface {
    return new utils.Interface(_abi) as WaitListInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): WaitList {
    return new Contract(address, _abi, signerOrProvider) as WaitList;
  }
}
