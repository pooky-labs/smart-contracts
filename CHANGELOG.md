# Changelog

## 8 February 2022

We dropped Pookyball Luxury from the Pookyball contract, as Luxury has been removed form the game.
This implies that we had to redeploy all contracts that take Pookyball contract as constructor parameters.

| Contract                                      | Old address on Polygon                                                                                                          | New address on Polygon                                                                                                          |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| [`POK`](contracts/tokens/POK.sol)             | [`0x7b7E3B03f34b17d70C276C4886467D58867Bbc94`](https://polygonscan.com/address/0x7b7E3B03f34b17d70C276C4886467D58867Bbc94#code) | (unchanged)                                                                                                                     |
| [`Pookyball`](contracts/tokens/Pookyball.sol) | [`0x290848FB9581ECe60270dD6db00236f6505E46EB`](https://polygonscan.com/address/0x290848FB9581ECe60270dD6db00236f6505E46EB#code) | [`0xb4859acd9B0A65CA4897c31e5cb5160D9Ff32C0A`](https://polygonscan.com/address/0xb4859acd9B0A65CA4897c31e5cb5160D9Ff32C0A#code) |
| [`WaitList`](contracts/mint/WaitList.sol)     | [`0xFA6ADc62ce95deD2e4649AFaf89521Cf4fF4A09F`](https://polygonscan.com/address/0xFA6ADc62ce95deD2e4649AFaf89521Cf4fF4A09F#code) | (unchanged)                                                                                                                     |
| [`Airdrop`](contracts/game/Airdrop.sol)       | [`0xE9d0a2B783e3d9C94E8b92A8De0e7D72458D51d2`](https://polygonscan.com/address/0xE9d0a2B783e3d9C94E8b92A8De0e7D72458D51d2#code) | (unchanged)                                                                                                                     |
| [`Energy`](contracts/game/Energy.sol)         | [`0x22021D710878c216935C967A49212b38eBe295Fe`](https://polygonscan.com/address/0x22021D710878c216935C967A49212b38eBe295Fe#code) | (unchanged)                                                                                                                     |
| [`Level`](contracts/game/Level.sol)           | [`0xCFBE767cbaCce5eBCE1e9F21c50476008A589Be4`](https://polygonscan.com/address/0xCFBE767cbaCce5eBCE1e9F21c50476008A589Be4#code) | [`0x8F69c284F5B6d26573c95Ab3EE9879DdB85c290A`](https://polygonscan.com/address/0x8F69c284F5B6d26573c95Ab3EE9879DdB85c290A#code) |
| [`Pressure`](contracts/game/Pressure.sol)     | [`0x11eD7e914457aA3E84A545179390FbeA3A0302F5`](https://polygonscan.com/address/0x11eD7e914457aA3E84A545179390FbeA3A0302F5#code) | (unchanged)                                                                                                                     |
| [`Rewards`](contracts/game/Rewards.sol)       | [`0xf85DC0A148221241845620e73FB3486b69dAa821`](https://polygonscan.com/address/0xf85DC0A148221241845620e73FB3486b69dAa821#code) | [`0x632c95131A4345e5ed5b5448f6c809c956732B6F`](https://polygonscan.com/address/0x632c95131A4345e5ed5b5448f6c809c956732B6F#code) |

## 31 January 2022

We deployed our contracts to the Polygon mainnet! This will allow users to claim rewards in $POK and $MATIC.

| Contract                                            | Address on Polygon                                                                                                              |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| [`POK`](contracts/tokens/POK.sol)                   | [`0x7b7E3B03f34b17d70C276C4886467D58867Bbc94`](https://polygonscan.com/address/0x7b7E3B03f34b17d70C276C4886467D58867Bbc94#code) |
| [`Pookyball`](contracts/tokens/Pookyball.sol)       | [`0x290848FB9581ECe60270dD6db00236f6505E46EB`](https://polygonscan.com/address/0x290848FB9581ECe60270dD6db00236f6505E46EB#code) |
| [`GenesisMinter`](contracts/mint/GenesisMinter.sol) | TBD                                                                                                                             |
| [`WaitList`](contracts/mint/WaitList.sol)           | [`0xFA6ADc62ce95deD2e4649AFaf89521Cf4fF4A09F`](https://polygonscan.com/address/0xFA6ADc62ce95deD2e4649AFaf89521Cf4fF4A09F#code) |
| [`Airdrop`](contracts/game/Airdrop.sol)             | [`0xE9d0a2B783e3d9C94E8b92A8De0e7D72458D51d2`](https://polygonscan.com/address/0xE9d0a2B783e3d9C94E8b92A8De0e7D72458D51d2#code) |
| [`Energy`](contracts/game/Energy.sol)               | [`0x22021D710878c216935C967A49212b38eBe295Fe`](https://polygonscan.com/address/0x22021D710878c216935C967A49212b38eBe295Fe#code) |
| [`Level`](contracts/game/Level.sol)                 | [`0xCFBE767cbaCce5eBCE1e9F21c50476008A589Be4`](https://polygonscan.com/address/0xCFBE767cbaCce5eBCE1e9F21c50476008A589Be4#code) |
| [`Pressure`](contracts/game/Pressure.sol)           | [`0x11eD7e914457aA3E84A545179390FbeA3A0302F5`](https://polygonscan.com/address/0x11eD7e914457aA3E84A545179390FbeA3A0302F5#code) |
| [`Rewards`](contracts/game/Rewards.sol)             | [`0xf85DC0A148221241845620e73FB3486b69dAa821`](https://polygonscan.com/address/0xf85DC0A148221241845620e73FB3486b69dAa821#code) |