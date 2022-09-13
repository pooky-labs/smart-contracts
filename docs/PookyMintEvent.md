# Solidity API

## PookyMintEvent

PookyMintEvent contract is the extension of PookyBallMinter, used only for initial minting event.
Before minting starts, templates with different rarities should be made
 using function from the base PookyBallMinter contract

Roles:
  DEFAULT_ADMIN_ROLE can add/remove roles
  BE role represents backend which can mint to the user address

### userTiers

```solidity
mapping(address => uint256) userTiers
```

### minTierToBuy

```solidity
uint256 minTierToBuy
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

### BE

```solidity
bytes32 BE
```

### initialize

```solidity
function initialize(uint256 _startFromId, address _admin, address _treasuryWallet, uint256 _maxMintSupply, uint256 _maxBallsPerUser, uint256 _revokePeriod, address _vrfCoordinator, uint32 _callbackGasLimit, uint16 _requestConfirmations, bytes32 _keyHash, uint64 _subscriptionId) public
```

### setAddressTier

```solidity
function setAddressTier(address _address, uint256 _tier) external
```

sets the tier of `_address` to the `_tier`
only MOD role can call this function

### setMinTierToBuy

```solidity
function setMinTierToBuy(uint256 _minTierToBuy) external
```

sets the minimum tier requiered to be able to mint to `_minTierToBuy`
only MOD role can call this function

### setMaxBallsPerUser

```solidity
function setMaxBallsPerUser(uint256 _maxBallsPerUser) external
```

sets the maximum number of mintable balls per address to `_maxBallsPerUser`
only MOD role can call this function

### setRevokePeriod

```solidity
function setRevokePeriod(uint256 _revokePeriod) external
```

sets revoke period to `_revokePeriod`
only MOD role can call this function

### mintsLeft

```solidity
function mintsLeft(address user) public view returns (uint256)
```

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | retunrs number of the avilable mints left to the address `user` |

### _mintBalls

```solidity
function _mintBalls(address user, uint256 numberOfBalls, uint256 templateId, uint256 revokeUntilTimestamp) internal
```

### mintBallsAuthorized

```solidity
function mintBallsAuthorized(address user, uint256 numberOfBalls, uint256 templateId) external
```

function called by backend to mint `numberOfBalls` balls to the address `user` with 
  template id `templateId`. 
This function is used when the user paid offchain for the balls.
Revoke period is set if there is dispute in the payment during this period.
only BE role can call this function

### revokeBallAuthorized

```solidity
function revokeBallAuthorized(uint256 ballId) external
```

function called by backend to revoke the ball.
This function is used when there is dispute in the payment.
only BE role can call this function

### mintBalls

```solidity
function mintBalls(uint256 numberOfBalls, uint256 templateId) external payable
```

function callable by users to mint

## PookyMintEvent

PookyMintEvent contract is the extension of PookyBallMinter, used only for initial minting event.
Before minting starts, templates with different rarities should be made
 using function from the base PookyBallMinter contract

Roles:
  DEFAULT_ADMIN_ROLE can add/remove roles
  BE role represents backend which can mint to the user address

### userTiers

```solidity
mapping(address => uint256) userTiers
```

### minTierToBuy

```solidity
uint256 minTierToBuy
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

### BE

```solidity
bytes32 BE
```

### initialize

```solidity
function initialize(uint256 _startFromId, address _admin, address _treasuryWallet, uint256 _maxMintSupply, uint256 _maxBallsPerUser, uint256 _revokePeriod, address _vrfCoordinator, uint32 _callbackGasLimit, uint16 _requestConfirmations, bytes32 _keyHash, uint64 _subscriptionId) public
```

### setAddressTier

```solidity
function setAddressTier(address _address, uint256 _tier) external
```

sets the tier of `_address` to the `_tier`
only MOD role can call this function

### setMinTierToBuy

```solidity
function setMinTierToBuy(uint256 _minTierToBuy) external
```

sets the minimum tier requiered to be able to mint to `_minTierToBuy`
only MOD role can call this function

### setMaxBallsPerUser

```solidity
function setMaxBallsPerUser(uint256 _maxBallsPerUser) external
```

sets the maximum number of mintable balls per address to `_maxBallsPerUser`
only MOD role can call this function

### setRevokePeriod

```solidity
function setRevokePeriod(uint256 _revokePeriod) external
```

sets revoke period to `_revokePeriod`
only MOD role can call this function

### mintsLeft

```solidity
function mintsLeft(address user) public view returns (uint256)
```

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | retunrs number of the avilable mints left to the address `user` |

### _mintBalls

```solidity
function _mintBalls(address user, uint256 numberOfBalls, uint256 templateId, uint256 revokeUntilTimestamp) internal
```

### mintBallsAuthorized

```solidity
function mintBallsAuthorized(address user, uint256 numberOfBalls, uint256 templateId) external
```

function called by backend to mint `numberOfBalls` balls to the address `user` with 
  template id `templateId`. 
This function is used when the user paid offchain for the balls.
Revoke period is set if there is dispute in the payment during this period.
only BE role can call this function

### revokeBallAuthorized

```solidity
function revokeBallAuthorized(uint256 ballId) external
```

function called by backend to revoke the ball.
This function is used when there is dispute in the payment.
only BE role can call this function

### mintBalls

```solidity
function mintBalls(uint256 numberOfBalls, uint256 templateId) external payable
```

function callable by users to mint

## PookyMintEvent

### userTiers

```solidity
mapping(address => uint256) userTiers
```

### minTierToBuy

```solidity
uint256 minTierToBuy
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

### BE

```solidity
bytes32 BE
```

### initialize

```solidity
function initialize(uint256 _startFromId, address _admin, address _treasuryWallet, uint256 _maxMintSupply, uint256 _maxBallsPerUser, uint256 _revokePeriod, address _vrfCoordinator, uint32 _callbackGasLimit, uint16 _requestConfirmations, bytes32 _keyHash, uint64 _subscriptionId) public
```

### setAddressTier

```solidity
function setAddressTier(address _address, uint256 _tier) external
```

### setMinTierToBuy

```solidity
function setMinTierToBuy(uint256 _minTierToBuy) external
```

### setMaxBallsPerUser

```solidity
function setMaxBallsPerUser(uint256 _maxBallsPerUser) external
```

### setRevokePeriod

```solidity
function setRevokePeriod(uint256 _revokePeriod) external
```

### mintsLeft

```solidity
function mintsLeft(address user) public view returns (uint256)
```

### _mintBalls

```solidity
function _mintBalls(address user, uint256 numberOfBalls, uint256 templateId, uint256 revokeUntilTimestamp) internal
```

### mintBallsAuthorized

```solidity
function mintBallsAuthorized(address user, uint256 numberOfBalls, uint256 templateId) external
```

### revokeBallAuthorized

```solidity
function revokeBallAuthorized(uint256 ballId) external
```

### mintBalls

```solidity
function mintBalls(uint256 numberOfBalls, uint256 templateId) external payable
```

