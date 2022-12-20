# Contribute

Thanks for considering contributing to Pooky smart contracts!
This document briefly describes how we have organized the [pooky-labs/smart-contracts](https://github.com/pooky-labs/smart-contracts) repository.

This repository uses the following environment:

- Node.js LTS (18.x since October 2022)
- pnpm 7.x ([learn how to install pnpm](https://pnpm.io/installation))

## Repository organization

We use [Hardhat](https://hardhat.org/hardhat-runner/docs/getting-started) as our main framework for developing our smart contracts.
Our smart contracts repository is based on a standard Hardhat architecture.

```
.
├── artifacts       # (git-ignored) HardHat compile artifacts
├── cache           # (git-ignored) HardHat cache
├── contracts       # Smart contracts Solidity source code
├── coverage        # (git-ignored) Code-coverage reports
├── lib             # TypeScript source code
├── node_modules    # (git-ignored) Project dependencies
├── scripts         # Runnable HardHat scripts
├── tasks           # Custom HardHat tasks
├── test            # Smart contracts tests
└── typechain-types # (git-ignored) TypeChain-generated typings
```

## Testing

Contract unit tests are located inside the [`test/`](./test) directory.
Each contract has it own test file that contains its unit tests.

```
contracts/tokens/POK.sol       => test/tokens/POK.spec.ts
contracts/tokens/Pookyball.sol => test/tokens/Pookyball.spec.ts
etc.
```

## Useful resources

- OpenZeppelin Upgradable contracts: [documentation](https://docs.openzeppelin.com/upgrades-plugins/1.x/writing-upgradeable) / [repository](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable#readme)
- [TypeChain: TypeScript bindings for Ethereum smart contracts](https://github.com/dethcrypto/TypeChain)
- [Polygon Mumbai Testnet Faucet](https://mumbaifaucet.com/)
