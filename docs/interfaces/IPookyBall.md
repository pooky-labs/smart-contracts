# Solidity API

## IPookyBall

### mintWithRarity

```solidity
function mintWithRarity(address to, enum BallRarity rarity) external returns (uint256)
```

### mintWithRarityAndRevokableTimestamp

```solidity
function mintWithRarityAndRevokableTimestamp(address to, enum BallRarity rarity, uint256 revokableUntil) external returns (uint256)
```

### setRandomEntropy

```solidity
function setRandomEntropy(uint256 ballId, uint256 _randomEntropy) external
```

### getBallInfo

```solidity
function getBallInfo(uint256 ballId) external returns (struct BallInfo)
```

### getBallPxp

```solidity
function getBallPxp(uint256 ballId) external returns (uint256)
```

### addBallPxp

```solidity
function addBallPxp(uint256 ballId, uint256 addPxpAmount) external
```

### getBallLevel

```solidity
function getBallLevel(uint256 ballId) external returns (uint256)
```

### changeBallLevel

```solidity
function changeBallLevel(uint256 ballId, uint256 newLevel) external
```

### revokeBall

```solidity
function revokeBall(uint256 ballId) external
```

