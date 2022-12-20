# Pooky Smart Contracts

[![Licensed under MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Audit: pending](https://img.shields.io/badge/audit-pending-yellowgreen?style=flat-square)](#)
[![Code coverage](https://img.shields.io/codecov/c/gh/pooky-labs/smart-contracts?logo=codecov&style=flat-square&token=Ks4qCi1bN3)](https://app.codecov.io/gh/pooky-labs/smart-contracts)

## Governance

### Maintainers

- Mathieu Bour <mathieu.bour@pooky.gg>, Blockchain Engineer, Pooky Labs

### Contributors

- Dusan Zdravkovic <duxxud@gmail.com>, Former Blockchain Engineer, Pooky Labs

### On-chain maintenance

Most of the Pooky smart contracts are based on the OpenZeppelin AccessControl smart contract, providing fine-grained
permissions to the contracts.
For example, the MINTER role is allowed to freely mint $POK tokens.

The administrative privilege of granting/revoking roles is handled by a multi-signature wallet owned by multiple
engineers of Pooky Labs.
The Pooky dApp app.pooky.gg serves as reference to the "official" Pooky smart contracts, effectively serving as
smart-contracts proxy.
Pooky Labs may switch the contract implementation at any time on the app.
In this scenario, Pooky Labs commits to airdrop the tokens to their owners in the new implementation.
