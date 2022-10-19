# Solidity API

## PookyGame

The contract controls the on-chain features of the Pooky game.
Notable features:
- Claim prediction rewards (Pooky Ball PXP + $POK tokens) using a signature from the Pooky back-end.
- Level up Pooky Balls by spending $POK token.

Roles:
- DEFAULT_ADMIN_ROLE can add/remove roles.
- REWARD_SIGNER can sign rewards claims.

### REWARD_SIGNER

```solidity
bytes32 REWARD_SIGNER
```

### pookyBall

```solidity
contract IPookyBall pookyBall
```

### pok

```solidity
contract IPOK pok
```

### PXP_DECIMALS

```solidity
uint256 PXP_DECIMALS
```

### PXP_BASE

```solidity
uint256 PXP_BASE
```

### RATIO_DECIMALS

```solidity
uint256 RATIO_DECIMALS
```

### RATIO_PXP

```solidity
uint256 RATIO_PXP
```

### RATIO_POK

```solidity
uint256 RATIO_POK
```

### maxBallLevelPerRarity

```solidity
mapping(enum BallRarity => uint256) maxBallLevelPerRarity
```

### nonces

```solidity
mapping(uint256 => bool) nonces
```

### OwnershipRequired

```solidity
error OwnershipRequired(uint256 tokenId)
```

### MaximumLevelReached

```solidity
error MaximumLevelReached(uint256 tokenId, uint256 maxLevel)
```

### InsufficientPOKBalance

```solidity
error InsufficientPOKBalance(uint256 required, uint256 actual)
```

### InvalidSignature

```solidity
error InvalidSignature()
```

### ExpiredSignature

```solidity
error ExpiredSignature(uint256 expiration)
```

### NonceUsed

```solidity
error NonceUsed()
```

### RewardTransferFailed

```solidity
error RewardTransferFailed(uint256 amount, address recipient)
```

### initialize

```solidity
function initialize(address _admin) public
```

### _setMaxBallLevel

```solidity
function _setMaxBallLevel() external
```

_Initialization function that sets the Pooky Ball maximum level for a given rarity._

### setPookyBallContract

```solidity
function setPookyBallContract(address _pookyBall) external
```

Sets the address of the PookyBall contract.

_Requirements:
- only DEFAULT_ADMIN_ROLE role can call this function._

### setPOKContract

```solidity
function setPOKContract(address _pok) external
```

Sets the address of the POK contract.

_Requirements:
- only DEFAULT_ADMIN_ROLE role can call this function._

### levelPXP

```solidity
function levelPXP(uint256 level) public pure returns (uint256)
```

Get the PXP required to level up a ball to {level}.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| level | uint256 | The targeted level. |

### levelPOK

```solidity
function levelPOK(uint256 level) public pure returns (uint256)
```

Get the $POK tokens required to level up a ball to {level}. This does not take the ball PXP into account.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| level | uint256 | The targeted level. |

### levelPOKCost

```solidity
function levelPOKCost(uint256 tokenId) public view returns (uint256)
```

Get the $POK tokens required to level up the ball identified by {tokenId}.
This computation the ball PXP into account and add an additional POK fee if ball does not have enough PXP.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | The targeted level. |

### levelUp

```solidity
function levelUp(uint256 tokenId) public
```

Level up a Pooky Ball in exchange of a certain amount of $POK token.

_Requirements
- msg.sender must be the owner of Pooky Ball tokenId.
- Pooky Ball level should be strictly less than the maximum allowed level for its rarity.
- msg.sender must own enough $POK tokens to pay the level up fee._

### verifySignature

```solidity
function verifySignature(bytes message, bytes signature) private view returns (bool)
```

_Internal function that checks if a {message} has be signed by a REWARD_SIGNER._

### claimRewards

```solidity
function claimRewards(uint256 amountNative, uint256 amountPOK, struct BallUpdates[] ballUpdates, uint256 ttl, uint256 nonce, bytes signature) external
```

Claim prediction rewards ($POK tokens and Ball PXP).

_No explicit re-entrancy guard is present as this function is nonce-based._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| amountNative | uint256 | The amount of native currency to transfer. |
| amountPOK | uint256 | The $POK token amount. |
| ballUpdates | struct BallUpdates[] | The updated to apply to the Pooky Balls (PXP and optional level up). |
| ttl | uint256 | UNIX timestamp until signature is valid. |
| nonce | uint256 | Unique word that prevents the usage the same signature twice. |
| signature | bytes | The signature of the previous parameters generated using the eth_personalSign RPC call. |

