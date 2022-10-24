# Solidity API

## IPookyball

### getBallInfo

```solidity
function getBallInfo(uint256 tokenId) external view returns (struct BallInfo)
```

### mint

```solidity
function mint(address to, enum BallRarity rarity, enum BallLuxury luxury) external returns (uint256)
```

### setRandomEntropy

```solidity
function setRandomEntropy(uint256 tokenId, uint256 _randomEntropy) external
```

### changePXP

```solidity
function changePXP(uint256 tokenId, uint256 newPXP) external
```

### changeLevel

```solidity
function changeLevel(uint256 tokenId, uint256 newLevel) external
```

