/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type {
  Rewards,
  RewardsInterface,
} from "../../../contracts/game/Rewards";

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
    name: "InsufficientBalance",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidSignature",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "TransferFailed",
    type: "error",
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
        name: "amountNative",
        type: "uint256",
      },
    ],
    name: "NativeClaimed",
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
        name: "amountPOK",
        type: "uint256",
      },
    ],
    name: "POKClaimed",
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
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "pxp",
        type: "uint256",
      },
    ],
    name: "PookyballPXPClaimed",
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
    name: "REWARDER",
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
        internalType: "uint256",
        name: "amountNative",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amountPOK",
        type: "uint256",
      },
      {
        internalType: "uint256[]",
        name: "tokenIds",
        type: "uint256[]",
      },
      {
        internalType: "uint256[]",
        name: "tokenPXP",
        type: "uint256[]",
      },
      {
        internalType: "bytes",
        name: "signature",
        type: "bytes",
      },
    ],
    name: "claim",
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
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "nonces",
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
    stateMutability: "payable",
    type: "receive",
  },
] as const;

const _bytecode =
  "0x60806040523480156200001157600080fd5b506040516200141238038062001412833981016040819052620000349162000133565b600280546001600160a01b038085166001600160a01b03199283161790925560018054928416929091169190911790556200007160003362000079565b505062000172565b6000828152602081815260408083206001600160a01b038516845290915290205460ff1662000116576000828152602081815260408083206001600160a01b03851684529091529020805460ff19166001179055620000d53390565b6001600160a01b0316816001600160a01b0316837f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a45b5050565b6001600160a01b03811681146200013057600080fd5b50565b600080604083850312156200014757600080fd5b825162000154816200011a565b602084015190925062000167816200011a565b809150509250929050565b61129080620001826000396000f3fe6080604052600436106100ab5760003560e01c80637ecebe00116100645780637ecebe00146101c457806391d14854146101f1578063a217fddf14610211578063cb2ab27514610226578063d547741f14610246578063f13a7a311461026657600080fd5b806301ffc9a7146100b757806305f197aa146100ec5780631098768314610124578063248a9ca3146101445780632f2ff15d1461018257806336568abe146101a457600080fd5b366100b257005b600080fd5b3480156100c357600080fd5b506100d76100d2366004610dcf565b61029a565b60405190151581526020015b60405180910390f35b3480156100f857600080fd5b5060025461010c906001600160a01b031681565b6040516001600160a01b0390911681526020016100e3565b34801561013057600080fd5b5060015461010c906001600160a01b031681565b34801561015057600080fd5b5061017461015f366004610df9565b60009081526020819052604090206001015490565b6040519081526020016100e3565b34801561018e57600080fd5b506101a261019d366004610e2e565b6102d1565b005b3480156101b057600080fd5b506101a26101bf366004610e2e565b6102fb565b3480156101d057600080fd5b506101746101df366004610e5a565b60036020526000908152604090205481565b3480156101fd57600080fd5b506100d761020c366004610e2e565b61037e565b34801561021d57600080fd5b50610174600081565b34801561023257600080fd5b506101a2610241366004610f01565b6103a7565b34801561025257600080fd5b506101a2610261366004610e2e565b61082f565b34801561027257600080fd5b506101747f5a8bfb9223d93ad39e310233fff7bc65227887789e6e83c62b12f0dfdd782ec381565b60006001600160e01b03198216637965db0b60e01b14806102cb57506301ffc9a760e01b6001600160e01b03198316145b92915050565b6000828152602081905260409020600101546102ec81610854565b6102f68383610861565b505050565b6001600160a01b03811633146103705760405162461bcd60e51b815260206004820152602f60248201527f416363657373436f6e74726f6c3a2063616e206f6e6c792072656e6f756e636560448201526e103937b632b9903337b91039b2b63360891b60648201526084015b60405180910390fd5b61037a82826108e5565b5050565b6000918252602082815260408084206001600160a01b0393909316845291905290205460ff1690565b33600081815260036020526040812054909161044b918a908a908a908a908a908a906103d4906001611014565b6040516020016103eb989796959493929190611050565b60408051601f1981840301815282825280516020918201207f19457468657265756d205369676e6564204d6573736167653a0a33320000000084830152603c8085019190915282518085039091018152605c909301909152815191012090565b905061047b7f5a8bfb9223d93ad39e310233fff7bc65227887789e6e83c62b12f0dfdd782ec361020c838561094a565b61049857604051638baa579f60e01b815260040160405180910390fd5b8483146104c25760405163990d9df760e01b81526004810186905260248101849052604401610367565b874710156104ec5760405163cf47918160e01b815260048101899052476024820152604401610367565b861561058c576002546040516340c10f1960e01b8152336004820152602481018990526001600160a01b03909116906340c10f1990604401600060405180830381600087803b15801561053e57600080fd5b505af1158015610552573d6000803e3d6000fd5b50506040518a81523392507fb652640260d6f7228a1e75d6ff8efb6277e94b756d54c97a94556499d05d0079915060200160405180910390a25b60005b85811015610755576001546000906001600160a01b031663e3684e398989858181106105bd576105bd61109e565b905060200201356040518263ffffffff1660e01b81526004016105e291815260200190565b60a060405180830381865afa1580156105ff573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061062391906110b4565b6001549091506001600160a01b031663b7cf12cf8989858181106106495761064961109e565b905060200201358888868181106106625761066261109e565b9050602002013584606001516106789190611014565b6040516001600160e01b031960e085901b16815260048101929092526024820152604401600060405180830381600087803b1580156106b657600080fd5b505af11580156106ca573d6000803e3d6000fd5b505050508787838181106106e0576106e061109e565b90506020020135336001600160a01b03167f81030ee2ac1156a23f5f3d0c7ae394593705ee115dbc2251a2cc3b6543852e498888868181106107245761072461109e565b9050602002013560405161073a91815260200190565b60405180910390a3508061074d81611131565b91505061058f565b5087156108055760405160009033908a908381818185875af1925050503d806000811461079e576040519150601f19603f3d011682016040523d82523d6000602084013e6107a3565b606091505b50509050806107ce57604051630e21dcbb60e11b8152336004820152602481018a9052604401610367565b60405189815233907f7b3fcf6b642a0d537ec94e3e3554737ca883871bc8a5ea348d8ee3a9b9d9656c9060200160405180910390a2505b33600090815260036020526040812080549161082083611131565b91905055505050505050505050565b60008281526020819052604090206001015461084a81610854565b6102f683836108e5565b61085e813361096e565b50565b61086b828261037e565b61037a576000828152602081815260408083206001600160a01b03851684529091529020805460ff191660011790556108a13390565b6001600160a01b0316816001600160a01b0316837f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a45050565b6108ef828261037e565b1561037a576000828152602081815260408083206001600160a01b0385168085529252808320805460ff1916905551339285917ff6391f5c32d9c69d2a47ea670b442974b53935d1edc7fd64eb21e047a839171b9190a45050565b600080600061095985856109c7565b9150915061096681610a0c565b509392505050565b610978828261037e565b61037a5761098581610b56565b610990836020610b68565b6040516020016109a192919061116e565b60408051601f198184030181529082905262461bcd60e51b8252610367916004016111e3565b60008082516041036109fd5760208301516040840151606085015160001a6109f187828585610d0b565b94509450505050610a05565b506000905060025b9250929050565b6000816004811115610a2057610a20611216565b03610a285750565b6001816004811115610a3c57610a3c611216565b03610a895760405162461bcd60e51b815260206004820152601860248201527f45434453413a20696e76616c6964207369676e617475726500000000000000006044820152606401610367565b6002816004811115610a9d57610a9d611216565b03610aea5760405162461bcd60e51b815260206004820152601f60248201527f45434453413a20696e76616c6964207369676e6174757265206c656e677468006044820152606401610367565b6003816004811115610afe57610afe611216565b0361085e5760405162461bcd60e51b815260206004820152602260248201527f45434453413a20696e76616c6964207369676e6174757265202773272076616c604482015261756560f01b6064820152608401610367565b60606102cb6001600160a01b03831660145b60606000610b7783600261122c565b610b82906002611014565b67ffffffffffffffff811115610b9a57610b9a610eba565b6040519080825280601f01601f191660200182016040528015610bc4576020820181803683370190505b509050600360fc1b81600081518110610bdf57610bdf61109e565b60200101906001600160f81b031916908160001a905350600f60fb1b81600181518110610c0e57610c0e61109e565b60200101906001600160f81b031916908160001a9053506000610c3284600261122c565b610c3d906001611014565b90505b6001811115610cb5576f181899199a1a9b1b9c1cb0b131b232b360811b85600f1660108110610c7157610c7161109e565b1a60f81b828281518110610c8757610c8761109e565b60200101906001600160f81b031916908160001a90535060049490941c93610cae81611243565b9050610c40565b508315610d045760405162461bcd60e51b815260206004820181905260248201527f537472696e67733a20686578206c656e67746820696e73756666696369656e746044820152606401610367565b9392505050565b6000807f7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0831115610d425750600090506003610dc6565b6040805160008082526020820180845289905260ff881692820192909252606081018690526080810185905260019060a0016020604051602081039080840390855afa158015610d96573d6000803e3d6000fd5b5050604051601f1901519150506001600160a01b038116610dbf57600060019250925050610dc6565b9150600090505b94509492505050565b600060208284031215610de157600080fd5b81356001600160e01b031981168114610d0457600080fd5b600060208284031215610e0b57600080fd5b5035919050565b80356001600160a01b0381168114610e2957600080fd5b919050565b60008060408385031215610e4157600080fd5b82359150610e5160208401610e12565b90509250929050565b600060208284031215610e6c57600080fd5b610d0482610e12565b60008083601f840112610e8757600080fd5b50813567ffffffffffffffff811115610e9f57600080fd5b6020830191508360208260051b8501011115610a0557600080fd5b634e487b7160e01b600052604160045260246000fd5b604051601f8201601f1916810167ffffffffffffffff81118282101715610ef957610ef9610eba565b604052919050565b600080600080600080600060a0888a031215610f1c57600080fd5b873596506020808901359650604089013567ffffffffffffffff80821115610f4357600080fd5b610f4f8c838d01610e75565b909850965060608b0135915080821115610f6857600080fd5b610f748c838d01610e75565b909650945060808b0135915080821115610f8d57600080fd5b818b0191508b601f830112610fa157600080fd5b813581811115610fb357610fb3610eba565b610fc5601f8201601f19168501610ed0565b91508082528c84828501011115610fdb57600080fd5b808484018584013760008482840101525080935050505092959891949750929550565b634e487b7160e01b600052601160045260246000fd5b808201808211156102cb576102cb610ffe565b60006001600160fb1b0383111561103d57600080fd5b8260051b80838637939093019392505050565b6bffffffffffffffffffffffff198960601b168152876014820152866034820152600061108b61108460548401888a611027565b8587611027565b9283525050602001979650505050505050565b634e487b7160e01b600052603260045260246000fd5b600060a082840312156110c657600080fd5b60405160a0810181811067ffffffffffffffff821117156110e9576110e9610eba565b6040528251600581106110fb57600080fd5b80825250602083015160208201526040830151604082015260608301516060820152608083015160808201528091505092915050565b60006001820161114357611143610ffe565b5060010190565b60005b8381101561116557818101518382015260200161114d565b50506000910152565b7f416363657373436f6e74726f6c3a206163636f756e74200000000000000000008152600083516111a681601785016020880161114a565b7001034b99036b4b9b9b4b733903937b6329607d1b60179184019182015283516111d781602884016020880161114a565b01602801949350505050565b602081526000825180602084015261120281604085016020870161114a565b601f01601f19169190910160400192915050565b634e487b7160e01b600052602160045260246000fd5b80820281158282048414176102cb576102cb610ffe565b60008161125257611252610ffe565b50600019019056fea2646970667358221220dca2656b031b2f94572c1165bea5cb7eeba4000410e657c9bb94eb9dc146789b64736f6c63430008110033";

type RewardsConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: RewardsConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class Rewards__factory extends ContractFactory {
  constructor(...args: RewardsConstructorParams) {
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
  ): Promise<Rewards> {
    return super.deploy(_pok, _pookyball, overrides || {}) as Promise<Rewards>;
  }
  override getDeployTransaction(
    _pok: PromiseOrValue<string>,
    _pookyball: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_pok, _pookyball, overrides || {});
  }
  override attach(address: string): Rewards {
    return super.attach(address) as Rewards;
  }
  override connect(signer: Signer): Rewards__factory {
    return super.connect(signer) as Rewards__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): RewardsInterface {
    return new utils.Interface(_abi) as RewardsInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): Rewards {
    return new Contract(address, _abi, signerOrProvider) as Rewards;
  }
}
