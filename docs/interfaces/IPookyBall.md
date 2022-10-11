# Solidity API

## IPookyBall

### getBallInfo

```solidity
function getBallInfo(uint256 tokenId) external view returns (struct BallInfo)
```

### mint

```solidity
function mint(address to, enum BallRarity rarity, uint256 revocableUntil) external returns (uint256)
```

### setRandomEntropy

```solidity
function setRandomEntropy(uint256 tokenId, uint256 _randomEntropy) external
```

### addBallPXP

```solidity
function addBallPXP(uint256 tokenId, uint256 addPxpAmount) external
```

### changeBallLevel

```solidity
function changeBallLevel(uint256 tokenId, uint256 newLevel) external
```

### revokeBall

```solidity
function revokeBall(uint256 tokenId) external
```

