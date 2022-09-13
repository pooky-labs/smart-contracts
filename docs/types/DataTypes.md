# Solidity API

## BallRarity

```solidity
enum BallRarity {
  Uncommon,
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
  bool canBreed;
  uint256 cardSlots;
  uint256[] cards;
  uint256 revokableUntilTimestamp;
}
```

## MintTemplate

```solidity
struct MintTemplate {
  bool canMint;
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
  address user;
  uint256 ballId;
}
```

## BallUpdates

```solidity
struct BallUpdates {
  uint256 ballId;
  uint256 addPxp;
  bool toLevelUp;
}
```

## Signature

```solidity
struct Signature {
  uint8 _v;
  bytes32 _r;
  bytes32 _s;
}
```

## BallRarity

```solidity
enum BallRarity {
  Uncommon,
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
  bool canBreed;
  uint256 cardSlots;
  uint256[] cards;
  uint256 revokableUntilTimestamp;
}
```

## MintTemplate

```solidity
struct MintTemplate {
  bool canMint;
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
  address user;
  uint256 ballId;
}
```

## BallUpdates

```solidity
struct BallUpdates {
  uint256 ballId;
  uint256 addPxp;
  bool toLevelUp;
}
```

## Signature

```solidity
struct Signature {
  uint8 _v;
  bytes32 _r;
  bytes32 _s;
}
```

## BallRarity

```solidity
enum BallRarity {
  Uncommon,
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
  bool canBreed;
  uint256 cardSlots;
  uint256[] cards;
  uint256 revokableUntilTimestamp;
}
```

## MintTemplate

```solidity
struct MintTemplate {
  bool canMint;
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
  address user;
  uint256 ballId;
}
```

## BallUpdates

```solidity
struct BallUpdates {
  uint256 ballId;
  uint256 addPxp;
  bool toLevelUp;
}
```

## Signature

```solidity
struct Signature {
  uint8 _v;
  bytes32 _r;
  bytes32 _s;
}
```

