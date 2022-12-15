/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Signer,
  utils,
  Contract,
  ContractFactory,
  BigNumberish,
  Overrides,
} from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../../../common";
import type {
  VRFCoordinatorV2Mock,
  VRFCoordinatorV2MockInterface,
} from "../../../../../../@chainlink/contracts/src/v0.8/mocks/VRFCoordinatorV2Mock";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint96",
        name: "_baseFee",
        type: "uint96",
      },
      {
        internalType: "uint96",
        name: "_gasPriceLink",
        type: "uint96",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "InsufficientBalance",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidConsumer",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidRandomWords",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidSubscription",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "MustBeSubOwner",
    type: "error",
  },
  {
    inputs: [],
    name: "TooManyConsumers",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint64",
        name: "subId",
        type: "uint64",
      },
      {
        indexed: false,
        internalType: "address",
        name: "consumer",
        type: "address",
      },
    ],
    name: "ConsumerAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint64",
        name: "subId",
        type: "uint64",
      },
      {
        indexed: false,
        internalType: "address",
        name: "consumer",
        type: "address",
      },
    ],
    name: "ConsumerRemoved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "requestId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "outputSeed",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint96",
        name: "payment",
        type: "uint96",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "success",
        type: "bool",
      },
    ],
    name: "RandomWordsFulfilled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "keyHash",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "requestId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "preSeed",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint64",
        name: "subId",
        type: "uint64",
      },
      {
        indexed: false,
        internalType: "uint16",
        name: "minimumRequestConfirmations",
        type: "uint16",
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "callbackGasLimit",
        type: "uint32",
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "numWords",
        type: "uint32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RandomWordsRequested",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint64",
        name: "subId",
        type: "uint64",
      },
      {
        indexed: false,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "SubscriptionCanceled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint64",
        name: "subId",
        type: "uint64",
      },
      {
        indexed: false,
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "SubscriptionCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint64",
        name: "subId",
        type: "uint64",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "oldBalance",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newBalance",
        type: "uint256",
      },
    ],
    name: "SubscriptionFunded",
    type: "event",
  },
  {
    inputs: [],
    name: "BASE_FEE",
    outputs: [
      {
        internalType: "uint96",
        name: "",
        type: "uint96",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "GAS_PRICE_LINK",
    outputs: [
      {
        internalType: "uint96",
        name: "",
        type: "uint96",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MAX_CONSUMERS",
    outputs: [
      {
        internalType: "uint16",
        name: "",
        type: "uint16",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "_subId",
        type: "uint64",
      },
    ],
    name: "acceptSubscriptionOwnerTransfer",
    outputs: [],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "_subId",
        type: "uint64",
      },
      {
        internalType: "address",
        name: "_consumer",
        type: "address",
      },
    ],
    name: "addConsumer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "_subId",
        type: "uint64",
      },
      {
        internalType: "address",
        name: "_to",
        type: "address",
      },
    ],
    name: "cancelSubscription",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "_subId",
        type: "uint64",
      },
      {
        internalType: "address",
        name: "_consumer",
        type: "address",
      },
    ],
    name: "consumerIsAdded",
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
    inputs: [],
    name: "createSubscription",
    outputs: [
      {
        internalType: "uint64",
        name: "_subId",
        type: "uint64",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_requestId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_consumer",
        type: "address",
      },
    ],
    name: "fulfillRandomWords",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_requestId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_consumer",
        type: "address",
      },
      {
        internalType: "uint256[]",
        name: "_words",
        type: "uint256[]",
      },
    ],
    name: "fulfillRandomWordsWithOverride",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "_subId",
        type: "uint64",
      },
      {
        internalType: "uint96",
        name: "_amount",
        type: "uint96",
      },
    ],
    name: "fundSubscription",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getConfig",
    outputs: [
      {
        internalType: "uint16",
        name: "minimumRequestConfirmations",
        type: "uint16",
      },
      {
        internalType: "uint32",
        name: "maxGasLimit",
        type: "uint32",
      },
      {
        internalType: "uint32",
        name: "stalenessSeconds",
        type: "uint32",
      },
      {
        internalType: "uint32",
        name: "gasAfterPaymentCalculation",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getFallbackWeiPerUnitLink",
    outputs: [
      {
        internalType: "int256",
        name: "",
        type: "int256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getFeeConfig",
    outputs: [
      {
        internalType: "uint32",
        name: "fulfillmentFlatFeeLinkPPMTier1",
        type: "uint32",
      },
      {
        internalType: "uint32",
        name: "fulfillmentFlatFeeLinkPPMTier2",
        type: "uint32",
      },
      {
        internalType: "uint32",
        name: "fulfillmentFlatFeeLinkPPMTier3",
        type: "uint32",
      },
      {
        internalType: "uint32",
        name: "fulfillmentFlatFeeLinkPPMTier4",
        type: "uint32",
      },
      {
        internalType: "uint32",
        name: "fulfillmentFlatFeeLinkPPMTier5",
        type: "uint32",
      },
      {
        internalType: "uint24",
        name: "reqsForTier2",
        type: "uint24",
      },
      {
        internalType: "uint24",
        name: "reqsForTier3",
        type: "uint24",
      },
      {
        internalType: "uint24",
        name: "reqsForTier4",
        type: "uint24",
      },
      {
        internalType: "uint24",
        name: "reqsForTier5",
        type: "uint24",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getRequestConfig",
    outputs: [
      {
        internalType: "uint16",
        name: "",
        type: "uint16",
      },
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
      {
        internalType: "bytes32[]",
        name: "",
        type: "bytes32[]",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "_subId",
        type: "uint64",
      },
    ],
    name: "getSubscription",
    outputs: [
      {
        internalType: "uint96",
        name: "balance",
        type: "uint96",
      },
      {
        internalType: "uint64",
        name: "reqCount",
        type: "uint64",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address[]",
        name: "consumers",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "subId",
        type: "uint64",
      },
    ],
    name: "pendingRequestExists",
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
        internalType: "uint64",
        name: "_subId",
        type: "uint64",
      },
      {
        internalType: "address",
        name: "_consumer",
        type: "address",
      },
    ],
    name: "removeConsumer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_keyHash",
        type: "bytes32",
      },
      {
        internalType: "uint64",
        name: "_subId",
        type: "uint64",
      },
      {
        internalType: "uint16",
        name: "_minimumRequestConfirmations",
        type: "uint16",
      },
      {
        internalType: "uint32",
        name: "_callbackGasLimit",
        type: "uint32",
      },
      {
        internalType: "uint32",
        name: "_numWords",
        type: "uint32",
      },
    ],
    name: "requestRandomWords",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "_subId",
        type: "uint64",
      },
      {
        internalType: "address",
        name: "_newOwner",
        type: "address",
      },
    ],
    name: "requestSubscriptionOwnerTransfer",
    outputs: [],
    stateMutability: "pure",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60e0604052606461ffff1660c09061ffff168152506001805560646002553480156200002a57600080fd5b5060405162002d8338038062002d838339818101604052810190620000509190620000ee565b816bffffffffffffffffffffffff166080816bffffffffffffffffffffffff1681525050806bffffffffffffffffffffffff1660a0816bffffffffffffffffffffffff1681525050505062000135565b600080fd5b60006bffffffffffffffffffffffff82169050919050565b620000c881620000a5565b8114620000d457600080fd5b50565b600081519050620000e881620000bd565b92915050565b60008060408385031215620001085762000107620000a0565b5b60006200011885828601620000d7565b92505060206200012b85828601620000d7565b9150509250929050565b60805160a05160c051612c096200017a60003960008181610cb40152610dfe01526000818161079d01526115170152600081816107e201526109f10152612c096000f3fe608060405234801561001057600080fd5b506004361061012b5760003560e01c806382359740116100ad578063afc69b5311610071578063afc69b5314610317578063c3f909d414610333578063d7ae1d3014610354578063e82ad7d414610370578063ed5eb06d146103a05761012b565b806382359740146102705780639f87fad71461028c578063a21a23e4146102a8578063a410347f146102c6578063a47c7696146102e45761012b565b80635d3b1d30116100f45780635d3b1d30146101c45780635fbbc0d2146101f457806364d51a2a1461021a5780637341c10c14610238578063808974ff146102545761012b565b80620122911461013057806304c357cb1461015057806308e3898e1461016c578063356dac71146101885780633d18651e146101a6575b600080fd5b6101386103d0565b60405161014793929190611dc0565b60405180910390f35b61016a60048036038101906101659190611eb0565b610430565b005b6101866004803603810190610181919061207f565b61046b565b005b6101906109e0565b60405161019d9190612107565b60405180910390f35b6101ae6109ef565b6040516101bb9190612149565b60405180910390f35b6101de60048036038101906101d991906121e8565b610a13565b6040516101eb9190612272565b60405180910390f35b6101fc610c73565b604051610211999897969594939291906122ab565b60405180910390f35b610222610cb2565b60405161022f9190612338565b60405180910390f35b610252600480360381019061024d9190611eb0565b610cd6565b005b61026e60048036038101906102699190612353565b610f62565b005b61028a60048036038101906102859190612393565b610fba565b005b6102a660048036038101906102a19190611eb0565b610ff5565b005b6102b0611360565b6040516102bd91906123cf565b60405180910390f35b6102ce611515565b6040516102db9190612149565b60405180910390f35b6102fe60048036038101906102f99190612393565b611539565b60405161030e94939291906124b7565b60405180910390f35b610331600480360381019061032c919061252f565b61173e565b005b61033b611908565b60405161034b949392919061256f565b60405180910390f35b61036e60048036038101906103699190611eb0565b611928565b005b61038a60048036038101906103859190612393565b611b4a565b60405161039791906125cf565b60405180910390f35b6103ba60048036038101906103b59190611eb0565b611b87565b6040516103c791906125cf565b60405180910390f35b60008060606003621e8480600067ffffffffffffffff8111156103f6576103f5611f3c565b5b6040519080825280602002602001820160405280156104245781602001602082028036833780820191505090505b50925092509250909192565b6040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161046290612647565b60405180910390fd5b60005a905060006005600086815260200190815260200160002060000160009054906101000a900467ffffffffffffffff1667ffffffffffffffff16036104e7576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016104de906126b3565b60405180910390fd5b6000600560008681526020019081526020016000206040518060600160405290816000820160009054906101000a900467ffffffffffffffff1667ffffffffffffffff1667ffffffffffffffff1681526020016000820160089054906101000a900463ffffffff1663ffffffff1663ffffffff16815260200160008201600c9054906101000a900463ffffffff1663ffffffff1663ffffffff16815250509050600083510361065e57806040015163ffffffff1667ffffffffffffffff8111156105b4576105b3611f3c565b5b6040519080825280602002602001820160405280156105e25781602001602082028036833780820191505090505b50925060005b816040015163ffffffff1681101561065857858160405160200161060d9291906126d3565b6040516020818303038152906040528051906020012060001c848281518110610639576106386126fc565b5b60200260200101818152505080806106509061275a565b9150506105e8565b506106a3565b806040015163ffffffff168351146106a2576040517f3f3df5b600000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b5b600080631fe543e360e01b87866040516024016106c1929190612860565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff8381831617835250505050905060008673ffffffffffffffffffffffffffffffffffffffff16846020015163ffffffff16836040516107529190612901565b60006040518083038160008787f1925050503d8060008114610790576040519150601f19603f3d011682016040523d82523d6000602084013e610795565b606091505b5050905060007f00000000000000000000000000000000000000000000000000000000000000006bffffffffffffffffffffffff165a876107d69190612918565b6107e0919061294c565b7f00000000000000000000000000000000000000000000000000000000000000006bffffffffffffffffffffffff16610819919061298e565b9050806bffffffffffffffffffffffff1660036000876000015167ffffffffffffffff1667ffffffffffffffff16815260200190815260200160002060000160149054906101000a90046bffffffffffffffffffffffff166bffffffffffffffffffffffff1610156108b7576040517ff4d678b800000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b8060036000876000015167ffffffffffffffff1667ffffffffffffffff16815260200190815260200160002060000160148282829054906101000a90046bffffffffffffffffffffffff1661090c91906129c2565b92506101000a8154816bffffffffffffffffffffffff02191690836bffffffffffffffffffffffff160217905550600560008a8152602001908152602001600020600080820160006101000a81549067ffffffffffffffff02191690556000820160086101000a81549063ffffffff021916905560008201600c6101000a81549063ffffffff02191690555050887f7dffc5ae5ee4e2e4df1651cf6ad329a73cebdb728f37ea0187b9b17e036756e48a83856040516109cd93929190612a02565b60405180910390a2505050505050505050565b6000660e35fa931a0000905090565b7f000000000000000000000000000000000000000000000000000000000000000081565b60008433610a218282611b87565b610a57576040517f71e8313700000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff16600360008967ffffffffffffffff1667ffffffffffffffff16815260200190815260200160002060000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1603610b07576040517f1f6a65b600000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b600060016000815480929190610b1c9061275a565b919050559050600060026000815480929190610b379061275a565b91905055905060405180606001604052808a67ffffffffffffffff1681526020018863ffffffff1681526020018763ffffffff168152506005600084815260200190815260200160002060008201518160000160006101000a81548167ffffffffffffffff021916908367ffffffffffffffff16021790555060208201518160000160086101000a81548163ffffffff021916908363ffffffff160217905550604082015181600001600c6101000a81548163ffffffff021916908363ffffffff1602179055509050503373ffffffffffffffffffffffffffffffffffffffff168967ffffffffffffffff168b7f63373d1c4696214b898952999c9aaec57dac1ee2723cec59bea6888f489a977285858d8d8d604051610c5b959493929190612a39565b60405180910390a48194505050505095945050505050565b6000806000806000806000806000620186a080620186a080620186a0600080600080985098509850985098509850985098509850909192939495969798565b7f000000000000000000000000000000000000000000000000000000000000000081565b816000600360008367ffffffffffffffff1667ffffffffffffffff16815260200190815260200160002060000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1603610d8c576040517f1f6a65b600000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b8073ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610dfc57806040517fd8a3fb52000000000000000000000000000000000000000000000000000000008152600401610df39190612a8c565b60405180910390fd5b7f000000000000000000000000000000000000000000000000000000000000000061ffff16600460008667ffffffffffffffff1667ffffffffffffffff1681526020019081526020016000208054905003610e83576040517f05a48e0f00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b610e8d8484611b87565b610f5c57600460008567ffffffffffffffff1667ffffffffffffffff168152602001908152602001600020839080600181540180825580915050600190039060005260206000200160009091909190916101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508367ffffffffffffffff167f752ead9f4536ec1319ee3a5a604e1d65eded22e0924251552ba14ae4faa1bbc384604051610f539190612a8c565b60405180910390a25b50505050565b610fb68282600067ffffffffffffffff811115610f8257610f81611f3c565b5b604051908082528060200260200182016040528015610fb05781602001602082028036833780820191505090505b5061046b565b5050565b6040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610fec90612647565b60405180910390fd5b816000600360008367ffffffffffffffff1667ffffffffffffffff16815260200190815260200160002060000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16036110ab576040517f1f6a65b600000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b8073ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161461111b57806040517fd8a3fb520000000000000000000000000000000000000000000000000000000081526004016111129190612a8c565b60405180910390fd5b83836111278282611b87565b61115d576040517f71e8313700000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6000600460008867ffffffffffffffff1667ffffffffffffffff168152602001908152602001600020905060005b8180549050811015611314578673ffffffffffffffffffffffffffffffffffffffff168282815481106111c1576111c06126fc565b5b9060005260206000200160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1603611301576000826001848054905061121b9190612918565b8154811061122c5761122b6126fc565b5b9060005260206000200160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1690508083838154811061126d5761126c6126fc565b5b9060005260206000200160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550828054806112c6576112c5612aa7565b5b6001900381819060005260206000200160006101000a81549073ffffffffffffffffffffffffffffffffffffffff0219169055905550611314565b808061130c9061275a565b91505061118b565b508667ffffffffffffffff167ff9bc9d5b5733d904409def43a5ecc888dbdac9a95687780d8fd489d3bb3813fc8760405161134f9190612a8c565b60405180910390a250505050505050565b600080600081819054906101000a900467ffffffffffffffff168092919061138790612ad6565b91906101000a81548167ffffffffffffffff021916908367ffffffffffffffff1602179055505060405180604001604052803373ffffffffffffffffffffffffffffffffffffffff16815260200160006bffffffffffffffffffffffff16815250600360008060009054906101000a900467ffffffffffffffff1667ffffffffffffffff1667ffffffffffffffff16815260200190815260200160002060008201518160000160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060208201518160000160146101000a8154816bffffffffffffffffffffffff02191690836bffffffffffffffffffffffff16021790555090505060008054906101000a900467ffffffffffffffff1667ffffffffffffffff167f464722b4166576d3dcbba877b999bc35cf911f4eaf434b7eba68fa113951d0bf336040516114f39190612a8c565b60405180910390a260008054906101000a900467ffffffffffffffff16905090565b7f000000000000000000000000000000000000000000000000000000000000000081565b60008060006060600073ffffffffffffffffffffffffffffffffffffffff16600360008767ffffffffffffffff1667ffffffffffffffff16815260200190815260200160002060000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16036115f0576040517f1f6a65b600000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b600360008667ffffffffffffffff1667ffffffffffffffff16815260200190815260200160002060000160149054906101000a90046bffffffffffffffffffffffff166000600360008867ffffffffffffffff1667ffffffffffffffff16815260200190815260200160002060000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600460008967ffffffffffffffff1667ffffffffffffffff1681526020019081526020016000208080548060200260200160405190810160405280929190818152602001828054801561172857602002820191906000526020600020905b8160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190600101908083116116de575b5050505050905093509350935093509193509193565b600073ffffffffffffffffffffffffffffffffffffffff16600360008467ffffffffffffffff1667ffffffffffffffff16815260200190815260200160002060000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16036117ee576040517f1f6a65b600000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6000600360008467ffffffffffffffff1667ffffffffffffffff16815260200190815260200160002060000160149054906101000a90046bffffffffffffffffffffffff16905081600360008567ffffffffffffffff1667ffffffffffffffff16815260200190815260200160002060000160148282829054906101000a90046bffffffffffffffffffffffff166118869190612b06565b92506101000a8154816bffffffffffffffffffffffff02191690836bffffffffffffffffffffffff1602179055508267ffffffffffffffff167fd39ec07f4e209f627a4c427971473820dc129761ba28de8906bd56f57101d4f88284846118ed9190612b06565b6040516118fb929190612b81565b60405180910390a2505050565b6000806000806004622625a0610a8c618205935093509350935090919293565b816000600360008367ffffffffffffffff1667ffffffffffffffff16815260200190815260200160002060000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16036119de576040517f1f6a65b600000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b8073ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614611a4e57806040517fd8a3fb52000000000000000000000000000000000000000000000000000000008152600401611a459190612a8c565b60405180910390fd5b8367ffffffffffffffff167fe8ed5b475a5b5987aa9165e8731bb78043f39eee32ec5a1169a89e27fcd4981584600360008867ffffffffffffffff1667ffffffffffffffff16815260200190815260200160002060000160149054906101000a90046bffffffffffffffffffffffff16604051611acc929190612baa565b60405180910390a2600360008567ffffffffffffffff1667ffffffffffffffff168152602001908152602001600020600080820160006101000a81549073ffffffffffffffffffffffffffffffffffffffff02191690556000820160146101000a8154906bffffffffffffffffffffffff0219169055505050505050565b60006040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611b7e90612647565b60405180910390fd5b600080600460008567ffffffffffffffff1667ffffffffffffffff168152602001908152602001600020805480602002602001604051908101604052809291908181526020018280548015611c3157602002820191906000526020600020905b8160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019060010190808311611be7575b5050505050905060005b8151811015611caf578373ffffffffffffffffffffffffffffffffffffffff16828281518110611c6e57611c6d6126fc565b5b602002602001015173ffffffffffffffffffffffffffffffffffffffff1603611c9c57600192505050611cb6565b8080611ca79061275a565b915050611c3b565b5060009150505b92915050565b600061ffff82169050919050565b611cd381611cbc565b82525050565b600063ffffffff82169050919050565b611cf281611cd9565b82525050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b6000819050919050565b611d3781611d24565b82525050565b6000611d498383611d2e565b60208301905092915050565b6000602082019050919050565b6000611d6d82611cf8565b611d778185611d03565b9350611d8283611d14565b8060005b83811015611db3578151611d9a8882611d3d565b9750611da583611d55565b925050600181019050611d86565b5085935050505092915050565b6000606082019050611dd56000830186611cca565b611de26020830185611ce9565b8181036040830152611df48184611d62565b9050949350505050565b6000604051905090565b600080fd5b600080fd5b600067ffffffffffffffff82169050919050565b611e2f81611e12565b8114611e3a57600080fd5b50565b600081359050611e4c81611e26565b92915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000611e7d82611e52565b9050919050565b611e8d81611e72565b8114611e9857600080fd5b50565b600081359050611eaa81611e84565b92915050565b60008060408385031215611ec757611ec6611e08565b5b6000611ed585828601611e3d565b9250506020611ee685828601611e9b565b9150509250929050565b6000819050919050565b611f0381611ef0565b8114611f0e57600080fd5b50565b600081359050611f2081611efa565b92915050565b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b611f7482611f2b565b810181811067ffffffffffffffff82111715611f9357611f92611f3c565b5b80604052505050565b6000611fa6611dfe565b9050611fb28282611f6b565b919050565b600067ffffffffffffffff821115611fd257611fd1611f3c565b5b602082029050602081019050919050565b600080fd5b6000611ffb611ff684611fb7565b611f9c565b9050808382526020820190506020840283018581111561201e5761201d611fe3565b5b835b8181101561204757806120338882611f11565b845260208401935050602081019050612020565b5050509392505050565b600082601f83011261206657612065611f26565b5b8135612076848260208601611fe8565b91505092915050565b60008060006060848603121561209857612097611e08565b5b60006120a686828701611f11565b93505060206120b786828701611e9b565b925050604084013567ffffffffffffffff8111156120d8576120d7611e0d565b5b6120e486828701612051565b9150509250925092565b6000819050919050565b612101816120ee565b82525050565b600060208201905061211c60008301846120f8565b92915050565b60006bffffffffffffffffffffffff82169050919050565b61214381612122565b82525050565b600060208201905061215e600083018461213a565b92915050565b61216d81611d24565b811461217857600080fd5b50565b60008135905061218a81612164565b92915050565b61219981611cbc565b81146121a457600080fd5b50565b6000813590506121b681612190565b92915050565b6121c581611cd9565b81146121d057600080fd5b50565b6000813590506121e2816121bc565b92915050565b600080600080600060a0868803121561220457612203611e08565b5b60006122128882890161217b565b955050602061222388828901611e3d565b9450506040612234888289016121a7565b9350506060612245888289016121d3565b9250506080612256888289016121d3565b9150509295509295909350565b61226c81611ef0565b82525050565b60006020820190506122876000830184612263565b92915050565b600062ffffff82169050919050565b6122a58161228d565b82525050565b6000610120820190506122c1600083018c611ce9565b6122ce602083018b611ce9565b6122db604083018a611ce9565b6122e86060830189611ce9565b6122f56080830188611ce9565b61230260a083018761229c565b61230f60c083018661229c565b61231c60e083018561229c565b61232a61010083018461229c565b9a9950505050505050505050565b600060208201905061234d6000830184611cca565b92915050565b6000806040838503121561236a57612369611e08565b5b600061237885828601611f11565b925050602061238985828601611e9b565b9150509250929050565b6000602082840312156123a9576123a8611e08565b5b60006123b784828501611e3d565b91505092915050565b6123c981611e12565b82525050565b60006020820190506123e460008301846123c0565b92915050565b6123f381611e72565b82525050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b61242e81611e72565b82525050565b60006124408383612425565b60208301905092915050565b6000602082019050919050565b6000612464826123f9565b61246e8185612404565b935061247983612415565b8060005b838110156124aa5781516124918882612434565b975061249c8361244c565b92505060018101905061247d565b5085935050505092915050565b60006080820190506124cc600083018761213a565b6124d960208301866123c0565b6124e660408301856123ea565b81810360608301526124f88184612459565b905095945050505050565b61250c81612122565b811461251757600080fd5b50565b60008135905061252981612503565b92915050565b6000806040838503121561254657612545611e08565b5b600061255485828601611e3d565b92505060206125658582860161251a565b9150509250929050565b60006080820190506125846000830187611cca565b6125916020830186611ce9565b61259e6040830185611ce9565b6125ab6060830184611ce9565b95945050505050565b60008115159050919050565b6125c9816125b4565b82525050565b60006020820190506125e460008301846125c0565b92915050565b600082825260208201905092915050565b7f6e6f7420696d706c656d656e7465640000000000000000000000000000000000600082015250565b6000612631600f836125ea565b915061263c826125fb565b602082019050919050565b6000602082019050818103600083015261266081612624565b9050919050565b7f6e6f6e6578697374656e74207265717565737400000000000000000000000000600082015250565b600061269d6013836125ea565b91506126a882612667565b602082019050919050565b600060208201905081810360008301526126cc81612690565b9050919050565b60006040820190506126e86000830185612263565b6126f56020830184612263565b9392505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600061276582611ef0565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82036127975761279661272b565b5b600182019050919050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b6127d781611ef0565b82525050565b60006127e983836127ce565b60208301905092915050565b6000602082019050919050565b600061280d826127a2565b61281781856127ad565b9350612822836127be565b8060005b8381101561285357815161283a88826127dd565b9750612845836127f5565b925050600181019050612826565b5085935050505092915050565b60006040820190506128756000830185612263565b81810360208301526128878184612802565b90509392505050565b600081519050919050565b600081905092915050565b60005b838110156128c45780820151818401526020810190506128a9565b60008484015250505050565b60006128db82612890565b6128e5818561289b565b93506128f58185602086016128a6565b80840191505092915050565b600061290d82846128d0565b915081905092915050565b600061292382611ef0565b915061292e83611ef0565b92508282039050818111156129465761294561272b565b5b92915050565b600061295782611ef0565b915061296283611ef0565b925082820261297081611ef0565b915082820484148315176129875761298661272b565b5b5092915050565b600061299982611ef0565b91506129a483611ef0565b92508282019050808211156129bc576129bb61272b565b5b92915050565b60006129cd82612122565b91506129d883612122565b925082820390506bffffffffffffffffffffffff8111156129fc576129fb61272b565b5b92915050565b6000606082019050612a176000830186612263565b612a24602083018561213a565b612a3160408301846125c0565b949350505050565b600060a082019050612a4e6000830188612263565b612a5b6020830187612263565b612a686040830186611cca565b612a756060830185611ce9565b612a826080830184611ce9565b9695505050505050565b6000602082019050612aa160008301846123ea565b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603160045260246000fd5b6000612ae182611e12565b915067ffffffffffffffff8203612afb57612afa61272b565b5b600182019050919050565b6000612b1182612122565b9150612b1c83612122565b925082820190506bffffffffffffffffffffffff811115612b4057612b3f61272b565b5b92915050565b6000819050919050565b6000612b6b612b66612b6184612122565b612b46565b611ef0565b9050919050565b612b7b81612b50565b82525050565b6000604082019050612b966000830185612b72565b612ba36020830184612b72565b9392505050565b6000604082019050612bbf60008301856123ea565b612bcc6020830184612b72565b939250505056fea26469706673582212208a83d6042e5c2278f59446b6f4600f459783331d8cf41684a065d6b6f0cbd27f64736f6c63430008110033";

type VRFCoordinatorV2MockConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: VRFCoordinatorV2MockConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class VRFCoordinatorV2Mock__factory extends ContractFactory {
  constructor(...args: VRFCoordinatorV2MockConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    _baseFee: PromiseOrValue<BigNumberish>,
    _gasPriceLink: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<VRFCoordinatorV2Mock> {
    return super.deploy(
      _baseFee,
      _gasPriceLink,
      overrides || {}
    ) as Promise<VRFCoordinatorV2Mock>;
  }
  override getDeployTransaction(
    _baseFee: PromiseOrValue<BigNumberish>,
    _gasPriceLink: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_baseFee, _gasPriceLink, overrides || {});
  }
  override attach(address: string): VRFCoordinatorV2Mock {
    return super.attach(address) as VRFCoordinatorV2Mock;
  }
  override connect(signer: Signer): VRFCoordinatorV2Mock__factory {
    return super.connect(signer) as VRFCoordinatorV2Mock__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): VRFCoordinatorV2MockInterface {
    return new utils.Interface(_abi) as VRFCoordinatorV2MockInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): VRFCoordinatorV2Mock {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as VRFCoordinatorV2Mock;
  }
}
