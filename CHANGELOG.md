# Changelog

## June 12 2023

Contract changes:

- [`Level`](https://github.com/pooky-labs/smart-contracts/blob/519fd565f036802d6cec4ed18d18fc773f731979/src/game/Level.sol) has been renamed to `PookyballLevel` and now accepts MATIC to pay the levelUp fee

| Contract name                                                                                                                      | Old address                                                                                                                     | New address                                                                                                                     |
| ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| [`Level`](https://github.com/pooky-labs/smart-contracts/blob/519fd565f036802d6cec4ed18d18fc773f731979/src/game/Level.sol)          | [`0xe05a8312979d65dddd111fca90ee41c2e8c39a6c`](https://polygonscan.com/address/0xe05a8312979d65dddd111fca90ee41c2e8c39a6c#code) | none                                                                                                                            |
| [`PookyballLevel`](https://github.com/pooky-labs/smart-contracts/blob/519fd565f036802d6cec4ed18d18fc773f731979/src/game/Level.sol) | none                                                                                                                            | [`0x2D089721F64036753B28FbF78081dC39d57654d9`](https://polygonscan.com/address/0x2D089721F64036753B28FbF78081dC39d57654d9#code) |

## May 5 2023

Contract changes:

- Due to a bug with the Pookyball rarities (we swapped the EPIC and LEGENDARY rarities), we have to re-deploy the Level contract.

| Contract name                                                                                                             | Old address                                                                                                                     | New address                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| [`Level`](https://github.com/pooky-labs/smart-contracts/blob/519fd565f036802d6cec4ed18d18fc773f731979/src/game/Level.sol) | [`0x5658F1Adc72c8Eb98e0197fBBc7Ba7e0A8942388`](https://polygonscan.com/address/0x5658F1Adc72c8Eb98e0197fBBc7Ba7e0A8942388#code) | [`0xe05a8312979d65dddd111fca90ee41c2e8c39a6c`](https://polygonscan.com/address/0xe05a8312979d65dddd111fca90ee41c2e8c39a6c#code) |

## April 3 2023

Contract changes:

- We partnered with Sequence, so the `Airdrop` contract is not needed anymore.
- We decided to introduce a new controllable sale contract: [`RefillableSale`](contracts/mint/RefillableSale.sol).

| Contract name                                                                                                                                                                                                                         | Old address                                                                                                                     | New address                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| [`Airdrop`](https://github.com/pooky-labs/smart-contracts/blob/c4910c271c78a0e49c7959a973aaeaeffe0107bd/https://github.com/pooky-labs/smart-contracts/blob/c4910c271c78a0e49c7959a973aaeaeffe0107bd/contracts/game/Airdrop.sol)       | [`0xE9d0a2B783e3d9C94E8b92A8De0e7D72458D51d2`](https://polygonscan.com/address/0xE9d0a2B783e3d9C94E8b92A8De0e7D72458D51d2#code) | none                                                                                                                            |
| [`LaunchSale`](https://github.com/pooky-labs/smart-contracts/blob/c4910c271c78a0e49c7959a973aaeaeffe0107bd/https://github.com/pooky-labs/smart-contracts/blob/c4910c271c78a0e49c7959a973aaeaeffe0107bd/contracts/mint/LaunchSale.sol) | [`0x1beDd116F29737b1dC7FF43F52d5E39b52Cb19f7`](https://polygonscan.com/address/0x1beDd116F29737b1dC7FF43F52d5E39b52Cb19f7#code) | none                                                                                                                            |
| [`RefillableSale`](contracts/mint/RefillableSale.sol)                                                                                                                                                                                 | none                                                                                                                            | [`0x57f48000b7573dd55963f15a1bf2490e43fee41c`](https://polygonscan.com/address/0x57f48000b7573dd55963f15a1bf2490e43fee41c#code) |

## 30 March 2023

We removed the wallet constraint for Pookyball level up.

| Contract name                                                                                                             | Old address                                                                                                                     | New address                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| [`Level`](https://github.com/pooky-labs/smart-contracts/blob/519fd565f036802d6cec4ed18d18fc773f731979/src/game/Level.sol) | [`0xE7a553E27ecaf3c37005c505abd325a554105077`](https://polygonscan.com/address/0xE7a553E27ecaf3c37005c505abd325a554105077#code) | [`0x5658F1Adc72c8Eb98e0197fBBc7Ba7e0A8942388`](https://polygonscan.com/address/0x5658F1Adc72c8Eb98e0197fBBc7Ba7e0A8942388#code) |

## 29 March 2023 - Launch Sale #2

We decided to extend the launch sale.

| Contract name                                                                                                                             | Old address                                                                                                                     | New address                                                                                                                     |
| ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| [`LaunchSale`](https://github.com/pooky-labs/smart-contracts/blob/c4910c271c78a0e49c7959a973aaeaeffe0107bd/contracts/mint/LaunchSale.sol) | [`0x5B60b8776475536E30A65Fe1a9B0C0318dd3532b`](https://polygonscan.com/address/0x5B60b8776475536E30A65Fe1a9B0C0318dd3532b#code) | [`0x1beDd116F29737b1dC7FF43F52d5E39b52Cb19f7`](https://polygonscan.com/address/0x1beDd116F29737b1dC7FF43F52d5E39b52Cb19f7#code) |

## 22 March 2023 - Play-to-Earn release

Contract changes:

- `Energy`, `GenesisSale` and `WaitList` contracts has been sunset.
- `LaunchSale` is the new Pookyball sale to celebrate Pooky play-to-earn launch!

Gameplay balance:

- `Level.RATIO_POK` increased from `70` to `80`
- `Pressure` remove some typos

| Contract name                                                                                                                               | Old address                                                                                                                     | New address                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| [`Energy`](https://github.com/pooky-labs/smart-contracts/blob/6fd0efb6f866b4b40049befd225872a335b44476/contracts/game/Energy.sol)           | [`0xB08Ee469Dcf9c40B77261d8665A8BbdFad22B818`](https://polygonscan.com/address/0xB08Ee469Dcf9c40B77261d8665A8BbdFad22B818#code) | none                                                                                                                            |
| [`Level`](https://github.com/pooky-labs/smart-contracts/blob/519fd565f036802d6cec4ed18d18fc773f731979/src/game/Level.soll)                  | [`0x5167ea68F094dD234732dF09B2f66D8357Bbe1D3`](https://polygonscan.com/address/0x5167ea68F094dD234732dF09B2f66D8357Bbe1D3#code) | [`0xE7a553E27ecaf3c37005c505abd325a554105077`](https://polygonscan.com/address/0xE7a553E27ecaf3c37005c505abd325a554105077#code) |
| [`Pressure`](contracts/game/Pressure.sol)                                                                                                   | [`0xb938630B8bcf67bF4C2e9617a5d288F9a7F817b8`](https://polygonscan.com/address/0xb938630B8bcf67bF4C2e9617a5d288F9a7F817b8#code) | [`0xa34223AD4d42CB041056287784FE1F91a7e5b21A`](https://polygonscan.com/address/0xa34223AD4d42CB041056287784FE1F91a7e5b21A#code) |
| [`GenesisSale`](https://github.com/pooky-labs/smart-contracts/blob/08e1b5cc855e319ae376a1499183561eceae37b7/contracts/mint/GenesisSale.sol) | [`0x04A6609074DAE5FCDd635533dF2143C85155759e`](https://polygonscan.com/address/0x04A6609074DAE5FCDd635533dF2143C85155759e#code) | none                                                                                                                            |
| [`LaunchSale`](https://github.com/pooky-labs/smart-contracts/blob/c4910c271c78a0e49c7959a973aaeaeffe0107bd/contracts/mint/LaunchSale.sol)   | none                                                                                                                            | [`0x5B60b8776475536E30A65Fe1a9B0C0318dd3532b`](https://polygonscan.com/address/0x5B60b8776475536E30A65Fe1a9B0C0318dd3532b#code) |

## 6 March 2023

Contract changes:

- `Rewards` now allow users to claim Pookyballs

| Contract name                                                                                                                     | Old address                                                                                                                     | New address                                                                                                                     |
| --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| [`Energy`](https://github.com/pooky-labs/smart-contracts/blob/6fd0efb6f866b4b40049befd225872a335b44476/contracts/game/Energy.sol) | none                                                                                                                            | [`0xB08Ee469Dcf9c40B77261d8665A8BbdFad22B818`](https://polygonscan.com/address/0xB08Ee469Dcf9c40B77261d8665A8BbdFad22B818#code) |
| [`Rewards`](contracts/game/Rewards.sol)                                                                                           | [`0x632c95131A4345e5ed5b5448f6c809c956732B6F`](https://polygonscan.com/address/0x632c95131A4345e5ed5b5448f6c809c956732B6F#code) | [`0x64A85fb2Ca5ebdC70cBa233a7Ea94672BeF5B372`](https://polygonscan.com/address/0x64A85fb2Ca5ebdC70cBa233a7Ea94672BeF5B372#code) |

## 15 February 2022

Contract changes:

- `GenesisMint` has been renamed to `GenesisSale`
- Genesis sale and supply prices have been adjusted

Gameplay adjustments:

- `Level.RATIO_PXP` reduced from `1085` to `1075`
- `Level.RATIO_POK` from `90` to `70`

| Contract                                                                                                                                    | Old address on Polygon                                                                                                          | New address on Polygon                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| [`POK`](contracts/tokens/POK.sol)                                                                                                           | [`0x7b7E3B03f34b17d70C276C4886467D58867Bbc94`](https://polygonscan.com/address/0x7b7E3B03f34b17d70C276C4886467D58867Bbc94#code) | (unchanged)                                                                                                                     |
| [`Pookyball`](contracts/tokens/Pookyball.sol)                                                                                               | [`0xb4859acd9B0A65CA4897c31e5cb5160D9Ff32C0A`](https://polygonscan.com/address/0xb4859acd9B0A65CA4897c31e5cb5160D9Ff32C0A#code) | (unchanged)                                                                                                                     |
| [`GenesisSale`](https://github.com/pooky-labs/smart-contracts/blob/08e1b5cc855e319ae376a1499183561eceae37b7/contracts/mint/GenesisSale.sol) | none                                                                                                                            | [`0x04A6609074DAE5FCDd635533dF2143C85155759e`](https://polygonscan.com/address/0x04A6609074DAE5FCDd635533dF2143C85155759e#code) |
| [`WaitList`](https://github.com/pooky-labs/smart-contracts/blob/08e1b5cc855e319ae376a1499183561eceae37b7/contracts/mint/WaitList.sol)       | [`0xFA6ADc62ce95deD2e4649AFaf89521Cf4fF4A09F`](https://polygonscan.com/address/0xFA6ADc62ce95deD2e4649AFaf89521Cf4fF4A09F#code) | (unchanged)                                                                                                                     |
| [`Airdrop`](https://github.com/pooky-labs/smart-contracts/blob/c4910c271c78a0e49c7959a973aaeaeffe0107bd/contracts/game/Airdrop.sol)         | [`0xE9d0a2B783e3d9C94E8b92A8De0e7D72458D51d2`](https://polygonscan.com/address/0xE9d0a2B783e3d9C94E8b92A8De0e7D72458D51d2#code) | (unchanged)                                                                                                                     |
| [`Energy`](https://github.com/pooky-labs/smart-contracts/blob/6fd0efb6f866b4b40049befd225872a335b44476/contracts/game/Energy.sol)           | [`0x22021D710878c216935C967A49212b38eBe295Fe`](https://polygonscan.com/address/0x22021D710878c216935C967A49212b38eBe295Fe#code) | (unchanged)                                                                                                                     |
| [`Level`](https://github.com/pooky-labs/smart-contracts/blob/519fd565f036802d6cec4ed18d18fc773f731979/src/game/Level.soll)                  | [`0x8F69c284F5B6d26573c95Ab3EE9879DdB85c290A`](https://polygonscan.com/address/0x8F69c284F5B6d26573c95Ab3EE9879DdB85c290A#code) | [`0x5167ea68F094dD234732dF09B2f66D8357Bbe1D3`](https://polygonscan.com/address/0x5167ea68F094dD234732dF09B2f66D8357Bbe1D3#code) |
| [`Pressure`](contracts/game/Pressure.sol)                                                                                                   | [`0x11eD7e914457aA3E84A545179390FbeA3A0302F5`](https://polygonscan.com/address/0x11eD7e914457aA3E84A545179390FbeA3A0302F5#code) | [`0xb938630B8bcf67bF4C2e9617a5d288F9a7F817b8`](https://polygonscan.com/address/0xb938630B8bcf67bF4C2e9617a5d288F9a7F817b8#code) |
| [`Rewards`](contracts/game/Rewards.sol)                                                                                                     | [`0x632c95131A4345e5ed5b5448f6c809c956732B6F`](https://polygonscan.com/address/0x632c95131A4345e5ed5b5448f6c809c956732B6F#code) | (unchanged)                                                                                                                     |

## 8 February 2022

We dropped Pookyball Luxury from the Pookyball contract, as Luxury has been removed form the game.
This implies that we had to redeploy all contracts that take Pookyball contract as constructor parameters.

| Contract                                                                                                                              | Old address on Polygon                                                                                                          | New address on Polygon                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| [`POK`](contracts/tokens/POK.sol)                                                                                                     | [`0x7b7E3B03f34b17d70C276C4886467D58867Bbc94`](https://polygonscan.com/address/0x7b7E3B03f34b17d70C276C4886467D58867Bbc94#code) | (unchanged)                                                                                                                     |
| [`Pookyball`](contracts/tokens/Pookyball.sol)                                                                                         | [`0x290848FB9581ECe60270dD6db00236f6505E46EB`](https://polygonscan.com/address/0x290848FB9581ECe60270dD6db00236f6505E46EB#code) | [`0xb4859acd9B0A65CA4897c31e5cb5160D9Ff32C0A`](https://polygonscan.com/address/0xb4859acd9B0A65CA4897c31e5cb5160D9Ff32C0A#code) |
| [`WaitList`](https://github.com/pooky-labs/smart-contracts/blob/08e1b5cc855e319ae376a1499183561eceae37b7/contracts/mint/WaitList.sol) | [`0xFA6ADc62ce95deD2e4649AFaf89521Cf4fF4A09F`](https://polygonscan.com/address/0xFA6ADc62ce95deD2e4649AFaf89521Cf4fF4A09F#code) | (unchanged)                                                                                                                     |
| [`Airdrop`](https://github.com/pooky-labs/smart-contracts/blob/c4910c271c78a0e49c7959a973aaeaeffe0107bd/contracts/game/Airdrop.sol)   | [`0xE9d0a2B783e3d9C94E8b92A8De0e7D72458D51d2`](https://polygonscan.com/address/0xE9d0a2B783e3d9C94E8b92A8De0e7D72458D51d2#code) | (unchanged)                                                                                                                     |
| [`Energy`](https://github.com/pooky-labs/smart-contracts/blob/6fd0efb6f866b4b40049befd225872a335b44476/contracts/game/Energy.sol)     | [`0x22021D710878c216935C967A49212b38eBe295Fe`](https://polygonscan.com/address/0x22021D710878c216935C967A49212b38eBe295Fe#code) | (unchanged)                                                                                                                     |
| [`Level`](https://github.com/pooky-labs/smart-contracts/blob/519fd565f036802d6cec4ed18d18fc773f731979/src/game/Level.soll)            | [`0xCFBE767cbaCce5eBCE1e9F21c50476008A589Be4`](https://polygonscan.com/address/0xCFBE767cbaCce5eBCE1e9F21c50476008A589Be4#code) | [`0x8F69c284F5B6d26573c95Ab3EE9879DdB85c290A`](https://polygonscan.com/address/0x8F69c284F5B6d26573c95Ab3EE9879DdB85c290A#code) |
| [`Pressure`](contracts/game/Pressure.sol)                                                                                             | [`0x11eD7e914457aA3E84A545179390FbeA3A0302F5`](https://polygonscan.com/address/0x11eD7e914457aA3E84A545179390FbeA3A0302F5#code) | (unchanged)                                                                                                                     |
| [`Rewards`](contracts/game/Rewards.sol)                                                                                               | [`0xf85DC0A148221241845620e73FB3486b69dAa821`](https://polygonscan.com/address/0xf85DC0A148221241845620e73FB3486b69dAa821#code) | [`0x632c95131A4345e5ed5b5448f6c809c956732B6F`](https://polygonscan.com/address/0x632c95131A4345e5ed5b5448f6c809c956732B6F#code) |

## 31 January 2022

We deployed our contracts to the Polygon mainnet! This will allow users to claim rewards in $POK and $MATIC.

| Contract                                                                                                                                        | Address on Polygon                                                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| [`POK`](contracts/tokens/POK.sol)                                                                                                               | [`0x7b7E3B03f34b17d70C276C4886467D58867Bbc94`](https://polygonscan.com/address/0x7b7E3B03f34b17d70C276C4886467D58867Bbc94#code) |
| [`Pookyball`](contracts/tokens/Pookyball.sol)                                                                                                   | [`0x290848FB9581ECe60270dD6db00236f6505E46EB`](https://polygonscan.com/address/0x290848FB9581ECe60270dD6db00236f6505E46EB#code) |
| [`GenesisMinter`](https://github.com/pooky-labs/smart-contracts/blob/f054edbd87a4f7b75c8fd1708c73af2d190c3491/contracts/mint/GenesisMinter.sol) | TBD                                                                                                                             |
| [`WaitList`](https://github.com/pooky-labs/smart-contracts/blob/08e1b5cc855e319ae376a1499183561eceae37b7/contracts/mint/WaitList.sol)           | [`0xFA6ADc62ce95deD2e4649AFaf89521Cf4fF4A09F`](https://polygonscan.com/address/0xFA6ADc62ce95deD2e4649AFaf89521Cf4fF4A09F#code) |
| [`Airdrop`](https://github.com/pooky-labs/smart-contracts/blob/c4910c271c78a0e49c7959a973aaeaeffe0107bd/contracts/game/Airdrop.sol)             | [`0xE9d0a2B783e3d9C94E8b92A8De0e7D72458D51d2`](https://polygonscan.com/address/0xE9d0a2B783e3d9C94E8b92A8De0e7D72458D51d2#code) |
| [`Energy`](https://github.com/pooky-labs/smart-contracts/blob/6fd0efb6f866b4b40049befd225872a335b44476/contracts/game/Energy.sol)               | [`0x22021D710878c216935C967A49212b38eBe295Fe`](https://polygonscan.com/address/0x22021D710878c216935C967A49212b38eBe295Fe#code) |
| [`Level`](https://github.com/pooky-labs/smart-contracts/blob/519fd565f036802d6cec4ed18d18fc773f731979/src/game/Level.soll)                      | [`0xCFBE767cbaCce5eBCE1e9F21c50476008A589Be4`](https://polygonscan.com/address/0xCFBE767cbaCce5eBCE1e9F21c50476008A589Be4#code) |
| [`Pressure`](contracts/game/Pressure.sol)                                                                                                       | [`0x11eD7e914457aA3E84A545179390FbeA3A0302F5`](https://polygonscan.com/address/0x11eD7e914457aA3E84A545179390FbeA3A0302F5#code) |
| [`Rewards`](contracts/game/Rewards.sol)                                                                                                         | [`0xf85DC0A148221241845620e73FB3486b69dAa821`](https://polygonscan.com/address/0xf85DC0A148221241845620e73FB3486b69dAa821#code) |
