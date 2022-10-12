# Solidity API

## BallRarity

```solidity
enum BallRarity {
  Common,
  Rare,
  Epic,
  Legendary,
  Mythic
}
```

## BallInfo

```solidity
struct BallInfo {
  enum BallRarity rarity;
  uint256 randomEntropy;
  uint256 level;
  uint256 pxp;
  uint256 revocableUntil;
}
```

## MintTemplate

```solidity
struct MintTemplate {
  bool enabled;
  enum BallRarity rarity;
  uint256 maxMints;
  uint256 currentMints;
  uint256 price;
  address payingToken;
}
```

## MintRandomRequest

```solidity
struct MintRandomRequest {
  address recipient;
  uint256 tokenId;
}
```

## BallUpdates

```solidity
struct BallUpdates {
  uint256 tokenId;
  uint256 addPXP;
  bool shouldLevelUp;
}
```

