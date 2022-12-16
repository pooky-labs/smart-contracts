/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type { POK, POKInterface } from "../../../contracts/tokens/POK";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "Soulbounded",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
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
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [],
    name: "BURNER",
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
    name: "MINTER",
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
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
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
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
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
    name: "balanceOf",
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
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "burn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "subtractedValue",
        type: "uint256",
      },
    ],
    name: "decreaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
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
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "addedValue",
        type: "uint256",
      },
    ],
    name: "increaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
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
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
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
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60806040523480156200001157600080fd5b506040518060400160405280600381526020017f504f4b00000000000000000000000000000000000000000000000000000000008152506040518060400160405280600381526020017f504f4b000000000000000000000000000000000000000000000000000000000081525081600390816200008f9190620004f5565b508060049081620000a19190620004f5565b505050620000c0675fc41a43427231f460c01b6200011360201b60201c565b620000dc67cb53f2c91be005e560c01b6200011360201b60201c565b620000f8673fa91bfda84e0ab560c01b6200011360201b60201c565b6200010d6000801b336200011660201b60201c565b620005dc565b50565b6200012882826200020860201b60201c565b620002045760016005600084815260200190815260200160002060000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff021916908315150217905550620001a96200027360201b60201c565b73ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16837f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a45b5050565b60006005600084815260200190815260200160002060000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16905092915050565b600033905090565b600081519050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b60006002820490506001821680620002fd57607f821691505b602082108103620003135762000312620002b5565b5b50919050565b60008190508160005260206000209050919050565b60006020601f8301049050919050565b600082821b905092915050565b6000600883026200037d7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff826200033e565b6200038986836200033e565b95508019841693508086168417925050509392505050565b6000819050919050565b6000819050919050565b6000620003d6620003d0620003ca84620003a1565b620003ab565b620003a1565b9050919050565b6000819050919050565b620003f283620003b5565b6200040a6200040182620003dd565b8484546200034b565b825550505050565b600090565b6200042162000412565b6200042e818484620003e7565b505050565b5b8181101562000456576200044a60008262000417565b60018101905062000434565b5050565b601f821115620004a5576200046f8162000319565b6200047a846200032e565b810160208510156200048a578190505b620004a262000499856200032e565b83018262000433565b50505b505050565b600082821c905092915050565b6000620004ca60001984600802620004aa565b1980831691505092915050565b6000620004e58383620004b7565b9150826002028217905092915050565b62000500826200027b565b67ffffffffffffffff8111156200051c576200051b62000286565b5b620005288254620002e4565b620005358282856200045a565b600060209050601f8311600181146200056d576000841562000558578287015190505b620005648582620004d7565b865550620005d4565b601f1984166200057d8662000319565b60005b82811015620005a75784890151825560018201915060208501945060208101905062000580565b86831015620005c75784890151620005c3601f891682620004b7565b8355505b6001600288020188555050505b505050505050565b61270f80620005ec6000396000f3fe608060405234801561001057600080fd5b50600436106101425760003560e01c806340c10f19116100b8578063a217fddf1161007c578063a217fddf1461039d578063a457c2d7146103bb578063a9059cbb146103eb578063d547741f1461041b578063dd62ed3e14610437578063fe6d81241461046757610142565b806340c10f19146102e757806370a082311461030357806391d148541461033357806395d89b41146103635780639dc29fac1461038157610142565b806323b872dd1161010a57806323b872dd14610201578063248a9ca3146102315780632f2ff15d14610261578063313ce5671461027d57806336568abe1461029b57806339509351146102b757610142565b806301ffc9a71461014757806306fdde0314610177578063095ea7b314610195578063118c4f13146101c557806318160ddd146101e3575b600080fd5b610161600480360381019061015c9190611a02565b610485565b60405161016e9190611a4a565b60405180910390f35b61017f6104ff565b60405161018c9190611af5565b60405180910390f35b6101af60048036038101906101aa9190611bab565b610591565b6040516101bc9190611a4a565b60405180910390f35b6101cd6105b4565b6040516101da9190611c04565b60405180910390f35b6101eb6105d8565b6040516101f89190611c2e565b60405180910390f35b61021b60048036038101906102169190611c49565b6105e2565b6040516102289190611a4a565b60405180910390f35b61024b60048036038101906102469190611cc8565b610611565b6040516102589190611c04565b60405180910390f35b61027b60048036038101906102769190611cf5565b610631565b005b610285610652565b6040516102929190611d51565b60405180910390f35b6102b560048036038101906102b09190611cf5565b61065b565b005b6102d160048036038101906102cc9190611bab565b6106de565b6040516102de9190611a4a565b60405180910390f35b61030160048036038101906102fc9190611bab565b610715565b005b61031d60048036038101906103189190611d6c565b6107b2565b60405161032a9190611c2e565b60405180910390f35b61034d60048036038101906103489190611cf5565b6107fa565b60405161035a9190611a4a565b60405180910390f35b61036b610865565b6040516103789190611af5565b60405180910390f35b61039b60048036038101906103969190611bab565b6108f7565b005b6103a5610994565b6040516103b29190611c04565b60405180910390f35b6103d560048036038101906103d09190611bab565b61099b565b6040516103e29190611a4a565b60405180910390f35b61040560048036038101906104009190611bab565b610a12565b6040516104129190611a4a565b60405180910390f35b61043560048036038101906104309190611cf5565b610a35565b005b610451600480360381019061044c9190611d99565b610a56565b60405161045e9190611c2e565b60405180910390f35b61046f610add565b60405161047c9190611c04565b60405180910390f35b60007f7965db0b000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff191614806104f857506104f782610b01565b5b9050919050565b60606003805461050e90611e08565b80601f016020809104026020016040519081016040528092919081815260200182805461053a90611e08565b80156105875780601f1061055c57610100808354040283529160200191610587565b820191906000526020600020905b81548152906001019060200180831161056a57829003601f168201915b5050505050905090565b60008061059c610b6b565b90506105a9818585610b73565b600191505092915050565b7f9667e80708b6eeeb0053fa0cca44e028ff548e2a9f029edfeac87c118b08b7c881565b6000600254905090565b6000806105ed610b6b565b90506105fa858285610d3c565b610605858585610dc8565b60019150509392505050565b600060056000838152602001908152602001600020600101549050919050565b61063a82610611565b6106438161103e565b61064d8383611052565b505050565b60006012905090565b610663610b6b565b73ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16146106d0576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016106c790611eab565b60405180910390fd5b6106da8282611133565b5050565b6000806106e9610b6b565b905061070a8185856106fb8589610a56565b6107059190611efa565b610b73565b600191505092915050565b61072967df5f65cfb239550060c01b611215565b7ff0887ba65ee2024ea881d91b74c2450ef19e1557f03bed3ea9f16b037cbe2dc96107538161103e565b6107676787216f77cb9929a460c01b611215565b61077b67437b41e07310360c60c01b611215565b61078f6713c90c5b590f89f960c01b611215565b6107a36778447339826167d060c01b611215565b6107ad8383611218565b505050565b60008060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b60006005600084815260200190815260200160002060000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16905092915050565b60606004805461087490611e08565b80601f01602080910402602001604051908101604052809291908181526020018280546108a090611e08565b80156108ed5780601f106108c2576101008083540402835291602001916108ed565b820191906000526020600020905b8154815290600101906020018083116108d057829003601f168201915b5050505050905090565b61090b671de2f3926bb98e3760c01b611215565b7f9667e80708b6eeeb0053fa0cca44e028ff548e2a9f029edfeac87c118b08b7c86109358161103e565b6109496789cd67b0a447c10460c01b611215565b61095d67c472a6af7ae3204960c01b611215565b61097167f29112bcafbcf89460c01b611215565b61098567138b22de4cf26e2360c01b611215565b61098f838361136e565b505050565b6000801b81565b6000806109a6610b6b565b905060006109b48286610a56565b9050838110156109f9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016109f090611fa0565b60405180910390fd5b610a068286868403610b73565b60019250505092915050565b600080610a1d610b6b565b9050610a2a818585610dc8565b600191505092915050565b610a3e82610611565b610a478161103e565b610a518383611133565b505050565b6000600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905092915050565b7ff0887ba65ee2024ea881d91b74c2450ef19e1557f03bed3ea9f16b037cbe2dc981565b60007f01ffc9a7000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916149050919050565b600033905090565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1603610be2576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610bd990612032565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603610c51576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610c48906120c4565b60405180910390fd5b80600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92583604051610d2f9190611c2e565b60405180910390a3505050565b6000610d488484610a56565b90507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8114610dc25781811015610db4576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610dab90612130565b60405180910390fd5b610dc18484848403610b73565b5b50505050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1603610e37576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610e2e906121c2565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603610ea6576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610e9d90612254565b60405180910390fd5b610eb183838361153b565b60008060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905081811015610f37576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610f2e906122e6565b60405180910390fd5b8181036000808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550816000808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825401925050819055508273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef846040516110259190611c2e565b60405180910390a36110388484846116a7565b50505050565b61104f8161104a610b6b565b6116ac565b50565b61105c82826107fa565b61112f5760016005600084815260200190815260200160002060000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055506110d4610b6b565b73ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16837f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a45b5050565b61113d82826107fa565b156112115760006005600084815260200190815260200160002060000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055506111b6610b6b565b73ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16837ff6391f5c32d9c69d2a47ea670b442974b53935d1edc7fd64eb21e047a839171b60405160405180910390a45b5050565b50565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603611287576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161127e90612352565b60405180910390fd5b6112936000838361153b565b80600260008282546112a59190611efa565b92505081905550806000808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825401925050819055508173ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040516113569190611c2e565b60405180910390a361136a600083836116a7565b5050565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16036113dd576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016113d4906123e4565b60405180910390fd5b6113e98260008361153b565b60008060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205490508181101561146f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161146690612476565b60405180910390fd5b8181036000808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555081600260008282540392505081905550600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef846040516115229190611c2e565b60405180910390a3611536836000846116a7565b505050565b61154f67c8e1378097e5004260c01b611215565b611563672e49217b3ed0c31060c01b611215565b611577675c2899e9c16ae8c260c01b611215565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff161480156115c357506115c2678d9fa0895b744f6960c01b611731565b5b806116165750600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16148015611615575061161467e78f9201556689f660c01b611731565b5b5b156116485761162f67d8d7b1d9874fca3560c01b611215565b61164367bd53c2d65fb128fd60c01b611215565b6116a2565b61165c67e5aef7246290a2f860c01b611215565b61167067a1238086341a33ca60c01b611215565b6040517fc02d675500000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b505050565b505050565b6116b682826107fa565b61172d576116c38161173c565b6116d18360001c6020611769565b6040516020016116e292919061256a565b6040516020818303038152906040526040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016117249190611af5565b60405180910390fd5b5050565b600060019050919050565b60606117628273ffffffffffffffffffffffffffffffffffffffff16601460ff16611769565b9050919050565b60606000600283600261177c91906125a4565b6117869190611efa565b67ffffffffffffffff81111561179f5761179e6125e6565b5b6040519080825280601f01601f1916602001820160405280156117d15781602001600182028036833780820191505090505b5090507f30000000000000000000000000000000000000000000000000000000000000008160008151811061180957611808612615565b5b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a9053507f78000000000000000000000000000000000000000000000000000000000000008160018151811061186d5761186c612615565b5b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a905350600060018460026118ad91906125a4565b6118b79190611efa565b90505b6001811115611957577f3031323334353637383961626364656600000000000000000000000000000000600f8616601081106118f9576118f8612615565b5b1a60f81b8282815181106119105761190f612615565b5b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a905350600485901c94508061195090612644565b90506118ba565b506000841461199b576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611992906126b9565b60405180910390fd5b8091505092915050565b600080fd5b60007fffffffff0000000000000000000000000000000000000000000000000000000082169050919050565b6119df816119aa565b81146119ea57600080fd5b50565b6000813590506119fc816119d6565b92915050565b600060208284031215611a1857611a176119a5565b5b6000611a26848285016119ed565b91505092915050565b60008115159050919050565b611a4481611a2f565b82525050565b6000602082019050611a5f6000830184611a3b565b92915050565b600081519050919050565b600082825260208201905092915050565b60005b83811015611a9f578082015181840152602081019050611a84565b60008484015250505050565b6000601f19601f8301169050919050565b6000611ac782611a65565b611ad18185611a70565b9350611ae1818560208601611a81565b611aea81611aab565b840191505092915050565b60006020820190508181036000830152611b0f8184611abc565b905092915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000611b4282611b17565b9050919050565b611b5281611b37565b8114611b5d57600080fd5b50565b600081359050611b6f81611b49565b92915050565b6000819050919050565b611b8881611b75565b8114611b9357600080fd5b50565b600081359050611ba581611b7f565b92915050565b60008060408385031215611bc257611bc16119a5565b5b6000611bd085828601611b60565b9250506020611be185828601611b96565b9150509250929050565b6000819050919050565b611bfe81611beb565b82525050565b6000602082019050611c196000830184611bf5565b92915050565b611c2881611b75565b82525050565b6000602082019050611c436000830184611c1f565b92915050565b600080600060608486031215611c6257611c616119a5565b5b6000611c7086828701611b60565b9350506020611c8186828701611b60565b9250506040611c9286828701611b96565b9150509250925092565b611ca581611beb565b8114611cb057600080fd5b50565b600081359050611cc281611c9c565b92915050565b600060208284031215611cde57611cdd6119a5565b5b6000611cec84828501611cb3565b91505092915050565b60008060408385031215611d0c57611d0b6119a5565b5b6000611d1a85828601611cb3565b9250506020611d2b85828601611b60565b9150509250929050565b600060ff82169050919050565b611d4b81611d35565b82525050565b6000602082019050611d666000830184611d42565b92915050565b600060208284031215611d8257611d816119a5565b5b6000611d9084828501611b60565b91505092915050565b60008060408385031215611db057611daf6119a5565b5b6000611dbe85828601611b60565b9250506020611dcf85828601611b60565b9150509250929050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b60006002820490506001821680611e2057607f821691505b602082108103611e3357611e32611dd9565b5b50919050565b7f416363657373436f6e74726f6c3a2063616e206f6e6c792072656e6f756e636560008201527f20726f6c657320666f722073656c660000000000000000000000000000000000602082015250565b6000611e95602f83611a70565b9150611ea082611e39565b604082019050919050565b60006020820190508181036000830152611ec481611e88565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000611f0582611b75565b9150611f1083611b75565b9250828201905080821115611f2857611f27611ecb565b5b92915050565b7f45524332303a2064656372656173656420616c6c6f77616e63652062656c6f7760008201527f207a65726f000000000000000000000000000000000000000000000000000000602082015250565b6000611f8a602583611a70565b9150611f9582611f2e565b604082019050919050565b60006020820190508181036000830152611fb981611f7d565b9050919050565b7f45524332303a20617070726f76652066726f6d20746865207a65726f2061646460008201527f7265737300000000000000000000000000000000000000000000000000000000602082015250565b600061201c602483611a70565b915061202782611fc0565b604082019050919050565b6000602082019050818103600083015261204b8161200f565b9050919050565b7f45524332303a20617070726f766520746f20746865207a65726f20616464726560008201527f7373000000000000000000000000000000000000000000000000000000000000602082015250565b60006120ae602283611a70565b91506120b982612052565b604082019050919050565b600060208201905081810360008301526120dd816120a1565b9050919050565b7f45524332303a20696e73756666696369656e7420616c6c6f77616e6365000000600082015250565b600061211a601d83611a70565b9150612125826120e4565b602082019050919050565b600060208201905081810360008301526121498161210d565b9050919050565b7f45524332303a207472616e736665722066726f6d20746865207a65726f20616460008201527f6472657373000000000000000000000000000000000000000000000000000000602082015250565b60006121ac602583611a70565b91506121b782612150565b604082019050919050565b600060208201905081810360008301526121db8161219f565b9050919050565b7f45524332303a207472616e7366657220746f20746865207a65726f206164647260008201527f6573730000000000000000000000000000000000000000000000000000000000602082015250565b600061223e602383611a70565b9150612249826121e2565b604082019050919050565b6000602082019050818103600083015261226d81612231565b9050919050565b7f45524332303a207472616e7366657220616d6f756e742065786365656473206260008201527f616c616e63650000000000000000000000000000000000000000000000000000602082015250565b60006122d0602683611a70565b91506122db82612274565b604082019050919050565b600060208201905081810360008301526122ff816122c3565b9050919050565b7f45524332303a206d696e7420746f20746865207a65726f206164647265737300600082015250565b600061233c601f83611a70565b915061234782612306565b602082019050919050565b6000602082019050818103600083015261236b8161232f565b9050919050565b7f45524332303a206275726e2066726f6d20746865207a65726f2061646472657360008201527f7300000000000000000000000000000000000000000000000000000000000000602082015250565b60006123ce602183611a70565b91506123d982612372565b604082019050919050565b600060208201905081810360008301526123fd816123c1565b9050919050565b7f45524332303a206275726e20616d6f756e7420657863656564732062616c616e60008201527f6365000000000000000000000000000000000000000000000000000000000000602082015250565b6000612460602283611a70565b915061246b82612404565b604082019050919050565b6000602082019050818103600083015261248f81612453565b9050919050565b600081905092915050565b7f416363657373436f6e74726f6c3a206163636f756e7420000000000000000000600082015250565b60006124d7601783612496565b91506124e2826124a1565b601782019050919050565b60006124f882611a65565b6125028185612496565b9350612512818560208601611a81565b80840191505092915050565b7f206973206d697373696e6720726f6c6520000000000000000000000000000000600082015250565b6000612554601183612496565b915061255f8261251e565b601182019050919050565b6000612575826124ca565b915061258182856124ed565b915061258c82612547565b915061259882846124ed565b91508190509392505050565b60006125af82611b75565b91506125ba83611b75565b92508282026125c881611b75565b915082820484148315176125df576125de611ecb565b5b5092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b600061264f82611b75565b91506000820361266257612661611ecb565b5b600182039050919050565b7f537472696e67733a20686578206c656e67746820696e73756666696369656e74600082015250565b60006126a3602083611a70565b91506126ae8261266d565b602082019050919050565b600060208201905081810360008301526126d281612696565b905091905056fea264697066735822122061a59abf7e9aaa90c017a12192e228c4c8763569d8a90148e33437cc2564e79864736f6c63430008110033";

type POKConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: POKConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class POK__factory extends ContractFactory {
  constructor(...args: POKConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<POK> {
    return super.deploy(overrides || {}) as Promise<POK>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): POK {
    return super.attach(address) as POK;
  }
  override connect(signer: Signer): POK__factory {
    return super.connect(signer) as POK__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): POKInterface {
    return new utils.Interface(_abi) as POKInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): POK {
    return new Contract(address, _abi, signerOrProvider) as POK;
  }
}
