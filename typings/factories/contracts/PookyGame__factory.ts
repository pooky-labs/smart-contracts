/* Autogenerated file. Do not edit manually. */

/* tslint:disable */

/* eslint-disable */
import type { PromiseOrValue } from "../../common";
import type { PookyGame, PookyGameInterface } from "../../contracts/PookyGame";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint8",
        name: "version",
        type: "uint8",
      },
    ],
    name: "Initialized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [],
    name: "_setLevelCost",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "_setLevelPxpNeeded",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "_setMaxBallLevel",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "levelCost",
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
        name: "",
        type: "uint256",
      },
    ],
    name: "levelPxpNeeded",
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
        name: "ballId",
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
        internalType: "uint256",
        name: "pookAmount",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "ballId",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "addPxp",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "toLevelUp",
            type: "bool",
          },
        ],
        internalType: "struct BallUpdates[]",
        name: "ballUpdates",
        type: "tuple[]",
      },
      {
        internalType: "uint256",
        name: "ttl",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "nonce",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "uint8",
            name: "_v",
            type: "uint8",
          },
          {
            internalType: "bytes32",
            name: "_r",
            type: "bytes32",
          },
          {
            internalType: "bytes32",
            name: "_s",
            type: "bytes32",
          },
        ],
        internalType: "struct Signature",
        name: "sig",
        type: "tuple",
      },
    ],
    name: "matchweekClaim",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pookToken",
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
    name: "pookyBall",
    outputs: [
      {
        internalType: "contract IPookyBall",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pookySigner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_pookToken",
        type: "address",
      },
    ],
    name: "setPookToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "pookyBallAddress",
        type: "address",
      },
    ],
    name: "setPookyBallContract",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_pookySigner",
        type: "address",
      },
    ],
    name: "setPookySigner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50613395806100206000396000f3fe608060405234801561001057600080fd5b506004361061010b5760003560e01c806382dfa7f4116100a2578063adee461d11610071578063adee461d14610232578063b617884a1461024e578063bbeca3f61461026c578063f2fde38b1461028a578063fdd80049146102a65761010b565b806382dfa7f4146101d05780638ad877fe146101da5780638da5cb5b146101e45780639d643400146102025761010b565b80636a66a8ec116100de5780636a66a8ec14610194578063715018a61461019e5780637178f785146101a85780638129fc1c146101c65761010b565b80630ce90ec2146101105780634e9c27b31461012c5780634ee183071461015c57806353534e9914610178575b600080fd5b61012a600480360381019061012591906124fc565b6102c2565b005b610146600480360381019061014191906124fc565b610af3565b6040516101539190612538565b60405180910390f35b610176600480360381019061017191906125b1565b610b17565b005b610192600480360381019061018d91906127a7565b610be7565b005b61019c611473565b005b6101a6611795565b005b6101b06117a9565b6040516101bd91906128a0565b60405180910390f35b6101ce6117cf565b005b6101d8611991565b005b6101e2611aea565b005b6101ec611d69565b6040516101f991906128ca565b60405180910390f35b61021c600480360381019061021791906124fc565b611d93565b6040516102299190612538565b60405180910390f35b61024c600480360381019061024791906125b1565b611db7565b005b610256611e87565b6040516102639190612906565b60405180910390f35b610274611ead565b60405161028191906128ca565b60405180910390f35b6102a4600480360381019061029f91906125b1565b611ed3565b005b6102c060048036038101906102bb91906125b1565b611f57565b005b6102ee7ff0521d33f12f3ca08a7857cf41c6659452fbdaaf8e8652dbd9736aa6905d551860001b612027565b61031a7f244f5659fd967f8700b0a3e12f889433df756336980d2f261822737cc530170b60001b612027565b6103467fc6bcd276466422d8746f29ff5a68312d2af5242c1af3fc01c08df33d06f9e97f60001b612027565b6103727f402957cee26238e9e975ba3617aa8b2207eca6db6efa871244a7a6daa82e76e060001b612027565b3373ffffffffffffffffffffffffffffffffffffffff16606560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16636352211e836040518263ffffffff1660e01b81526004016103e49190612538565b60206040518083038186803b1580156103fc57600080fd5b505afa158015610410573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104349190612936565b73ffffffffffffffffffffffffffffffffffffffff16146040518060400160405280600181526020017f3500000000000000000000000000000000000000000000000000000000000000815250906104c2576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016104b991906129eb565b60405180910390fd5b506104ef7fff6b67474b30d02bbd2ba7fbc1c76e8c573eb9dc03281da474dc72dfdbdff56b60001b612027565b61051b7fb9daf352379c54bc93f32c78616dc4294c365cfc1b4e4d2acdb58dbb6fa7d83e60001b612027565b6105477f46829f62d1f12829d77ddcb69275c8ebbfec39026779cb0f03ac02b139ef6c5260001b612027565b6000606560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166353be326a836040518263ffffffff1660e01b81526004016105a49190612538565b60a060405180830381600087803b1580156105be57600080fd5b505af11580156105d2573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105f69190612ad3565b90506106247f4491a1a02bb2ba38e8b97e82dbb81b64ede8e9bc6fe97de7188588b3fdd1eaf860001b612027565b6106507f50c87dadaf21a2f442a51c1867b7d9bdaa77f24c3d688ce2b8498dd5cb5e120d60001b612027565b61067c7fe5cb6b2977c20f01beb132f545a35c3ec7e7e8fc32a35c72c874bd37630b863660001b612027565b60696001826040015161068f9190612b2f565b815481106106a05761069f612b85565b5b9060005260206000200154816060015110156040518060400160405280600181526020017f360000000000000000000000000000000000000000000000000000000000000081525090610729576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161072091906129eb565b60405180910390fd5b506107567f37b69f2a2ebb1ead71b5e445aa99d55d7a5881f134172f8aa85d0217f0c1fafe60001b612027565b6107827faf8be3642e5088feeb03b928a2376888b2b6465bfb5ca9feff5031bff9e0c5bc60001b612027565b6107ae7f9cc03f59ca7af438759cc7e132b01f3283ad38dcbc9c32348c37a8bf43396add60001b612027565b6107da7fe6789bb5ee7959e8f62930e448f6e4d66402149209928458e4bf0ab116738f1e60001b612027565b606b6000826000015160048111156107f5576107f4612bb4565b5b600481111561080757610806612bb4565b5b8152602001908152602001600020548160400151106040518060400160405280600181526020017f370000000000000000000000000000000000000000000000000000000000000081525090610893576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161088a91906129eb565b60405180910390fd5b506108c07fcbc884267c353bba6352806240c1c28164a836b54be51a52903547bb4833e64260001b612027565b6108ec7fcc09c4f99af2c6a378148da434cd25ddea420a2bdf3382bb7adc6153729f3d9960001b612027565b6109187f690776495671d1a9ace9005a71ec83620d977ad1045362a9953acb7c6adc3b7a60001b612027565b606860009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166323b872dd3330606a6001866040015161096b9190612b2f565b8154811061097c5761097b612b85565b5b90600052602060002001546040518463ffffffff1660e01b81526004016109a593929190612be3565b602060405180830381600087803b1580156109bf57600080fd5b505af11580156109d3573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109f79190612c52565b50610a247fab45471405c66f9ea2b950c385157844dccdc05e8c917ca781c6ace41ca3972b60001b612027565b610a507fbc9ae23be26f957d6978742dfe9ecdc613ba9f98ed90f63f9046f9013ddf60ff60001b612027565b606560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663bc51349b8360018460400151610aa09190612b2f565b6040518363ffffffff1660e01b8152600401610abd929190612c7f565b600060405180830381600087803b158015610ad757600080fd5b505af1158015610aeb573d6000803e3d6000fd5b505050505050565b60698181548110610b0357600080fd5b906000526020600020016000915090505481565b610b1f61202a565b610b4b7f3b3ce578a8b26a0706022444300a0155a07995463a510968ec2d6d20dc11a03b60001b612027565b610b777ff21483bc81b7a5f651f328629deaf9076ecd8337b693fce5e03edbc7fdfa97d760001b612027565b610ba37f8cabff388e9490cca24d595b0070846f706164003f445e9629a9ce49f7bb6fa360001b612027565b80606560006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b610c137f2662e02333f1daa69f55d5e7cf68329aee263c6631d2b569173799c252262c1360001b612027565b610c3f7fa6c2d3021e3a852402263ebd1d7c097de417c1f2c61cc333dcec570b45032f3b60001b612027565b610c6b7f101f310088e00e11fba65baeec938934583b68e9f9366ff0804d4122ef097aeb60001b612027565b610c977ffb1eef27522363cb8307808bb97d2368b82fa121d068fc3dcc6832d5cdb224ba60001b612027565b610ceb8686868686604051602001610cb3959493929190612e0b565b60405160208183030381529060405282606660009054906101000a900473ffffffffffffffffffffffffffffffffffffffff166120a8565b6040518060400160405280600181526020017f380000000000000000000000000000000000000000000000000000000000000081525090610d62576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610d5991906129eb565b60405180910390fd5b50610d8f7f543a7677d86d1f9926440d98dc5ec46c0d55b69e2f842bcb3833bb6e76ce21c660001b612027565b610dbb7f13f01b94d43f2bc5d83b02a21b0257372bc92324474da1078cd87510add06d9560001b612027565b610de77f2dd71a812af9cd99aa812be9712dcb091197051d5a66ca81547d95b18f26932860001b612027565b610e137f8f37fdba6c6ed50f6f89fe2e3b37deec987250db011a6702a0458d81157bdd0a60001b612027565b6067600083815260200190815260200160002060009054906101000a900460ff16156040518060400160405280600281526020017f313000000000000000000000000000000000000000000000000000000000000081525090610eac576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610ea391906129eb565b60405180910390fd5b50610ed97ffceee28dff5b95f109ee7b59381a64eff10ea5d444fabbc00e5915f3d148bdc360001b612027565b610f057f95659e3c337bf2cedf9eb8f5b7064f4cf8b37679cae9ca84c747e5adc01f041860001b612027565b610f317f6cfb6208b51c5071b52cf151a7931b40ac1b301b5cbab1fc5831b6ac776428bf60001b612027565b610f5d7f3d7cdd288081997233d872b0f0e7554b677ff002e348e0ac0acb94c572d7da6460001b612027565b8242106040518060400160405280600181526020017f390000000000000000000000000000000000000000000000000000000000000081525090610fd7576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610fce91906129eb565b60405180910390fd5b506110047f3b7a3df6efcf2a8e37001af296c22d53d5a1d3f8d193cc81b536d79a4ecfb03f60001b612027565b6110307fba034da9dcb7873f1504bae94114964d8b3e689a88d8075da623af7b7e69730d60001b612027565b61105c7f4d6d3f5c063e61d9796d79952a7ab0f2b7c63eaf86e1391cb13f6acfa3b986e660001b612027565b60016067600084815260200190815260200160002060006101000a81548160ff0219169083151502179055506110b47f7019bac78022578abcfc531d927f3f637114933b43d9a5f89a092ae091176ec760001b612027565b6110e07fc8df46f11de2ce957281d36c57c902c6b916afe735d4e200ac2b9be470d6084760001b612027565b606860009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166340c10f1933886040518363ffffffff1660e01b815260040161113d929190612e59565b600060405180830381600087803b15801561115757600080fd5b505af115801561116b573d6000803e3d6000fd5b5050505061119b7ff1555e3cac57cbf44237c8d145384a7677fd39a57b38e0d726e461d12f6da7f060001b612027565b6111c77f9fdad9baeca6e43d94eb596e29bdc0232d3f0ed39cf664cba8eaa4b17306f62b60001b612027565b60005b8585905081101561146a576112017f978c680674f780a6150b63766b544cfced5a393b2bec5af39c64155babca712360001b612027565b61122d7f6437b8d1d2ab28c9b7a65f6470374aeba9d659c88cc727e8378f6d0bbd9899ca60001b612027565b606560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16631974c4ee87878481811061127e5761127d612b85565b5b9050606002016000013588888581811061129b5761129a612b85565b5b905060600201602001356040518363ffffffff1660e01b81526004016112c2929190612c7f565b600060405180830381600087803b1580156112dc57600080fd5b505af11580156112f0573d6000803e3d6000fd5b505050506113207f5215c3e119d0030fed57e3e5d945b20bd3ba0ea5a9a013896fbb217bbe5247b260001b612027565b61134c7fcbcae7ee0d836423617067562fd6be563b10bec43d368137f06bf36860f1d15060001b612027565b85858281811061135f5761135e612b85565b5b90506060020160400160208101906113779190612e82565b1561142a576113a87fbd07627ad7e585a94251adf75799fb6d439cd2afc83aa8ec2cd08bd783a1279860001b612027565b6113d47fb35fcd7c33a66df319e1bcff9d4d3127528bb4bef188122dcc15cc4da6e0b75160001b612027565b6114007fb77feb1df9ea32a262d8a07bcefee9f79536d16693685516c5696fb0212dd2a560001b612027565b61142586868381811061141657611415612b85565b5b905060600201600001356102c2565b611457565b6114567f740661b4889802076152ad1dc592b3b92cd1ccbd0b9781349dadb53fa2078c7160001b612027565b5b808061146290612eaf565b9150506111ca565b50505050505050565b61147b61202a565b6114a77f128d8994071aced02d5db07628d9efd271eba830215b5b43d7b8da57f210affa60001b612027565b6114d37f84690b4851ffad984287f99483cf5c88fdbd428b50c196fdacaee8f65e7d0a6560001b612027565b6114ff7f9f8f9aafffd8e8daff8eb3a455755095531a31008e9d410aaf3a493bb918e22d60001b612027565b6028606b600080600481111561151857611517612bb4565b5b600481111561152a57611529612bb4565b5b8152602001908152602001600020819055506115687f52a775e1fffc3f6363ee50e3421d6fe04e81aee0bb13c2e0fa2afc9e6f0443a060001b612027565b6115947fe72d4c9af9ff578ffd07fdeee80aa3ef8ddae2631dcaa555acf24497609319eb60001b612027565b603c606b6000600160048111156115ae576115ad612bb4565b5b60048111156115c0576115bf612bb4565b5b8152602001908152602001600020819055506115fe7f36643aeb9c96de949e4400629c2ac2248ea4284b1e7a93a0ccd1bc2670d7dbc260001b612027565b61162a7fd4e174e93739ee32177d731e8a5b40c41b89f906e62559eec7100d18cb7c654160001b612027565b6050606b60006002600481111561164457611643612bb4565b5b600481111561165657611655612bb4565b5b8152602001908152602001600020819055506116947faa6ef61274fe3b595fbf2dc373175a6eaddb98ffc4857397e0bf4b84391c41de60001b612027565b6116c07f8cc3300d990391c3ca7d3edbdccd14bb38d33157acc64b100588c0ed451b416460001b612027565b6064606b6000600360048111156116da576116d9612bb4565b5b60048111156116ec576116eb612bb4565b5b81526020019081526020016000208190555061172a7fe225dcd2ba1457596551093cf151e4f02f6c31505325d89be268f03233e434a960001b612027565b6117567ff48c70973e4d601f09b51fc4d6dbf31a2f9f12f4cf06a0a9f0a70f87998d6e0c60001b612027565b6064606b600060048081111561176f5761176e612bb4565b5b600481111561178157611780612bb4565b5b815260200190815260200160002081905550565b61179d61202a565b6117a76000612307565b565b606560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60008060019054906101000a900460ff161590508080156118005750600160008054906101000a900460ff1660ff16105b8061182d575061180f306123cd565b15801561182c5750600160008054906101000a900460ff1660ff16145b5b61186c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161186390612f6a565b60405180910390fd5b60016000806101000a81548160ff021916908360ff16021790555080156118a9576001600060016101000a81548160ff0219169083151502179055505b6118d57f634db07bc9ab87d828b4936784fea4e982e097f2f14f765d2ad4077972075e9660001b612027565b6119017f26332bd14cfde4da1c400ce54fc6774322ef3b852a2711a7e12c5931b71abef860001b612027565b61192d7f1c75273e7ad58606a4c0129aaad7a432811a766f006830a9bb491ffdaabcbbb360001b612027565b6119356123f0565b801561198e5760008060016101000a81548160ff0219169083151502179055507f7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb384740249860016040516119859190612fc5565b60405180910390a15b50565b61199961202a565b6119c57f7e9953c0021cd1511fb552d7ba7e022e13feac186d5f6df4227a6a7cfe00521260001b612027565b6119f17f872044eb559c294a78b02edc5a1e0abf8aa9eb7fc72b38a1908c60a956a2241760001b612027565b611a1d7fa7c55ce55bcc74e7c31e5a5e0dc85df283aa9d22694b6b504b348f92df27ef3560001b612027565b60005b6064811015611ae757611a557f22a177b251d67265e140be222ee986621c787335e70a5d10fb46bc761b4bc50360001b612027565b611a817f80044866f54d5b11f83602048568d3f7647ce273c2315529324f16057618e12360001b612027565b606a600360698381548110611a9957611a98612b85565b5b9060005260206000200154611aae919061300f565b90806001815401808255809150506001900390600052602060002001600090919091909150558080611adf90612eaf565b915050611a20565b50565b611af261202a565b611b1e7f0aaf5759d8aa2c5b0315cc3c01fad86da190df9bd2cf12aecc1b56e6a3560e9360001b612027565b611b4a7fdc51d47f23f25b6ee620d2f440487bc37ad3c197a0a0dd4acb2aebb6b0d6cffa60001b612027565b611b767fb817cfdfba42cd6ec106daa64772a8f4d5ef32eeff01d06da1504ea06275638960001b612027565b606960009080600181540180825580915050600190039060005260206000200160009091909190915055611bcc7fd2cbd2a2103820bcaff6fe649cc9b57a7e916456260d6743ec7e18954ff8051860001b612027565b611bf87f823c5af1a751f33e1dc292b73fb12d0d6c5466d6fec1591baf61869e6ca29d7960001b612027565b60696729a2241af62c00009080600181540180825580915050600190039060005260206000200160009091909190915055611c557fd7c1f2a48379793954146b43cdf532af5dd0d7562d7a64399d75b0003decbd7a60001b612027565b611c817fd8371c591234c4433fb645cefe3d4570a7b9cf5c4af9fcb221ece74be28ee77660001b612027565b6000600290505b60648111611d6657611cbc7ff28b988bb6956ca9f501e8947fe33a150421222ad998120bc0aa64b176ec7a5a60001b612027565b611ce87ffb6b6f9ec4ae353a8499b69e714449d30bd78a9312630e68210b8a95c6e70ee260001b612027565b6069606460786069600185611cfd9190613040565b81548110611d0e57611d0d612b85565b5b9060005260206000200154611d239190613074565b611d2d919061300f565b90806001815401808255809150506001900390600052602060002001600090919091909150558080611d5e90612eaf565b915050611c88565b50565b6000603360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b606a8181548110611da357600080fd5b906000526020600020016000915090505481565b611dbf61202a565b611deb7f5219c6df2fcbbe30f5d851bdfc31e66777b6a3156969957eed3c9d7a3972760c60001b612027565b611e177fff0fd4a2600a59bcbc45f9ee63c32f8f7f2abda50875c60638b81c3e8a63c3a660001b612027565b611e437f0518ae7647e5816caa99b949ff169b292be3515cfce128a6d71d28b8703316b260001b612027565b80606660006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b606860009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b606660009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b611edb61202a565b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff161415611f4b576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611f4290613140565b60405180910390fd5b611f5481612307565b50565b611f5f61202a565b611f8b7fb92690aa69020ea872da22e2b5b340bb5c15d802ad56cb817cfab90049f0fd2260001b612027565b611fb77f2030ca442bc1057c21667f032da0c08c2f73dfce7ed031490b406d296b1c21e160001b612027565b611fe37f75308d75f76ae3c7e25e68077f5f3cc1a65d53e2953caaf94643f88dad1306cd60001b612027565b80606860006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b50565b612032612449565b73ffffffffffffffffffffffffffffffffffffffff16612050611d69565b73ffffffffffffffffffffffffffffffffffffffff16146120a6576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161209d906131ac565b60405180910390fd5b565b60006120d67f6b036347fe95834a8400570089b522cc7f6ee075df5686a43579a4b845d39d7960001b612027565b6121027f2da7bdb9be52d17ab420216821678b4ee03dbd4d36dd472eb8bcf123cbc6bbfd60001b612027565b61212e7f323c2a81ed9f5c42375e407c602003fb0b9847447e5f6032c6a9dead6ef5d8c060001b612027565b6000848051906020012090506121667faec31ed0324d18df6f75109a3a0d4509b5538f55ad344a07e64f2a029af38c0960001b612027565b6121927fb3213d54e28d2100852da5a954d55ed23e16daa9a1b7242957d5e70e654a370760001b612027565b6000816040516020016121a59190613244565b6040516020818303038152906040528051906020012090506121e97fe0ee4265dbcdb7cd2e37a177a3aba4ddb0c81cdd11e187debb6fc377dd4824cb60001b612027565b6122157ff5201290c4df3b693623c22f780b2a332283967853495c7b766f62154e38218160001b612027565b6000600182876000015188602001518960400151604051600081526020016040526040516122469493929190613288565b6020604051602081039080840390855afa158015612268573d6000803e3d6000fd5b5050506020604051035190506122a07ffa93c129446a2a1ff8a99c6e97299016529ce56184eda57bcfb673ed695ce96260001b612027565b6122cc7f824857c220553954902d0e0d8247c7b78a2b9bc25f474ccd9e37175948f0a1b160001b612027565b8473ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff161493505050509392505050565b6000603360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905081603360006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b6000808273ffffffffffffffffffffffffffffffffffffffff163b119050919050565b600060019054906101000a900460ff1661243f576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016124369061333f565b60405180910390fd5b612447612451565b565b600033905090565b600060019054906101000a900460ff166124a0576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016124979061333f565b60405180910390fd5b6124b06124ab612449565b612307565b565b6000604051905090565b600080fd5b600080fd5b6000819050919050565b6124d9816124c6565b81146124e457600080fd5b50565b6000813590506124f6816124d0565b92915050565b600060208284031215612512576125116124bc565b5b6000612520848285016124e7565b91505092915050565b612532816124c6565b82525050565b600060208201905061254d6000830184612529565b92915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061257e82612553565b9050919050565b61258e81612573565b811461259957600080fd5b50565b6000813590506125ab81612585565b92915050565b6000602082840312156125c7576125c66124bc565b5b60006125d58482850161259c565b91505092915050565b600080fd5b600080fd5b600080fd5b60008083601f840112612603576126026125de565b5b8235905067ffffffffffffffff8111156126205761261f6125e3565b5b60208301915083606082028301111561263c5761263b6125e8565b5b9250929050565b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b61269182612648565b810181811067ffffffffffffffff821117156126b0576126af612659565b5b80604052505050565b60006126c36124b2565b90506126cf8282612688565b919050565b600060ff82169050919050565b6126ea816126d4565b81146126f557600080fd5b50565b600081359050612707816126e1565b92915050565b6000819050919050565b6127208161270d565b811461272b57600080fd5b50565b60008135905061273d81612717565b92915050565b60006060828403121561275957612758612643565b5b61276360606126b9565b90506000612773848285016126f8565b60008301525060206127878482850161272e565b602083015250604061279b8482850161272e565b60408301525092915050565b60008060008060008060e087890312156127c4576127c36124bc565b5b60006127d289828a016124e7565b965050602087013567ffffffffffffffff8111156127f3576127f26124c1565b5b6127ff89828a016125ed565b9550955050604061281289828a016124e7565b935050606061282389828a016124e7565b925050608061283489828a01612743565b9150509295509295509295565b6000819050919050565b600061286661286161285c84612553565b612841565b612553565b9050919050565b60006128788261284b565b9050919050565b600061288a8261286d565b9050919050565b61289a8161287f565b82525050565b60006020820190506128b56000830184612891565b92915050565b6128c481612573565b82525050565b60006020820190506128df60008301846128bb565b92915050565b60006128f08261286d565b9050919050565b612900816128e5565b82525050565b600060208201905061291b60008301846128f7565b92915050565b60008151905061293081612585565b92915050565b60006020828403121561294c5761294b6124bc565b5b600061295a84828501612921565b91505092915050565b600081519050919050565b600082825260208201905092915050565b60005b8381101561299d578082015181840152602081019050612982565b838111156129ac576000848401525b50505050565b60006129bd82612963565b6129c7818561296e565b93506129d781856020860161297f565b6129e081612648565b840191505092915050565b60006020820190508181036000830152612a0581846129b2565b905092915050565b60058110612a1a57600080fd5b50565b600081519050612a2c81612a0d565b92915050565b600081519050612a41816124d0565b92915050565b600060a08284031215612a5d57612a5c612643565b5b612a6760a06126b9565b90506000612a7784828501612a1d565b6000830152506020612a8b84828501612a32565b6020830152506040612a9f84828501612a32565b6040830152506060612ab384828501612a32565b6060830152506080612ac784828501612a32565b60808301525092915050565b600060a08284031215612ae957612ae86124bc565b5b6000612af784828501612a47565b91505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000612b3a826124c6565b9150612b45836124c6565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff03821115612b7a57612b79612b00565b5b828201905092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b6000606082019050612bf860008301866128bb565b612c0560208301856128bb565b612c126040830184612529565b949350505050565b60008115159050919050565b612c2f81612c1a565b8114612c3a57600080fd5b50565b600081519050612c4c81612c26565b92915050565b600060208284031215612c6857612c676124bc565b5b6000612c7684828501612c3d565b91505092915050565b6000604082019050612c946000830185612529565b612ca16020830184612529565b9392505050565b600082825260208201905092915050565b6000819050919050565b6000612cd260208401846124e7565b905092915050565b612ce3816124c6565b82525050565b600081359050612cf881612c26565b92915050565b6000612d0d6020840184612ce9565b905092915050565b612d1e81612c1a565b82525050565b60608201612d356000830183612cc3565b612d426000850182612cda565b50612d506020830183612cc3565b612d5d6020850182612cda565b50612d6b6040830183612cfe565b612d786040850182612d15565b50505050565b6000612d8a8383612d24565b60608301905092915050565b600082905092915050565b6000606082019050919050565b6000612dba8385612ca8565b9350612dc582612cb9565b8060005b85811015612dfe57612ddb8284612d96565b612de58882612d7e565b9750612df083612da1565b925050600181019050612dc9565b5085925050509392505050565b6000608082019050612e206000830188612529565b8181036020830152612e33818688612dae565b9050612e426040830185612529565b612e4f6060830184612529565b9695505050505050565b6000604082019050612e6e60008301856128bb565b612e7b6020830184612529565b9392505050565b600060208284031215612e9857612e976124bc565b5b6000612ea684828501612ce9565b91505092915050565b6000612eba826124c6565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff821415612eed57612eec612b00565b5b600182019050919050565b7f496e697469616c697a61626c653a20636f6e747261637420697320616c72656160008201527f647920696e697469616c697a6564000000000000000000000000000000000000602082015250565b6000612f54602e8361296e565b9150612f5f82612ef8565b604082019050919050565b60006020820190508181036000830152612f8381612f47565b9050919050565b6000819050919050565b6000612faf612faa612fa584612f8a565b612841565b6126d4565b9050919050565b612fbf81612f94565b82525050565b6000602082019050612fda6000830184612fb6565b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b600061301a826124c6565b9150613025836124c6565b92508261303557613034612fe0565b5b828204905092915050565b600061304b826124c6565b9150613056836124c6565b92508282101561306957613068612b00565b5b828203905092915050565b600061307f826124c6565b915061308a836124c6565b9250817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff04831182151516156130c3576130c2612b00565b5b828202905092915050565b7f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160008201527f6464726573730000000000000000000000000000000000000000000000000000602082015250565b600061312a60268361296e565b9150613135826130ce565b604082019050919050565b600060208201905081810360008301526131598161311d565b9050919050565b7f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572600082015250565b600061319660208361296e565b91506131a182613160565b602082019050919050565b600060208201905081810360008301526131c581613189565b9050919050565b600081905092915050565b7f19457468657265756d205369676e6564204d6573736167653a0a333200000000600082015250565b600061320d601c836131cc565b9150613218826131d7565b601c82019050919050565b6000819050919050565b61323e6132398261270d565b613223565b82525050565b600061324f82613200565b915061325b828461322d565b60208201915081905092915050565b6132738161270d565b82525050565b613282816126d4565b82525050565b600060808201905061329d600083018761326a565b6132aa6020830186613279565b6132b7604083018561326a565b6132c4606083018461326a565b95945050505050565b7f496e697469616c697a61626c653a20636f6e7472616374206973206e6f74206960008201527f6e697469616c697a696e67000000000000000000000000000000000000000000602082015250565b6000613329602b8361296e565b9150613334826132cd565b604082019050919050565b600060208201905081810360008301526133588161331c565b905091905056fea264697066735822122067f95131b132efaeeffa6ca8bbaf00ffff9e3ce1136f27e9fd9e10474bd7ab8864736f6c63430008090033";

type PookyGameConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: PookyGameConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class PookyGame__factory extends ContractFactory {
  constructor(...args: PookyGameConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<PookyGame> {
    return super.deploy(overrides || {}) as Promise<PookyGame>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): PookyGame {
    return super.attach(address) as PookyGame;
  }
  override connect(signer: Signer): PookyGame__factory {
    return super.connect(signer) as PookyGame__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): PookyGameInterface {
    return new utils.Interface(_abi) as PookyGameInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): PookyGame {
    return new Contract(address, _abi, signerOrProvider) as PookyGame;
  }
}