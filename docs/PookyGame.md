# Solidity API

## PookyGame

PookyGame is contract used from the game.
Contains function to update ball points after the matchweek and level up balls.

Roles:
owner role can set contract parameters

### pookyBall

```solidity
contract IPookyBall pookyBall
```

### pookySigner

```solidity
address pookySigner
```

### usedNonce

```solidity
mapping(uint256 => bool) usedNonce
```

### pookToken

```solidity
contract IPOK pookToken
```

### levelPxpNeeded

```solidity
uint256[] levelPxpNeeded
```

### levelCost

```solidity
uint256[] levelCost
```

### maxBallLevelPerRarity

```solidity
mapping(enum BallRarity => uint256) maxBallLevelPerRarity
```

### initialize

```solidity
function initialize() public
```

### \_setLevelPxpNeeded

```solidity
function _setLevelPxpNeeded() external
```

_function used in initialization to set pxp points
which is needed for ball to get to the each level_

### \_setLevelCost

```solidity
function _setLevelCost() external
```

_function used in initialization to set cost of levelling up
the ball for the each level_

### \_setMaxBallLevel

```solidity
function _setMaxBallLevel() external
```

_function used in initialization to set maximum level of the ball per rarity_

### setPookyBallContract

```solidity
function setPookyBallContract(address pookyBallAddress) external
```

sets the address of PookyBall contract
only owner role can call this function

### setPookySigner

```solidity
function setPookySigner(address _pookySigner) external
```

sets the address of backend signer
only owner role can call this function

### setPookToken

```solidity
function setPookToken(address _pookToken) external
```

sets the address of POK token contract
only owner role can call this function

### verifySignature

```solidity
function verifySignature(bytes message, struct Signature sig, address sigWalletCheck) private pure returns (bool)
```

_internal library function to verify the signature
can be replaced by OZ ECDSA library_

### levelUp

```solidity
function levelUp(uint256 ballId) public
```

level up the ball with `ballId`. Must be called by the ball owner.
required amount of POK tokens are paid from the user address.

### matchweekClaim

```solidity
function matchweekClaim(uint256 pookAmount, struct BallUpdates[] ballUpdates, uint256 ttl, uint256 nonce, struct Signature sig) external
```

Function used to claim rewards after the matchweek.
All parameters must be confirmed by backend and valid signature of them provided.

#### Parameters

| Name        | Type                 | Description                                                                                         |
| ----------- | -------------------- | --------------------------------------------------------------------------------------------------- |
| pookAmount  | uint256              | amount of POK token to reward to the user                                                           |
| ballUpdates | struct BallUpdates[] | array of BallUpdates struct containing parameters for all balls which should be rewarded points.    |
| ttl         | uint256              | timestamp until signature is valid                                                                  |
| nonce       | uint256              | unique nonce send by backend, used to not allow resending the same signature.                       |
| sig         | struct Signature     | structe contain parameters of the ECDSA signature from the backend. Must be signed by `pookySigner` |
