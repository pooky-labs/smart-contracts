# Pooky Smart Contracts

[![Licensed under MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
![Solidity 0.8.17](https://img.shields.io/badge/Solidity-0.8.17-%23363636?style=flat-square&logo=solidity)
[![OpenZeppelin 4.x](https://img.shields.io/badge/OpenZeppelin-4.x-%234E5EE4?style=flat-square&logo=openzeppelin)](https://docs.openzeppelin.com/contracts/4.x/)
![Audit: pending](https://img.shields.io/badge/audit-pending-yellowgreen?style=flat-square)
[![Code coverage](https://img.shields.io/codecov/c/gh/pooky-labs/smart-contracts?logo=codecov&style=flat-square&token=Ks4qCi1bN3)](https://app.codecov.io/gh/pooky-labs/smart-contracts)

## Contracts

| Contract                                        | Address on Polygon                                                                                                              |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| [`POK`](contracts/tokens/POK.sol)               | [`0x7b7E3B03f34b17d70C276C4886467D58867Bbc94`](https://polygonscan.com/address/0x7b7E3B03f34b17d70C276C4886467D58867Bbc94#code) |
| [`Pookyball`](contracts/tokens/Pookyball.sol)   | [`0xb4859acd9B0A65CA4897c31e5cb5160D9Ff32C0A`](https://polygonscan.com/address/0xb4859acd9B0A65CA4897c31e5cb5160D9Ff32C0A#code) |
| [`GenesisSale`](contracts/mint/GenesisSale.sol) | [`0x458d47753182317a6EA16060bF0E40f9B3E8189C`](https://polygonscan.com/address/0x458d47753182317a6EA16060bF0E40f9B3E8189C#code) |
| [`WaitList`](contracts/mint/WaitList.sol)       | [`0xFA6ADc62ce95deD2e4649AFaf89521Cf4fF4A09F`](https://polygonscan.com/address/0xFA6ADc62ce95deD2e4649AFaf89521Cf4fF4A09F#code) |
| [`Airdrop`](contracts/game/Airdrop.sol)         | [`0xE9d0a2B783e3d9C94E8b92A8De0e7D72458D51d2`](https://polygonscan.com/address/0xE9d0a2B783e3d9C94E8b92A8De0e7D72458D51d2#code) |
| [`Energy`](contracts/game/Energy.sol)           | [`0x22021D710878c216935C967A49212b38eBe295Fe`](https://polygonscan.com/address/0x22021D710878c216935C967A49212b38eBe295Fe#code) |
| [`Level`](contracts/game/Level.sol)             | [`0x5167ea68F094dD234732dF09B2f66D8357Bbe1D3`](https://polygonscan.com/address/0x5167ea68F094dD234732dF09B2f66D8357Bbe1D3#code) |
| [`Pressure`](contracts/game/Pressure.sol)       | [`0xb938630B8bcf67bF4C2e9617a5d288F9a7F817b8`](https://polygonscan.com/address/0xb938630B8bcf67bF4C2e9617a5d288F9a7F817b8#code) |
| [`Rewards`](contracts/game/Rewards.sol)         | [`0x632c95131A4345e5ed5b5448f6c809c956732B6F`](https://polygonscan.com/address/0x632c95131A4345e5ed5b5448f6c809c956732B6F#code) |

## Governance

### Maintainers

- Mathieu Bour <[mathieu.bour@pooky.gg](mailto:mathieu.bour@pooky.gg)>, Blockchain Engineer, Pooky Labs

### Contributors

- Claudiu Micu <[claudiu.micu@pooky.gg](mailto:claudiu.micu@pooky.gg)>, Software Engineer, Pooky Labs
- Dusan Zdravkovic <[duxxud@gmail.com](mailto:duxxud@gmail.com)>, Former Blockchain Engineer, Pooky Labs

### On-chain maintenance

Most of the Pooky smart contracts are based on the OpenZeppelin [`AccessControl`](https://docs.openzeppelin.com/contracts/4.x/api/access#AccessControl) smart contract, providing fine-grained
permissions to the contracts.
For example, the `MINTER` role is allowed to freely mint $POK tokens.

The administrative privilege of granting/revoking roles is handled by a multi-signature wallet owned by multiple
engineers of Pooky Labs.
The address of the current multi-signature admin wallet is [`0x3CC4F4372F83ad3C577eD6e1Aae3D244A1b955D5`](https://polygonscan.com/address/0x3CC4F4372F83ad3C577eD6e1Aae3D244A1b955D5).

The Pooky dApp [app.pooky.gg](https://app.pooky.gg) serves as reference to the "official" Pooky smart contracts, effectively serving as
smart-contracts proxy.
Pooky Labs may switch the contract implementation at any time on the app.
In this scenario, Pooky Labs commits to airdrop the tokens to their owners in the new implementation.
