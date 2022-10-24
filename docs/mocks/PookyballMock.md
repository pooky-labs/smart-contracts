# Solidity API

## PookyballMock

PookyballMock is used for testing: everybody is allowed mint new Pookyballs  tokens.

### mock_mintBall

```solidity
function mock_mintBall(address to, struct BallInfo ballInfo) external returns (uint256)
```

### mock_setBallInfo

```solidity
function mock_setBallInfo(uint256 tokenId, struct BallInfo ballInfo) external
```

