# Pooky Smart Contracts

[![Licensed under MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
![Solidity 0.8.21](https://img.shields.io/badge/Solidity-0.8.21-%23363636?style=flat-square&logo=solidity)
[![OpenZeppelin 4.9](https://img.shields.io/badge/OpenZeppelin-4.9-%234E5EE4?style=flat-square&logo=openzeppelin)](https://docs.openzeppelin.com/contracts/4.x/)
[![Code coverage](https://img.shields.io/codecov/c/gh/pooky-labs/smart-contracts?logo=codecov&style=flat-square&token=Ks4qCi1bN3)](https://app.codecov.io/gh/pooky-labs/smart-contracts)

For more details about the internal architecture of the repository, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Contracts

| Contract                                                                                                                      | Address on Polygon                                                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| [`Energy`](https://github.com/pooky-labs/smart-contracts/blob/af1f5206baf678920a488d6b240e11e915676e38/src/common/Energy.sol) | [`0x356fB0fE98023239b240795003595dbCb63c57cd`](https://polygonscan.com/address/0x356fB0fE98023239b240795003595dbCb63c57cd#code) |
| [`NonceRegistry`](src/common/NonceRegistry.sol)                                                                               | [`0xB08Ee469Dcf9c40B77261d8665A8BbdFad22B818`](https://polygonscan.com/address/0xB08Ee469Dcf9c40B77261d8665A8BbdFad22B818#code) |
| [`Rewards`](src/common/Rewards.sol)                                                                                           | [`0x64A85fb2Ca5ebdC70cBa233a7Ea94672BeF5B372`](https://polygonscan.com/address/0x64A85fb2Ca5ebdC70cBa233a7Ea94672BeF5B372#code) |
| [`Pookyball`](src/pookyball/Pookyball.sol)                                                                                    | [`0xb4859acd9B0A65CA4897c31e5cb5160D9Ff32C0A`](https://polygonscan.com/address/0xb4859acd9B0A65CA4897c31e5cb5160D9Ff32C0A#code) |
| [`PookyballLevel`](src/pookyball/PookyballLevel.sol)                                                                          | [`0xeD494677cf1454ac962ECCA5940B2E787f3095Fc`](https://polygonscan.com/address/0xeD494677cf1454ac962ECCA5940B2E787f3095Fc#code) |
| [`Pressure`](src/pookyball/Pressure.sol)                                                                                      | [`0xa34223AD4d42CB041056287784FE1F91a7e5b21A`](https://polygonscan.com/address/0xa34223AD4d42CB041056287784FE1F91a7e5b21A#code) |
| [`RefillableSale`](src/pookyball/RefillableSale.sol)                                                                          | [`0x57f48000b7573dd55963f15a1bf2490e43fee41c`](https://polygonscan.com/address/0x57f48000b7573dd55963f15a1bf2490e43fee41c#code) |
| [`Stickers`](src/stickers/Stickers.sol)                                                                                       | [`0x440D4955a914D5e29F861aC024A608aE41c56cB6`](https://polygonscan.com/address/0x440D4955a914D5e29F861aC024A608aE41c56cB6#code) |
| [`StickersController`](src/stickers/StickersController.sol)                                                                   | [`0x75cc3c6329930758659eD87338B926c90e16d05F`](https://polygonscan.com/address/0x75cc3c6329930758659eD87338B926c90e16d05F#code) |
| [`StickersManager`](src/stickers/StickersManager.sol)                                                                         | [`0x534Fda3d9C8A08FD0E57DE8c1Af9B32987614bA1`](https://polygonscan.com/address/0x534Fda3d9C8A08FD0E57DE8c1Af9B32987614bA1#code) |
| [`StickersLevelUp`](src/stickers/StickersLevelUp.sol)                                                                         | [`0x766e81AF624Cd6D2615EF675bDca2aB1ffBCBCbE`](https://polygonscan.com/address/0x766e81AF624Cd6D2615EF675bDca2aB1ffBCBCbE#code) |
| [`StickersSale`](src/stickers/StickersSale.sol)                                                                               | [`0x5d10f5685271b4dc21943438eac77ca549ac3d36`](https://polygonscan.com/address/0x5d10f5685271b4dc21943438eac77ca549ac3d36#code) |
| [`POK`](src/tokens/POK.sol)                                                                                                   | [`0x7b7E3B03f34b17d70C276C4886467D58867Bbc94`](https://polygonscan.com/address/0x7b7E3B03f34b17d70C276C4886467D58867Bbc94#code) |

## Governance

### Maintainers

- Mathieu Bour <[mathieu.bour@pooky.gg](mailto:mathieu.bour@pooky.gg)>, Blockchain Engineer, Pooky Labs

### Contributors

- Claudiu Micu <[claudiu.micu@pooky.gg](mailto:claudiu.micu@pooky.gg)>, Software Engineer, Pooky Labs
- Dusan Zdravkovic <[duxxud@gmail.com](mailto:duxxud@gmail.com)>, Former Blockchain Engineer, Pooky Labs

### On-chain maintenance

Most of the Pooky smart contracts are either Ownable or role-based.
We mainly use the following permission contracts:

- [solady/auth/Ownable.sol](https://github.com/Vectorized/solady/blob/main/src/auth/Ownable.sol)
- [solady/auth/OwnableRoles.sol](https://github.com/Vectorized/solady/blob/main/src/auth/OwnableRoles.sol)
- [openzeppelin/access/IAccessControl.sol](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/17c1a3a4584e2cbbca4131f2f1d16168c92f2310/contracts/access/AccessControl.sol)

The administrative privilege of granting/revoking roles is handled by a multi-signature wallet owned by multiple
engineers of Pooky Labs.
The address of the current multi-signature admin wallet is [`0x3CC4F4372F83ad3C577eD6e1Aae3D244A1b955D5`](https://polygonscan.com/address/0x3CC4F4372F83ad3C577eD6e1Aae3D244A1b955D5).

The Pooky dApp [pooky.gg](https://pooky.gg/app) serves as reference to the "official" Pooky smart contracts, effectively serving as smart-contracts proxy.
Pooky Labs may switch the contract implementations at any time on the app.
In this scenario of a token upgrades, Pooky Labs commits to airdrop the tokens to their owners in the new implementation.
