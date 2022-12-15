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
    name: "InvalidNonce",
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
    name: "REWARD_SIGNER",
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
        internalType: "uint256",
        name: "nonce_",
        type: "uint256",
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
  "0x60806040523480156200001157600080fd5b506040516200146c3803806200146c833981016040819052620000349162000133565b600280546001600160a01b038085166001600160a01b03199283161790925560018054928416929091169190911790556200007160003362000079565b505062000172565b6000828152602081815260408083206001600160a01b038516845290915290205460ff1662000116576000828152602081815260408083206001600160a01b03851684529091529020805460ff19166001179055620000d53390565b6001600160a01b0316816001600160a01b0316837f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a45b5050565b6001600160a01b03811681146200013057600080fd5b50565b600080604083850312156200014757600080fd5b825162000154816200011a565b602084015190925062000167816200011a565b809150509250929050565b6112ea80620001826000396000f3fe6080604052600436106100ab5760003560e01c80632f2ff15d116100645780632f2ff15d146101d857806336568abe146101f85780637ecebe001461021857806391d1485414610245578063a217fddf14610265578063d547741f1461027a57600080fd5b806301ffc9a7146100b757806305f197aa146100ec5780631098768314610124578063248a9ca31461014457806324c41e94146101825780632cf14502146101a457600080fd5b366100b257005b600080fd5b3480156100c357600080fd5b506100d76100d2366004610e0e565b61029a565b60405190151581526020015b60405180910390f35b3480156100f857600080fd5b5060025461010c906001600160a01b031681565b6040516001600160a01b0390911681526020016100e3565b34801561013057600080fd5b5060015461010c906001600160a01b031681565b34801561015057600080fd5b5061017461015f366004610e38565b60009081526020819052604090206001015490565b6040519081526020016100e3565b34801561018e57600080fd5b506101a261019d366004610edd565b6102d1565b005b3480156101b057600080fd5b506101747f029120cdfff4db2829066c7e67cc48c88be6fd8080a9bc2e6ad44eec0266415b81565b3480156101e457600080fd5b506101a26101f3366004610fff565b6106fe565b34801561020457600080fd5b506101a2610213366004610fff565b610728565b34801561022457600080fd5b5061017461023336600461102b565b60036020526000908152604090205481565b34801561025157600080fd5b506100d7610260366004610fff565b6107a6565b34801561027157600080fd5b50610174600081565b34801561028657600080fd5b506101a2610295366004610fff565b6107cf565b60006001600160e01b03198216637965db0b60e01b14806102cb57506301ffc9a760e01b6001600160e01b03198316145b92915050565b61030833898989898989896040516020016102f3989796959493929190611078565b604051602081830303815290604052826107f4565b61032557604051638baa579f60e01b815260040160405180910390fd5b8483146103545760405163990d9df760e01b815260048101869052602481018490526044015b60405180910390fd5b33600090815260036020526040812080548492909190610373836110e5565b91905055146103b15733600090815260036020526040908190205490516306427aeb60e01b815260048101919091526024810183905260440161034b565b874710156103db5760405163cf47918160e01b81526004810189905247602482015260440161034b565b861561047b576002546040516340c10f1960e01b8152336004820152602481018990526001600160a01b03909116906340c10f1990604401600060405180830381600087803b15801561042d57600080fd5b505af1158015610441573d6000803e3d6000fd5b50506040518a81523392507fb652640260d6f7228a1e75d6ff8efb6277e94b756d54c97a94556499d05d0079915060200160405180910390a25b60005b85811015610644576001546000906001600160a01b031663e3684e398989858181106104ac576104ac6110fe565b905060200201356040518263ffffffff1660e01b81526004016104d191815260200190565b60a060405180830381865afa1580156104ee573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105129190611114565b6001549091506001600160a01b031663b7cf12cf898985818110610538576105386110fe565b90506020020135888886818110610551576105516110fe565b9050602002013584606001516105679190611191565b6040516001600160e01b031960e085901b16815260048101929092526024820152604401600060405180830381600087803b1580156105a557600080fd5b505af11580156105b9573d6000803e3d6000fd5b505050508787838181106105cf576105cf6110fe565b90506020020135336001600160a01b03167f81030ee2ac1156a23f5f3d0c7ae394593705ee115dbc2251a2cc3b6543852e49888886818110610613576106136110fe565b9050602002013560405161062991815260200190565b60405180910390a3508061063c816110e5565b91505061047e565b5087156106f45760405160009033908a908381818185875af1925050503d806000811461068d576040519150601f19603f3d011682016040523d82523d6000602084013e610692565b606091505b50509050806106bd57604051630e21dcbb60e11b8152336004820152602481018a905260440161034b565b60405189815233907f7b3fcf6b642a0d537ec94e3e3554737ca883871bc8a5ea348d8ee3a9b9d9656c9060200160405180910390a2505b5050505050505050565b60008281526020819052604090206001015461071981610893565b61072383836108a0565b505050565b6001600160a01b03811633146107985760405162461bcd60e51b815260206004820152602f60248201527f416363657373436f6e74726f6c3a2063616e206f6e6c792072656e6f756e636560448201526e103937b632b9903337b91039b2b63360891b606482015260840161034b565b6107a28282610924565b5050565b6000918252602082815260408084206001600160a01b0393909316845291905290205460ff1690565b6000828152602081905260409020600101546107ea81610893565b6107238383610924565b60008061085f8361085986805190602001206040517f19457468657265756d205369676e6564204d6573736167653a0a3332000000006020820152603c8101829052600090605c01604051602081830303815290604052805190602001209050919050565b90610989565b905061088b7f029120cdfff4db2829066c7e67cc48c88be6fd8080a9bc2e6ad44eec0266415b826107a6565b949350505050565b61089d81336109ad565b50565b6108aa82826107a6565b6107a2576000828152602081815260408083206001600160a01b03851684529091529020805460ff191660011790556108e03390565b6001600160a01b0316816001600160a01b0316837f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a45050565b61092e82826107a6565b156107a2576000828152602081815260408083206001600160a01b0385168085529252808320805460ff1916905551339285917ff6391f5c32d9c69d2a47ea670b442974b53935d1edc7fd64eb21e047a839171b9190a45050565b60008060006109988585610a06565b915091506109a581610a4b565b509392505050565b6109b782826107a6565b6107a2576109c481610b95565b6109cf836020610ba7565b6040516020016109e09291906111c8565b60408051601f198184030181529082905262461bcd60e51b825261034b9160040161123d565b6000808251604103610a3c5760208301516040840151606085015160001a610a3087828585610d4a565b94509450505050610a44565b506000905060025b9250929050565b6000816004811115610a5f57610a5f611270565b03610a675750565b6001816004811115610a7b57610a7b611270565b03610ac85760405162461bcd60e51b815260206004820152601860248201527f45434453413a20696e76616c6964207369676e61747572650000000000000000604482015260640161034b565b6002816004811115610adc57610adc611270565b03610b295760405162461bcd60e51b815260206004820152601f60248201527f45434453413a20696e76616c6964207369676e6174757265206c656e67746800604482015260640161034b565b6003816004811115610b3d57610b3d611270565b0361089d5760405162461bcd60e51b815260206004820152602260248201527f45434453413a20696e76616c6964207369676e6174757265202773272076616c604482015261756560f01b606482015260840161034b565b60606102cb6001600160a01b03831660145b60606000610bb6836002611286565b610bc1906002611191565b67ffffffffffffffff811115610bd957610bd9610e96565b6040519080825280601f01601f191660200182016040528015610c03576020820181803683370190505b509050600360fc1b81600081518110610c1e57610c1e6110fe565b60200101906001600160f81b031916908160001a905350600f60fb1b81600181518110610c4d57610c4d6110fe565b60200101906001600160f81b031916908160001a9053506000610c71846002611286565b610c7c906001611191565b90505b6001811115610cf4576f181899199a1a9b1b9c1cb0b131b232b360811b85600f1660108110610cb057610cb06110fe565b1a60f81b828281518110610cc657610cc66110fe565b60200101906001600160f81b031916908160001a90535060049490941c93610ced8161129d565b9050610c7f565b508315610d435760405162461bcd60e51b815260206004820181905260248201527f537472696e67733a20686578206c656e67746820696e73756666696369656e74604482015260640161034b565b9392505050565b6000807f7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0831115610d815750600090506003610e05565b6040805160008082526020820180845289905260ff881692820192909252606081018690526080810185905260019060a0016020604051602081039080840390855afa158015610dd5573d6000803e3d6000fd5b5050604051601f1901519150506001600160a01b038116610dfe57600060019250925050610e05565b9150600090505b94509492505050565b600060208284031215610e2057600080fd5b81356001600160e01b031981168114610d4357600080fd5b600060208284031215610e4a57600080fd5b5035919050565b60008083601f840112610e6357600080fd5b50813567ffffffffffffffff811115610e7b57600080fd5b6020830191508360208260051b8501011115610a4457600080fd5b634e487b7160e01b600052604160045260246000fd5b604051601f8201601f1916810167ffffffffffffffff81118282101715610ed557610ed5610e96565b604052919050565b60008060008060008060008060c0898b031215610ef957600080fd5b883597506020808a0135975060408a013567ffffffffffffffff80821115610f2057600080fd5b610f2c8d838e01610e51565b909950975060608c0135915080821115610f4557600080fd5b610f518d838e01610e51565b909750955060808c0135945060a08c0135915080821115610f7157600080fd5b818c0191508c601f830112610f8557600080fd5b813581811115610f9757610f97610e96565b610fa9601f8201601f19168501610eac565b91508082528d84828501011115610fbf57600080fd5b80848401858401376000848284010152508093505050509295985092959890939650565b80356001600160a01b0381168114610ffa57600080fd5b919050565b6000806040838503121561101257600080fd5b8235915061102260208401610fe3565b90509250929050565b60006020828403121561103d57600080fd5b610d4382610fe3565b81835260006001600160fb1b0383111561105f57600080fd5b8260051b80836020870137939093016020019392505050565b60018060a01b038916815287602082015286604082015260c0606082015260006110a660c083018789611046565b82810360808401526110b9818688611046565b9150508260a08301529998505050505050505050565b634e487b7160e01b600052601160045260246000fd5b6000600182016110f7576110f76110cf565b5060010190565b634e487b7160e01b600052603260045260246000fd5b600060a0828403121561112657600080fd5b60405160a0810181811067ffffffffffffffff8211171561114957611149610e96565b60405282516005811061115b57600080fd5b80825250602083015160208201526040830151604082015260608301516060820152608083015160808201528091505092915050565b808201808211156102cb576102cb6110cf565b60005b838110156111bf5781810151838201526020016111a7565b50506000910152565b7f416363657373436f6e74726f6c3a206163636f756e74200000000000000000008152600083516112008160178501602088016111a4565b7001034b99036b4b9b9b4b733903937b6329607d1b60179184019182015283516112318160288401602088016111a4565b01602801949350505050565b602081526000825180602084015261125c8160408501602087016111a4565b601f01601f19169190910160400192915050565b634e487b7160e01b600052602160045260246000fd5b80820281158282048414176102cb576102cb6110cf565b6000816112ac576112ac6110cf565b50600019019056fea2646970667358221220296a3f95c2fc02c20c0ef578e9bd559a8914005593909527e0d6932d08e3419264736f6c63430008110033";

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
