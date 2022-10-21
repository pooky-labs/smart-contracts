# Solidity API

## PookyBallGenesisMinter

Extension of PookyBallMinter that will only be used for the initial minting event.
This particular Minter also includes a basic tiered allowlist.

_The zero tier means that the mint is public.

Roles:
  DEFAULT_ADMIN_ROLE can add/remove roles.
  TECH role represents the Pooky Engineering team which is allowed to set account allowlist tier._

### minTierToMint

```solidity
uint256 minTierToMint
```

The minimum required tier (inclusive) to mint a Pooky Ball token.

### accountTiers

```solidity
mapping(address => uint256) accountTiers
```

The allowlist account => tier mapping.

### maxAccountMints

```solidity
uint256 maxAccountMints
```

The maximum mints allowed per account.

### accountMints

```solidity
mapping(address => uint256) accountMints
```

The account => number of minted balls

### ballsMinted

```solidity
uint256 ballsMinted
```

The total of balls with this contracts.

### maxMintSupply

```solidity
uint256 maxMintSupply
```

The maximum mints that will be allowed in this contracts.

### treasuryWallet

```solidity
address treasuryWallet
```

The treasury wallet where all the mint funds will be forwarded.

### TierSet

```solidity
event TierSet(address account, uint256 tier)
```

Emitted when an account tier is set.

### ArgumentSizeMismatch

```solidity
error ArgumentSizeMismatch(uint256 x, uint256 y)
```

Thrown when the length of two parameters mismatch. Used in batched functions.

### InsufficientValue

```solidity
error InsufficientValue(uint256 required, uint256 actual)
```

Thrown when the msg.value is insufficient.

### TransferToTreasuryFailed

```solidity
error TransferToTreasuryFailed(address from)
```

Thrown when a native transfer to treasury fails (but it should never happen).

### TierTooLow

```solidity
error TierTooLow(uint256 required, uint256 actual)
```

Thrown when an account's tier is too low regarding the {minTierToMint} value.

### MaxMintsReached

```solidity
error MaxMintsReached(uint256 remaining, uint256 requested)
```

Thrown when an account has reached the maximum allowed mints per account.

### MaxSupplyReached

```solidity
error MaxSupplyReached(uint256 remaining, uint256 requested)
```

Thrown when a mint exceeds the {maxSupply}.

### initialize

```solidity
function initialize(uint256 _startFromId, address _admin, address _treasuryWallet, uint256 _maxMintSupply, uint256 _maxBallsPerUser, address _vrfCoordinator, uint32 _callbackGasLimit, uint16 _requestConfirmations, bytes32 _keyHash, uint64 _subscriptionId) public
```

### mintsLeft

```solidity
function mintsLeft(address account) public view returns (uint256)
```

The allowed remaining mints for a given {account}.

### setMinTierToMint

```solidity
function setMinTierToMint(uint256 _minTierToMint) external
```

Set the minimum allow list tier allowed to mint.

_Requirements:
- only TECH role can manage the allowlist._

### setTierBatch

```solidity
function setTierBatch(address[] accounts, uint256[] tiers) external
```

Set the allowlist tier of multiple addresses.

_Requirements:
- only TECH role can manage the allowlist._

### setMaxAccountMints

```solidity
function setMaxAccountMints(uint256 _maxAccountsMints) external
```

Set the maximum number of mintable balls per account.

_Pooky Balls balance might exceed this limit as Ball transfers are permitted.
Mints are tracked by {accountMints}.

Requirements:
- only TECH role can change how many balls can be minted per account._

### _mint

```solidity
function _mint(address recipient, uint256 templateId, uint256 amount) internal
```

_Internal function that mints multiple balls at once._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| recipient | address | The account address that will receive the Pooky Balls NFTs. |
| templateId | uint256 | The selected MintTemplate id. |
| amount | uint256 | The number of balls minted by the account. |

### mint

```solidity
function mint(uint256 templateId, uint256 amount) external payable
```

Public mint function that is callable by the external accounts.
Requirements:
- Transaction value must be equal to the ball price * amount.
- Native transfer to the {treasuryWallet} must succeed.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| templateId | uint256 | The {MintTemplate} id. |
| amount | uint256 | The amount of balls to mint. |

