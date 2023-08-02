# Contribute

Thanks for considering contributing to Pooky smart contracts!
This document briefly describes how we have organized the [pooky-labs/smart-contracts](https://github.com/pooky-labs/smart-contracts) repository.

This repository uses the following environment:

- [Foundry](https://book.getfoundry.sh/)
- Node.js LTS (18.x since October 2022)
- pnpm 7.x ([learn how to install pnpm](https://pnpm.io/installation))

## Repository organization

We use [Foundry](https://book.getfoundry.sh/) as our main framework for developing our smart contracts.
Our smart contracts repository is based on a standard Foundry architecture.

```
.
├── abi             # Pooky contracts ABIs
├── artifacts       # (git-ignored) Foundry compile artifacts
├── cache           # (git-ignored) Foundry cache
├── coverage        # (git-ignored) Code-coverage reports
├── lib             # Foundry dependencies
├── node_modules    # (git-ignored) Project Node dependencies
├── script          # Runnable Foundry scripts
├── src             # Smart contracts Solidity source code
└── test            # Smart contracts tests
```

## Testing

Contract unit tests are located inside the [`test/`](./test) directory.
Each contract has it own test file that contains its unit tests.

```
src/tokens/POK.sol       => test/tokens/POK.t.sol
src/tokens/Pookyball.sol => test/tokens/Pookyball.t.sol
etc.
```

## Useful resources

- [Foundry Book](https://book.getfoundry.sh/)
- [OpenZeppelin Contracts 4.x](https://docs.openzeppelin.com/contracts/4.x/)
- [Polygon Mumbai Testnet Faucet](https://mumbaifaucet.com/)
