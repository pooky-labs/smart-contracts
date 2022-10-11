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

### levelPXP

```solidity
uint256[] levelPXP
```

### levelPOKCost

```solidity
uint256[] levelPOKCost
```

### maxBallLevelPerRarity

```solidity
mapping(enum BallRarity => uint256) maxBallLevelPerRarity
```

### usedNonces

```solidity
mapping(uint256 => bool) usedNonces
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

### _setLevelPXP

```solidity
function _setLevelPXP() external
```

_Initialization function that sets the Pooky Ball PXP required for a given level.
Levels range starts at 0 and ends at 100, inclusive.
TODO(2022 Oct 11): exact formula is still in active discussion_

### _setLevelPOKCost

```solidity
function _setLevelPOKCost() external
```

_Initialization function that sets the $POK token required to level up Pooky Ball at given level.
Levels range starts at 0 and ends at 100, inclusive.
TODO(2022 Oct 11): exact formula is still in active discussion_

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

### verifySignature

```solidity
function verifySignature(bytes message, bytes signature) private view returns (bool)
```

_Internal function that checks if a {message} has be signed by a REWARD_SIGNER._

### levelUp

```solidity
function levelUp(uint256 tokenId) public
```

Level up a Pooky Ball in exchange of a certain amount of $POK token.

_Requirements
- msg.sender must be the Pooky Ball owner
- msg.sender must own enough $POK tokens
- Pooky Ball should have enough PXP to reach the next level.
- Pooky Ball level should be strictly less than the maximum allowed level for its rarity._

### claimRewards

```solidity
function claimRewards(uint256 POKAmount, struct BallUpdates[] ballUpdates, uint256 ttl, uint256 nonce, bytes signature) external
```

Claim prediction rewards ($POK tokens and Ball PXP).

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| POKAmount | uint256 | The $POK token amount. |
| ballUpdates | struct BallUpdates[] | The updated to apply to the Pooky Balls (PXP and optional level up). |
| ttl | uint256 | UNIX timestamp until signature is valid. |
| nonce | uint256 | Unique word that prevents the usage the same signature twice. |
| signature | bytes | The signature of the previous parameters generated using the eth_personalSign RPC call. |

