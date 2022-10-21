# <img src="static/pookyball.png" alt="Pookyball visual example" height="40px"/> Pooky Smart Contracts

[![Licensed under MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Audit: pending](https://img.shields.io/badge/audit-pending-yellowgreen?style=flat-square)](#)
[![Code coverage](https://img.shields.io/codecov/c/gh/pooky-labs/smart-contracts?logo=codecov&style=flat-square&token=Ks4qCi1bN3)](https://app.codecov.io/gh/pooky-labs/smart-contracts)

## Maintainers - core team

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/DuXXuD">
        <img src="https://avatars.githubusercontent.com/u/12116005?v=3?s=150" width="150px;" alt="Dusan Zdravkovic"/>
        <br />
        <b>Dusan Zdravkovic</b>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/mathieu-bour">
        <img src="https://avatars.githubusercontent.com/u/21281702?v=3?s=150" width="150px;" alt="Mathieu Bour"/>
        <br />
        <b>Mathieu Bour</b>
      </a>
    </td>
  </tr>
</table>

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
contracts/PookyBall.sol => test/PookyBall.spec.ts
etc.
```

### Useful resources

- OpenZeppelin Upgradable contracts: [documentation](https://docs.openzeppelin.com/upgrades-plugins/1.x/writing-upgradeable) / [repository](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable#readme)
- [TypeChain: TypeScript bindings for Ethereum smart contracts](https://github.com/dethcrypto/TypeChain)
- [Polygon Mumbai Testnet Faucet](https://mumbaifaucet.com/)
