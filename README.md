# Pooky Smart Contracts

[![Licensed under MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Audit: pending](https://img.shields.io/badge/audit-pending-yellowgreen?style=flat-square)](#)
[![Code coverage](https://img.shields.io/codecov/c/gh/pooky-labs/smart-contracts?logo=codecov&style=flat-square&token=Ks4qCi1bN3)](https://app.codecov.io/gh/pooky-labs/smart-contracts)

## Contribute

This repository uses the following environment:

- Node.js LTS (18.x since October 2022)
- npm 8.x

### Repository organization

```
.
├── artifacts     # (git-ignored) HardHat compile artifacts
├── cache         # (git-ignored) HardHat cache
├── contracts     # Smart contracts Solidity source code
├── coverage      # (git-ignored) Code-coverage reports
├── diagrams
├── docs          # Contract API referece (generated with OpenZeppelin soldity-docgen)
├── lib           # TypeScript source code
├── node_modules  # (git-ignored) Project dependencies
├── scripts       # Runnable HardHat scripts
├── static        # Static assets
├── tasks         # Custom HardHat tasks
├── test          # Smart contracts tests
└── typings       # (git-ignored) TypeChain-generated typings
```

### Testing

Contract unit tests are located inside the [`test/`](./test) directory. Each contract has it own test file that contains
its unit tests.

```
contracts/POK.sol       => test/POK.spec.ts
contracts/Pookyball.sol => test/Pookyball.spec.ts
etc.
```

### Useful resources

- OpenZeppelin Upgradable contracts: [documentation](https://docs.openzeppelin.com/upgrades-plugins/1.x/writing-upgradeable) / [repository](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable#readme)
- [TypeChain: TypeScript bindings for Ethereum smart contracts](https://github.com/dethcrypto/TypeChain)
- [Polygon Mumbai Testnet Faucet](https://mumbaifaucet.com/)

## Smart contracts organization

[Smart contracts diagrams](./diagrams/readme.md)

### Pooky Wallets
- `EXEC_WALLET` - Multisig wallet owned by Pooky Executives team.
- `TECH_WALLET` - Multisig wallet owned by Pooky Technical team.
- `REWARD_SIGNER_WALLET` - Wallet which is stored securely on the backend, used to sign rewards.
- `TimelockAdmin` - Timelock contract to set delay of 48h on transaction execution. Proposers for transactions will be `EXEC_WALLET` and `TECH_WALLET`, transaction executors will be restricted to `EXEC_WALLET`.

### Roles
- `ProxyAdmin`
  - Used in all proxy contracts.
  - This role can upgrade and change implementation contracts. Only address which will have this permission is `TimelockAdmin` contract 

- `DEFAULT_ADMIN_ROLE` 
  - Used in `POK.sol`, `Pookyball.sol`, `PookyballMinter.sol`, `PookyballGenesisMinter.sol`, `PookyGame.sol`
  - Only address which will have these permissions is `TimelockAdmin` contract
    - Can add/remove roles on contracts
    - Can enable/disable transfer of $POK tokens
    - Can set contractURI on `Pookyball.sol`
    - Can set Pookyball and POK contract addresses on `PookyballMinter.sol` and `PookyGame.sol`
    - Can set treasury wallet on `PookyballGenesisMinter.sol`
    - Can withdraw funds on `PookyGame.sol`


- `POOKY_CONTRACT`
  - Used in `POK.sol` and `Pookyball.sol`
  - Only addresses which will have these permissions are other Pooky smart contracts (`PookyballMinter.sol`, `PookyballGenesisMinter.sol`, `PookyGame.sol`).
    - Can mint $POK or burn from it's address. Can send/receive $POK while transfer is disabled
    - Can mint new balls on `Pookyball.sol`
    - Can change ball parameters (setRandomEntropy, change level, change pxp) on `Pookyball.sol`

- `TECH`
  - Used in `PookyballGenesisMinter.sol` and `PookyballMinter.sol`
  - Only address which will have these permissions is `TECH_WALLET`. 
    - Can set tiers for accounts on `PookyballGenesisMinter.sol`
    - Can set minimum tier which can mint, and maximum number of mints per account, on `PookyballGenesisMinter.sol`
    - Can create and enable/disable mint templates on `PookyballMinter.sol`
    - Can change Chainlink VRF parameters on `PookyballMinter.sol`

- `REWARD_SIGNER`
  - Used in `PookyGame.sol`
  - Only address which will have these permissions is `REWARD_SIGNER_WALLET` 
    - Can sign parameters for claiming rewards on `PookyGame.sol`
