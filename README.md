# Pooky Smart Contracts

[![Licensed under MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
![Solidity 0.8.21](https://img.shields.io/badge/Solidity-0.8.21-%23363636?style=flat-square&logo=solidity)
[![OpenZeppelin 4.9](https://img.shields.io/badge/OpenZeppelin-4.9-%234E5EE4?style=flat-square&logo=openzeppelin)](https://docs.openzeppelin.com/contracts/4.x/)
[![Code coverage](https://img.shields.io/codecov/c/gh/pooky-labs/smart-contracts?logo=codecov&style=flat-square&token=Ks4qCi1bN3)](https://app.codecov.io/gh/pooky-labs/smart-contracts)

For more details about the internal architecture of the repository, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Contracts

| Contract                                                                                                                                                 | Address on Polygon                                                                                                              |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | --- |
| [`Energy`](https://github.com/pooky-labs/smart-contracts/blob/a9cb86055339ccb3b313b35ffbca7ecdf12358f6/src/common/Energy.sol)                            | [`0x356fB0fE98023239b240795003595dbCb63c57cd`](https://polygonscan.com/address/0x356fB0fE98023239b240795003595dbCb63c57cd#code) |
| [`NonceRegistry`](https://github.com/pooky-labs/smart-contracts/blob/f15873dd3cffa045fd0029763c50fa00ab8c2134/src/common/NonceRegistry.sol)              | [`0xB08Ee469Dcf9c40B77261d8665A8BbdFad22B818`](https://polygonscan.com/address/0xB08Ee469Dcf9c40B77261d8665A8BbdFad22B818#code) |
| [`Rewards`](https://github.com/pooky-labs/smart-contracts/blob/5f4932e4525771953b91d349a3a615b338f02d43/src/game/Rewards.sol)                            | [`0x64A85fb2Ca5ebdC70cBa233a7Ea94672BeF5B372`](https://polygonscan.com/address/0x64A85fb2Ca5ebdC70cBa233a7Ea94672BeF5B372#code) |
| [`Pookyball`](https://github.com/pooky-labs/smart-contracts/blob/9f11c880e8bd31c9a266b3738c8b17463cf77cfa/src/tokens/Pookyball.sol)                      | [`0xb4859acd9B0A65CA4897c31e5cb5160D9Ff32C0A`](https://polygonscan.com/address/0xb4859acd9B0A65CA4897c31e5cb5160D9Ff32C0A#code) |
| [`PookyballAscension`](https://github.com/pooky-labs/smart-contracts/blob/fba76ea65e3b99b425b473bf5d689837ebedeb18/src/pookyball/PookyballAscension.sol) | [`0x2a3b939f2deaf2bd16806b7f4b48af23f1bcc515`](https://polygonscan.com/address/0x2a3b939f2deaf2bd16806b7f4b48af23f1bcc515#code) |
| [`PookyballLevelUp`](https://github.com/pooky-labs/smart-contracts/blob/fba76ea65e3b99b425b473bf5d689837ebedeb18/src/pookyball/PookyballLevelUp.sol)     | [`0x13e887fca91d6f9ff5d44dcf44f9b9074b314aab`](https://polygonscan.com/address/0x13e887fca91d6f9ff5d44dcf44f9b9074b314aab#code) |
| [`PookyballReroll`](https://github.com/pooky-labs/smart-contracts/blob/1c40639834a1f5f7bafb191c2cc7c94a8a2be92f/src/pookyball/PookyballReroll.sol)       | [`0x336033401230245EA9BD940Cb1b4cA91AF16415f`](https://polygonscan.com/address/0x336033401230245EA9BD940Cb1b4cA91AF16415f#code) |
| [`Pressure`](https://github.com/pooky-labs/smart-contracts/blob/fba76ea65e3b99b425b473bf5d689837ebedeb18/src/pookyball/Pressure.sol)                     | [`0xa34223AD4d42CB041056287784FE1F91a7e5b21A`](https://polygonscan.com/address/0xa34223AD4d42CB041056287784FE1F91a7e5b21A#code) |
| [`RefillableSale`](https://github.com/pooky-labs/smart-contracts/blob/fba76ea65e3b99b425b473bf5d689837ebedeb18/src/pookyball/RefillableSale.sol)         | [`0x57f48000b7573dd55963f15a1bf2490e43fee41c`](https://polygonscan.com/address/0x57f48000b7573dd55963f15a1bf2490e43fee41c#code) |
| [`Stickers`](https://github.com/pooky-labs/smart-contracts/blob/f15873dd3cffa045fd0029763c50fa00ab8c2134/src/stickers/Stickers.sol)                      | [`0x440D4955a914D5e29F861aC024A608aE41c56cB6`](https://polygonscan.com/address/0x440D4955a914D5e29F861aC024A608aE41c56cB6#code) |
| [`StickerAscension`](https://github.com/pooky-labs/smart-contracts/blob/fba76ea65e3b99b425b473bf5d689837ebedeb18/src/stickers/StickersAscension.sol)     | [`0x49d0e15af6c939670c628cea99512ae22c79fa7c`](https://polygonscan.com/address/0x49d0e15af6c939670c628cea99512ae22c79fa7c#code) |     |
| [`StickersController`](https://github.com/pooky-labs/smart-contracts/blob/f15873dd3cffa045fd0029763c50fa00ab8c2134/src/stickers/StickersController.sol)  | [`0x75cc3c6329930758659eD87338B926c90e16d05F`](https://polygonscan.com/address/0x75cc3c6329930758659eD87338B926c90e16d05F#code) |
| [`StickersManager`](https://github.com/pooky-labs/smart-contracts/blob/f15873dd3cffa045fd0029763c50fa00ab8c2134/src/stickers/StickersManager.sol)        | [`0x534Fda3d9C8A08FD0E57DE8c1Af9B32987614bA1`](https://polygonscan.com/address/0x534Fda3d9C8A08FD0E57DE8c1Af9B32987614bA1#code) |
| [`StickersLevelUp`](https://github.com/pooky-labs/smart-contracts/blob/f15873dd3cffa045fd0029763c50fa00ab8c2134/src/stickers/StickersLevelUp.sol)        | [`0x766e81AF624Cd6D2615EF675bDca2aB1ffBCBCbE`](https://polygonscan.com/address/0x766e81AF624Cd6D2615EF675bDca2aB1ffBCBCbE#code) |
| [`StickersSale`](https://github.com/pooky-labs/smart-contracts/blob/fba76ea65e3b99b425b473bf5d689837ebedeb18/src/stickers/StickersSale.sol)              | [`0x5d10f5685271b4dc21943438eac77ca549ac3d36`](https://polygonscan.com/address/0x5d10f5685271b4dc21943438eac77ca549ac3d36#code) |
| [`POK`](https://github.com/pooky-labs/smart-contracts/blob/fba76ea65e3b99b425b473bf5d689837ebedeb18/src/tokens/POK.sol)                                  | [`0x7b7E3B03f34b17d70C276C4886467D58867Bbc94`](https://polygonscan.com/address/0x7b7E3B03f34b17d70C276C4886467D58867Bbc94#code) |

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
