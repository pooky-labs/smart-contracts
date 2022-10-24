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
