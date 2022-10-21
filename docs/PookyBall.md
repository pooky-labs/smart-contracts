# Solidity API

## PookyBall

PookyBall is ERC721 token representing Pooky Ball NFTs. Balls are mintable by other Pooky game contracts.
This contract does not hold any aspect of the Pooky gameplay and only serves as Pooky Ball information storage.

Pooky Balls NFT have the following features (see {BallInfo}):
- `rarity`
- `randomEntropy` the ball random entropy (provided by Chainlink VRF v2) which is used to generate the ball image and
  in-game boosts.
- `level` the ball level
- `pxp` the ball PXP (experience points)

Leveling up:
Pooky Balls NFT gain PXP when used to place prediction on the Pooky game. Balls cannot loose PXP.
Once a ball has acquired enough PXP, it can be leveled up in exchange of a certain amount of $POK token (see {POK}).

Roles:
- DEFAULT_ADMIN_ROLE can add/remove roles.
- POOKY_CONTRACT role can mint new tokens.

### POOKY_CONTRACT

```solidity
bytes32 POOKY_CONTRACT
```

### baseURI_

```solidity
string baseURI_
```

### _contractURI

```solidity
string _contractURI
```

### lastTokenId

```solidity
uint256 lastTokenId
```

### balls

```solidity
mapping(uint256 => struct BallInfo) balls
```

### BallRandomEntropySet

```solidity
event BallRandomEntropySet(uint256 tokenId, uint256 randomEntropy)
```

### BallLevelUpdated

```solidity
event BallLevelUpdated(uint256 tokenId, uint256 level)
```

### BallPXPUpdated

```solidity
event BallPXPUpdated(uint256 tokenId, uint256 amount)
```

### EntropyAlreadySet

```solidity
error EntropyAlreadySet(uint256 tokenId)
```

Thrown when the entropy of a ball has been already

### initialize

```solidity
function initialize(string _name, string _symbol, string _baseURI_, string contractURI_, address _admin) public
```

### contractURI

```solidity
function contractURI() public view returns (string)
```

URI of the contract-level metadata.
Specified by OpenSea documentation (https://docs.opensea.io/docs/contract-level-metadata).

### setContractURI

```solidity
function setContractURI(string contractURI_) external
```

Set the URI of the contract-level metadata.

_Requirements:
- Only DEFAULT_ADMIN_ROLE role can set the contract URI._

### tokenURI

```solidity
function tokenURI(uint256 tokenId) public view virtual returns (string)
```

Metadata URI of the token {tokenId}.

_See {IERC721Metadata-tokenURI}.
Requirements:
- Ball {tokenId} should exist (minted and not burned)._

### getBallInfo

```solidity
function getBallInfo(uint256 tokenId) external view returns (struct BallInfo)
```

Ball information of a particular Pooky Ball.

_Requirements:
- Ball {tokenId} should exist (minted and not burned)._

### setRandomEntropy

```solidity
function setRandomEntropy(uint256 tokenId, uint256 _randomEntropy) external
```

Sets the random entropy of the Pooky Ball with id {tokenId}.

_Requirements:
- Only POOKY_CONTRACT role can increase Pooky Balls levels.
- Ball {tokenId} should exist (minted and not burned).
- Previous entropy should be zero._

### changePXP

```solidity
function changePXP(uint256 tokenId, uint256 amount) external
```

Change the PXP (Experience points) of the Pooky Ball with id {tokenId}.

_Requirements:
- Only POOKY_CONTRACT role can increase Pooky Balls PXP.
- Ball {tokenId} should exist (minted and not burned)._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | The Pooky Ball NFT id. |
| amount | uint256 | The PXP amount to add the to Pooky Ball. |

### changeLevel

```solidity
function changeLevel(uint256 tokenId, uint256 newLevel) external
```

Change the level of the Pooky Ball with id {tokenId} to the {newLevel}

_Requirements:
- Only POOKY_CONTRACT role can increase Pooky Balls levels.
- Ball {tokenId} should exist (minted and not burned)._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | The Pooky Ball NFT id. |
| newLevel | uint256 | The new Ball level. |

### _mintBall

```solidity
function _mintBall(address to, struct BallInfo ballInfo) internal returns (uint256)
```

_Internal function that can mint any ball without any restriction; it keeps track of the lastTokenId._

### mint

```solidity
function mint(address to, enum BallRarity rarity, enum BallLuxury luxury) external returns (uint256)
```

Mint a ball with a specific {BallRarity} and {BallLuxury} with all other Ball parameters set to default.

_Requirements:
- Only POOKY_CONTRACT role can mint Pooky Balls._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| to | address | The address which will own the minted Pooky Ball. |
| rarity | enum BallRarity | The Pooky Ball rarity. |
| luxury | enum BallLuxury | The Pooky Ball luxury. |

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view virtual returns (bool)
```

IERC165 declaration.

