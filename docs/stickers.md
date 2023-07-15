# Stickers

Stickers are the second type of NFTs available on Pooky.

Stickers are add-ons for Pookyballs that increase their in-game statistics.
On-chain metadata is limited to the Sticker rarity, level and random seed.
Please refer to the [Pooky whitepaper](https://whitepaper.pooky.gg/stickers) for more details on the Stickers.

## Contracts list

### [`Stickers.sol`](../src/tokens/Stickers.sol)

Stickers smart contract follows the ERC-721 specification and take advantage of the [ERC721A implementation](https://github.com/chiru-labs/ERC721A#readme).
ERC721A allows to save hug amounts of gas when minting multiple stickers at the same time.

The Stickers contract is based on our [`BaseERC721A.sol`](../src/base/BaseERC721A.sol) contract that implements:

- ERC721 NFT standard
- ERC2891 royalties standard
- OpenSea registry to enforce the on-chain royalties

Minting stickers is only possible via the `mint` function.
This function will automatically call the Chainlink VRF cooridinator and request the seeds for the newly minted Stickers.

### [`StickersController.sol`](../src/game/StickersController.sol)

The `StickersController` is in charge of the Pookyballs <=> Stickers association.
It is not supposed to run any check if a Sticker can be attached to a Pookyball or not.
`StickersController` contract is designed to be future proof and should be considered a a long-lived, stable implementation.

`StickersController` is capable of answering the following questions:

1. `StickersController.attachedTo`: Given a Sticker ID, what is it parent Pookyball id? Zero means that the Sticker is not attached to a Pookyball.
2. `StickersController.slots`: Given a Pookyball ID, what are the Stickers IDs attached to this particular Pookyball?

`StickersController` also exposes 3 methods, that are not callable unless the sender has the right permission.

| Method    | Description                                                  | Role required | Event             |
| --------- | ------------------------------------------------------------ | ------------- | ----------------- |
| `attach`  | Attach a Sticker to a Pookyball                              | `LINKER`      | `StickerAttached` |
| `replace` | Replace a Sticker of a Pookyball (burn the previous Sticker) | `REPLACER`    | `StickerReplaced` |
| `detach`  | Detach a Sticker from a Pookyabll                            | `REMOVER`     | `StickerDetached` |

To ensure that:

- a Sticker cannot be attached twice to different Pookyballs
- a Sticker cannot be sold after being attached to a Pookyball
- transfering a Pookyball also transfers the Stickers attached to the Pookyball

Attaching a Sticker to a Pookyball transfers the Stickers from the sender inventory to the `StickersController` itself.

### [`StickersManager.sol`](../src/game/StickersManager.sol)

`StickersManager` can be seen at the Stickers game implementation that uses the `StickersController` primitives.
It is likely to be replaced in the future by a new contract that will implement new rules.

Currently, the `StickersManager`:

- controls how much slots are available on Pookyballs depending on their level and rarities (`StickersManager.slots`)
- ensure that a sticker can be attach to a Pookyball only if the Pookyball has a free slot slot

### [`StickersLevelUp.sol`](../src/game/StickersLevelUp.sol)

Stickers can be leveled up using the `StickersLevelUp` contract.
`StickersLevelUp` is based on our [`BaseLevelUpContract`](../src/base/BaseLevelUp.sol).

Since the we don't store the Stickers PXP on chain to save gas, users will have to query the back-end to get a signature that certify the PXP amount they pass to the `levelUp` function.

```solidity
function levelUp(uint256 tokenId, uint256 increase, uint256 currentPXP, bytes calldata proof) external payable;
```

Applications may listen to the `LevelChanged` event of the `Stickers` contract to follow the changes of the Stickers levels.

### [`StickersSale.sol`](../src/mint/StickersSale.sol)

The Stickers can be minted in batch via the `StickersSale` contract.
