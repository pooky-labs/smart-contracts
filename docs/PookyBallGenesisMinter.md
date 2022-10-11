# Solidity API

## PookyBallGenesisMinter

Extension of PookyBallMinter that will only be used for the initial minting event.
This particular Minter also includes a basic tiered allowlist.

_The zero tier means that the mint is public.

Roles:
  DEFAULT_ADMIN_ROLE can add/remove roles
  BE role represents backend which can mint to the user address_

### BE

```solidity
bytes32 BE
```

### minTierToBuy

```solidity
uint256 minTierToBuy
```

### userTiers

```solidity
mapping(address => uint256) userTiers
```

### maxBallsPerUser

```solidity
uint256 maxBallsPerUser
```

### userBallsMinted

```solidity
mapping(address => uint256) userBallsMinted
```

### ballsMinted

```solidity
uint256 ballsMinted
```

### maxMintSupply

```solidity
uint256 maxMintSupply
```

### revokePeriod

```solidity
uint256 revokePeriod
```

### treasuryWallet

```solidity
address treasuryWallet
```

### UserTierSet

```solidity
event UserTierSet(address user, uint256 tier)
```

### initialize

```solidity
function initialize(uint256 _startFromId, address _admin, address _treasuryWallet, uint256 _maxMintSupply, uint256 _maxBallsPerUser, uint256 _revokePeriod, address _vrfCoordinator, uint32 _callbackGasLimit, uint16 _requestConfirmations, bytes32 _keyHash, uint64 _subscriptionId) public
```

### mintsLeft

```solidity
function mintsLeft(address account) public view returns (uint256)
```

The allowed remaining mints for a given {account}.

### setMinTierToBuy

```solidity
function setMinTierToBuy(uint256 _minTierToBuy) external
```

Set the minimum allow list tier allowed to mint.

_Requirements:
- only MOD role can manage the allowlist._

### setMaxBallsPerUser

```solidity
function setMaxBallsPerUser(uint256 _maxBallsPerUser) external
```

Set the maximum number of mintable balls per account.

_Pooky Balls balance might exceed this limit as Ball transfers are permitted.
Mints are tracked by {userBallsMinted}.

Requirements:
- only MOD role can manage the allowlist._

### setRevokePeriod

```solidity
function setRevokePeriod(uint256 _revokePeriod) external
```

Set the revocable period duration in seconds.

_Requirements:
- only MOD role can manage the allowlist._

### setTierBatch

```solidity
function setTierBatch(address[] accounts, uint256[] tiers) external
```

Set the allowlist tier of multiple addresses.

_Requirements:
- only MOD role can manage the allowlist._

### _mint

```solidity
function _mint(address recipient, uint256 templateId, uint256 amount, uint256 revokeUntil) internal
```

_Internal function that mints multiple balls at once._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| recipient | address | The account address that will receive the Pooky Balls NFTs. |
| templateId | uint256 | The selected MintTemplate id. |
| amount | uint256 | The number of balls minted by the user. |
| revokeUntil | uint256 | The UNIX timestamp until the Pooky Ball are revocable. |

### mint

```solidity
function mint(uint256 templateId, uint256 amount) external payable
```

Public mint function that is callable by the users.

_Since crypto payments cannot be disputed, revokeUntil parameter is zero.
Requirements:
- Transaction value must be equal to the ball price * amount._

### mintAuthorized

```solidity
function mintAuthorized(address recipient, uint256 templateId, uint256 amount) external
```

Mint Pooky Balls from the back-end, following an off-chain payment (e.g. credit card).
Revoke period is set if there is dispute in the payment during this period.

_Requirements:
- only BE role can manage the mint balls freely._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| recipient | address | The account address that will receive the Pooky Balls NFTs. |
| templateId | uint256 | The selected MintTemplate id. |
| amount | uint256 | The number of balls minted by the user. |

### revokeBallAuthorized

```solidity
function revokeBallAuthorized(uint256 tokenId) external
```

function called by backend to revoke the ball.
This function is used when there is dispute in the payment.
only BE role can call this function

