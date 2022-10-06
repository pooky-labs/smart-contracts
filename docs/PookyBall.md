# Solidity API

## PookyBall

PookyBall is ERC721 token representing Ball NFTs.
Mintable by other Pooky game contracts.

Roles:
DEFAULT_ADMIN_ROLE can add/remove roles
POOKY_CONTRACT role can mint new tokens

### baseUri

```solidity
string baseUri
```

### contractUri

```solidity
string contractUri
```

### POOKY_CONTRACT

```solidity
bytes32 POOKY_CONTRACT
```

### lastBallId

```solidity
uint256 lastBallId
```

### balls

```solidity
mapping(uint256 => struct BallInfo) balls
```

### BallLevelChange

```solidity
event BallLevelChange(uint256 ballId, uint256 level)
```

### BallAddPxp

```solidity
event BallAddPxp(uint256 ballId, uint256 addPxp)
```

### BallSetRandomEntropy

```solidity
event BallSetRandomEntropy(uint256 ballId, uint256 randomEntropy)
```

### initialize

```solidity
function initialize(string _name, string _symbol, string _baseUri, string _contractUri, address _admin) public
```

### contractURI

```solidity
function contractURI() public view returns (string)
```

### setContractURI

```solidity
function setContractURI(string _contractUri) external
```

### \_baseURI

```solidity
function _baseURI() internal view virtual returns (string)
```

_Base URI for computing {tokenURI}. If set, the resulting URI for each
token will be the concatenation of the `baseURI` and the `tokenId`. Empty
by default, can be overridden in child contracts._

### tokenURI

```solidity
function tokenURI(uint256 tokenId) public view virtual returns (string)
```

_See {IERC721Metadata-tokenURI}._

### getBallInfo

```solidity
function getBallInfo(uint256 ballId) external view returns (struct BallInfo)
```

#### Return Values

| Name | Type            | Description                                                                          |
| ---- | --------------- | ------------------------------------------------------------------------------------ |
| [0]  | struct BallInfo | returns BallInfo struct with all ball parameters for the Pooky Ball with id `ballId` |

### getBallPxp

```solidity
function getBallPxp(uint256 ballId) external view returns (uint256)
```

#### Return Values

| Name | Type    | Description                                           |
| ---- | ------- | ----------------------------------------------------- |
| [0]  | uint256 | returns pxp points of the Pooky Ball with id `ballId` |

### addBallPxp

```solidity
function addBallPxp(uint256 ballId, uint256 addPxpAmount) external
```

adds pxp points to the Pooky Ball with id `ballId`
only POOKY_CONTRACT role can call this function

#### Parameters

| Name         | Type    | Description             |
| ------------ | ------- | ----------------------- |
| ballId       | uint256 |                         |
| addPxpAmount | uint256 | amount of points to add |

### getBallLevel

```solidity
function getBallLevel(uint256 ballId) external view returns (uint256)
```

#### Return Values

| Name | Type    | Description                                      |
| ---- | ------- | ------------------------------------------------ |
| [0]  | uint256 | returns level of the Pooky Ball with id `ballId` |

### changeBallLevel

```solidity
function changeBallLevel(uint256 ballId, uint256 newLevel) external
```

changes the level of the Pooky Ball with id `ballId` to the `newLevel`
only POOKY_CONTRACT role can call this function

### \_mintBall

```solidity
function _mintBall(address to, struct BallInfo ballInfo) internal returns (uint256)
```

_mints new Pooky Ball with `ballInfo` parameters to the address `to`.
id of the ball is set incrementally, starting from 1.
this function is called internally, with default ball parameters_

### mintWithRarity

```solidity
function mintWithRarity(address to, enum BallRarity rarity) external returns (uint256)
```

mints new Pooky Ball to the address `to` with set rarity to `rarity`
and all other default parameters
only POOKY_CONTRACT role can call this function

### mintWithRarityAndRevokableTimestamp

```solidity
function mintWithRarityAndRevokableTimestamp(address to, enum BallRarity rarity, uint256 revokableUntil) external returns (uint256)
```

mints new Pooky Ball to the address `to` with set rarity to `rarity`,
and revokable until `revokableUntil`. All other parameters are default.
only POOKY_CONTRACT role can call this function

### revokeBall

```solidity
function revokeBall(uint256 ballId) external
```

revokes the ball with id `ballId`.
Ball is revokable only if current timestamp is less then `ball.revokableUntilTimestamp`
only POOKY_CONTRACT role can call this function

### setRandomEntropy

```solidity
function setRandomEntropy(uint256 ballId, uint256 _randomEntropy) external
```

sets the random entropy to the ball with id `ballId` to `_randomEntropy`
only POOKY_CONTRACT role can call this function

### \_beforeTokenTransfer

```solidity
function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal
```

_if the ball is still revokable, it can't be transfered._

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view virtual returns (bool)
```

### uintToStr

```solidity
function uintToStr(uint256 _i) internal pure returns (string _uintAsString)
```

_library function to convert int to string_
