# Pooky Smart Contracts

[![Licensed under MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
![Solidity 0.8.20](https://img.shields.io/badge/Solidity-0.8.20-%23363636?style=flat-square&logo=solidity)
[![OpenZeppelin 4.x](https://img.shields.io/badge/OpenZeppelin-4.x-%234E5EE4?style=flat-square&logo=openzeppelin)](https://docs.openzeppelin.com/contracts/4.x/)
[![Code coverage](https://img.shields.io/codecov/c/gh/pooky-labs/smart-contracts?logo=codecov&style=flat-square&token=Ks4qCi1bN3)](https://app.codecov.io/gh/pooky-labs/smart-contracts)

For more details about the internal architecture of the repository, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Contracts

| Contract                                              | Address on Polygon                                                                                                              |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| [`POK`](contracts/tokens/POK.sol)                     | [`0x7b7E3B03f34b17d70C276C4886467D58867Bbc94`](https://polygonscan.com/address/0x7b7E3B03f34b17d70C276C4886467D58867Bbc94#code) |
| [`Pookyball`](contracts/tokens/Pookyball.sol)         | [`0xb4859acd9B0A65CA4897c31e5cb5160D9Ff32C0A`](https://polygonscan.com/address/0xb4859acd9B0A65CA4897c31e5cb5160D9Ff32C0A#code) |
| [`RefillableSale`](contracts/mint/RefillableSale.sol) | [`0x57f48000b7573dd55963f15a1bf2490e43fee41c`](https://polygonscan.com/address/0x57f48000b7573dd55963f15a1bf2490e43fee41c#code) |
| [`NonceRegistry`](contracts/game/NonceRegistry.sol)   | [`0xB08Ee469Dcf9c40B77261d8665A8BbdFad22B818`](https://polygonscan.com/address/0xB08Ee469Dcf9c40B77261d8665A8BbdFad22B818#code) |
| [`PookyballLevel`](contracts/game/PookyballLevel.sol) | [`0x2D089721F64036753B28FbF78081dC39d57654d9`](https://polygonscan.com/address/0x2D089721F64036753B28FbF78081dC39d57654d9#code) |
| [`Pressure`](contracts/game/Pressure.sol)             | [`0xa34223AD4d42CB041056287784FE1F91a7e5b21A`](https://polygonscan.com/address/0xa34223AD4d42CB041056287784FE1F91a7e5b21A#code) |
| [`Rewards`](contracts/game/Rewards.sol)               | [`0x64A85fb2Ca5ebdC70cBa233a7Ea94672BeF5B372`](https://polygonscan.com/address/0x64A85fb2Ca5ebdC70cBa233a7Ea94672BeF5B372#code) |

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
