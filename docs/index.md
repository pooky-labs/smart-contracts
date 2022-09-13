# Solidity API

## POK

POK is ERC20 token used inside of the game.SSS
  Mintable by other Pooky game contracts.
  Non-transferable in the beginning, until transfering is enabled by admin.

Roles:
  DEFAULT_ADMIN_ROLE can add/remove roles, can enable/disable token transfers. 
  POOKY_CONTRACT role can mint new tokens, can receive/send tokens while transfers are disabled.

### SetTransferEnabled

```solidity
event SetTransferEnabled(bool transferEnabled)
```

### POOKY_CONTRACT

```solidity
bytes32 POOKY_CONTRACT
```

### transferEnabled

```solidity
bool transferEnabled
```

### asdasd

```solidity
bool asdasd
```

### initialize

```solidity
function initialize(string _name, string _symbol, address _admin) public
```

### mint

```solidity
function mint(address to, uint256 amount) external
```

only POOKY_CONTRACT role can mint tokens

### setTransferEnabled

```solidity
function setTransferEnabled(bool _transferEnabled) external
```

enable or disable transfers of tokens between users
only DEFAULT_ADMIN_ROLE role can call this function

### _beforeTokenTransfer

```solidity
function _beforeTokenTransfer(address from, address to, uint256 amount) internal
```

_don't allow transfer if disabled
if transfers are disabled it's still posible to mint/burn tokens, 
and send it to, or receive from, pooky game contracts_

## PookyBall

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

### _baseURI

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

### getBallPxp

```solidity
function getBallPxp(uint256 ballId) external view returns (uint256)
```

### addBallPxp

```solidity
function addBallPxp(uint256 ballId, uint256 addPxpAmount) external
```

### getBallLevel

```solidity
function getBallLevel(uint256 ballId) external view returns (uint256)
```

### changeBallLevel

```solidity
function changeBallLevel(uint256 ballId, uint256 newLevel) external
```

### _mintBall

```solidity
function _mintBall(address to, struct BallInfo ballInfo) internal returns (uint256)
```

### mintWithRarity

```solidity
function mintWithRarity(address to, enum BallRarity rarity) external returns (uint256)
```

### mintWithRarityAndRevokableTimestamp

```solidity
function mintWithRarityAndRevokableTimestamp(address to, enum BallRarity rarity, uint256 revokableUntil) external returns (uint256)
```

### revokeBall

```solidity
function revokeBall(uint256 ballId) external
```

### setRandomEntropy

```solidity
function setRandomEntropy(uint256 ballId, uint256 _randomEntropy) external
```

### _beforeTokenTransfer

```solidity
function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal
```

_Hook that is called before any token transfer. This includes minting
and burning.

Calling conditions:

- When `from` and `to` are both non-zero, ``from``'s `tokenId` will be
transferred to `to`.
- When `from` is zero, `tokenId` will be minted for `to`.
- When `to` is zero, ``from``'s `tokenId` will be burned.
- `from` and `to` are never both zero.

To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks]._

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view virtual returns (bool)
```

### uintToStr

```solidity
function uintToStr(uint256 _i) internal pure returns (string _uintAsString)
```

## PookyBallMinter

### pookyBall

```solidity
contract IPookyBall pookyBall
```

### MOD

```solidity
bytes32 MOD
```

### VRF_COORDINATOR

```solidity
contract VRFCoordinatorV2Interface VRF_COORDINATOR
```

### vrf_subscriptionId

```solidity
uint64 vrf_subscriptionId
```

### vrf_callbackGasLimit

```solidity
uint32 vrf_callbackGasLimit
```

### vrf_requestConfirmations

```solidity
uint16 vrf_requestConfirmations
```

### vrf_keyHash

```solidity
bytes32 vrf_keyHash
```

### lastMintTemplateId

```solidity
uint256 lastMintTemplateId
```

### mintTemplates

```solidity
mapping(uint256 => struct MintTemplate) mintTemplates
```

### mintRandomRequests

```solidity
mapping(uint256 => struct MintRandomRequest) mintRandomRequests
```

### CreateMintTemplate

```solidity
event CreateMintTemplate(uint256 templateId)
```

### SetMintTemplateCanMint

```solidity
event SetMintTemplateCanMint(uint256 templateId, bool canMint)
```

### RequestMintFromTemplate

```solidity
event RequestMintFromTemplate(uint256 templateId, address user)
```

### RandomnessRequested

```solidity
event RandomnessRequested(uint256 requestId, address user, uint256 ballId)
```

### RandomnessFullfiled

```solidity
event RandomnessFullfiled(uint256 requestId, uint256 ballId, uint256 randomEntropy)
```

### __PookyBallMinter_init

```solidity
function __PookyBallMinter_init(uint256 _startFromId, address _admin, address _vrfCoordinator, uint32 _callbackGasLimit, uint16 _requestConfirmations, bytes32 _keyHash, uint64 _subscriptionId) public
```

### setPookyBallContract

```solidity
function setPookyBallContract(address pookyBallAddress) external
```

### createMintTemplate

```solidity
function createMintTemplate(struct MintTemplate newMintTemplate) external returns (uint256)
```

### changeMintTemplateCanMint

```solidity
function changeMintTemplateCanMint(uint256 mintTemplateId, bool _canMint) external
```

### _requestMintFromTemplate

```solidity
function _requestMintFromTemplate(address user, uint256 mintTemplateId, uint256 revokableUntilTimestamp) internal
```

### _requestRandomEntropyForMint

```solidity
function _requestRandomEntropyForMint(address user, uint256 ballId) internal
```

### fulfillRandomWords

```solidity
function fulfillRandomWords(uint256 requestId, uint256[] randomWords) internal
```

fulfillRandomness handles the VRF response. Your contract must
implement it. See "SECURITY CONSIDERATIONS" above for important
principles to keep in mind when implementing your fulfillRandomness
method.

_VRFConsumerBaseV2 expects its subcontracts to have a method with this
signature, and will call it once it has verified the proof
associated with the randomness. (It is triggered via a call to
rawFulfillRandomness, below.)_

| Name | Type | Description |
| ---- | ---- | ----------- |
| requestId | uint256 | The Id initially returned by requestRandomness |
| randomWords | uint256[] | the VRF output expanded to the requested number of words |

## PookyGame

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

### _setLevelPxpNeeded

```solidity
function _setLevelPxpNeeded() internal
```

### _setLevelCost

```solidity
function _setLevelCost() internal
```

### _setMaxBallLevel

```solidity
function _setMaxBallLevel() internal
```

### setPookyBallContract

```solidity
function setPookyBallContract(address pookyBallAddress) external
```

### setPookySigner

```solidity
function setPookySigner(address _pookySigner) external
```

### setPookToken

```solidity
function setPookToken(address _pookToken) external
```

### verifySignature

```solidity
function verifySignature(bytes message, struct Signature sig, address sigWalletCheck) private pure returns (bool)
```

### levelUp

```solidity
function levelUp(uint256 ballId) public
```

### matchweekClaim

```solidity
function matchweekClaim(uint256 pookAmount, struct BallUpdates[] ballUpdates, uint256 ttl, uint256 nonce, struct Signature sig) external
```

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

## UpgradableProxy

### constructor

```solidity
constructor(address _logic, address admin_, bytes _data) public
```

## VRFConsumerBaseV2

***************************************************************************
Interface for contracts using VRF randomness
*****************************************************************************

_PURPOSE

Reggie the Random Oracle (not his real job) wants to provide randomness
to Vera the verifier in such a way that Vera can be sure he's not
making his output up to suit himself. Reggie provides Vera a public key
to which he knows the secret key. Each time Vera provides a seed to
Reggie, he gives back a value which is computed completely
deterministically from the seed and the secret key.

Reggie provides a proof by which Vera can verify that the output was
correctly computed once Reggie tells it to her, but without that proof,
the output is indistinguishable to her from a uniform random sample
from the output space.

The purpose of this contract is to make it easy for unrelated contracts
to talk to Vera the verifier about the work Reggie is doing, to provide
simple access to a verifiable source of randomness. It ensures 2 things:
1. The fulfillment came from the VRFCoordinator
2. The consumer contract implements fulfillRandomWords.
*****************************************************************************
USAGE

Calling contracts must inherit from VRFConsumerBase, and can
initialize VRFConsumerBase's attributes in their constructor as
shown:

  contract VRFConsumer {
    constructor(<other arguments>, address _vrfCoordinator, address _link)
      VRFConsumerBase(_vrfCoordinator) public {
        <initialization with other arguments goes here>
      }
  }

The oracle will have given you an ID for the VRF keypair they have
committed to (let's call it keyHash). Create subscription, fund it
and your consumer contract as a consumer of it (see VRFCoordinatorInterface
subscription management functions).
Call requestRandomWords(keyHash, subId, minimumRequestConfirmations,
callbackGasLimit, numWords),
see (VRFCoordinatorInterface for a description of the arguments).

Once the VRFCoordinator has received and validated the oracle's response
to your request, it will call your contract's fulfillRandomWords method.

The randomness argument to fulfillRandomWords is a set of random words
generated from your requestId and the blockHash of the request.

If your contract could have concurrent requests open, you can use the
requestId returned from requestRandomWords to track which response is associated
with which randomness request.
See "SECURITY CONSIDERATIONS" for principles to keep in mind,
if your contract could have multiple requests in flight simultaneously.

Colliding `requestId`s are cryptographically impossible as long as seeds
differ.

*****************************************************************************
SECURITY CONSIDERATIONS

A method with the ability to call your fulfillRandomness method directly
could spoof a VRF response with any random value, so it's critical that
it cannot be directly called by anything other than this base contract
(specifically, by the VRFConsumerBase.rawFulfillRandomness method).

For your users to trust that your contract's random behavior is free
from malicious interference, it's best if you can write it so that all
behaviors implied by a VRF response are executed *during* your
fulfillRandomness method. If your contract must store the response (or
anything derived from it) and use it later, you must ensure that any
user-significant behavior which depends on that stored value cannot be
manipulated by a subsequent VRF request.

Similarly, both miners and the VRF oracle itself have some influence
over the order in which VRF responses appear on the blockchain, so if
your contract could have multiple VRF requests in flight simultaneously,
you must ensure that the order in which the VRF responses arrive cannot
be used to manipulate your contract's user-significant behavior.

Since the block hash of the block which contains the requestRandomness
call is mixed into the input to the VRF *last*, a sufficiently powerful
miner could, in principle, fork the blockchain to evict the block
containing the request, forcing the request to be included in a
different block with a different hash, and therefore a different input
to the VRF. However, such an attack would incur a substantial economic
cost. This cost scales with the number of blocks the VRF oracle waits
until it calls responds to a request. It is for this reason that
that you can signal to an oracle you'd like them to wait longer before
responding to the request (however this is not enforced in the contract
and so remains effective only in the case of unmodified oracle software)._

### OnlyCoordinatorCanFulfill

```solidity
error OnlyCoordinatorCanFulfill(address have, address want)
```

### vrfCoordinator

```solidity
address vrfCoordinator
```

### __VRFConsumerBaseV2_init

```solidity
function __VRFConsumerBaseV2_init(address _vrfCoordinator) internal
```

| Name | Type | Description |
| ---- | ---- | ----------- |
| _vrfCoordinator | address | address of VRFCoordinator contract |

### fulfillRandomWords

```solidity
function fulfillRandomWords(uint256 requestId, uint256[] randomWords) internal virtual
```

fulfillRandomness handles the VRF response. Your contract must
implement it. See "SECURITY CONSIDERATIONS" above for important
principles to keep in mind when implementing your fulfillRandomness
method.

_VRFConsumerBaseV2 expects its subcontracts to have a method with this
signature, and will call it once it has verified the proof
associated with the randomness. (It is triggered via a call to
rawFulfillRandomness, below.)_

| Name | Type | Description |
| ---- | ---- | ----------- |
| requestId | uint256 | The Id initially returned by requestRandomness |
| randomWords | uint256[] | the VRF output expanded to the requested number of words |

### rawFulfillRandomWords

```solidity
function rawFulfillRandomWords(uint256 requestId, uint256[] randomWords) external
```

## IPOK

### mint

```solidity
function mint(address to, uint256 amount) external
```

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

## MockPOK

### mock_mint

```solidity
function mock_mint(address to, uint256 amount) external
```

## MockPookyBall

### mock_mintBall

```solidity
function mock_mintBall(address to, struct BallInfo ballInfo) external returns (uint256)
```

### mock_setBallInfo

```solidity
function mock_setBallInfo(uint256 ballId, struct BallInfo ballInfo) external
```

## BallRarity

```solidity
enum BallRarity {
  Uncommon,
  Rare,
  Epic,
  Legendary,
  Mythic
}
```

## BallInfo

```solidity
struct BallInfo {
  enum BallRarity rarity;
  uint256 randomEntropy;
  uint256 level;
  uint256 pxp;
  bool canBreed;
  uint256 cardSlots;
  uint256[] cards;
  uint256 revokableUntilTimestamp;
}
```

## MintTemplate

```solidity
struct MintTemplate {
  bool canMint;
  enum BallRarity rarity;
  uint256 maxMints;
  uint256 currentMints;
  uint256 price;
  address payingToken;
}
```

## MintRandomRequest

```solidity
struct MintRandomRequest {
  address user;
  uint256 ballId;
}
```

## BallUpdates

```solidity
struct BallUpdates {
  uint256 ballId;
  uint256 addPxp;
  bool toLevelUp;
}
```

## Signature

```solidity
struct Signature {
  uint8 _v;
  bytes32 _r;
  bytes32 _s;
}
```

## Errors

### ONLY_POOKY_CONTRACTS

```solidity
string ONLY_POOKY_CONTRACTS
```

### TOKEN_DOESNT_EXIST

```solidity
string TOKEN_DOESNT_EXIST
```

### MINTING_DISABLED

```solidity
string MINTING_DISABLED
```

### MAX_MINTS_REACHED

```solidity
string MAX_MINTS_REACHED
```

### MUST_BE_OWNER

```solidity
string MUST_BE_OWNER
```

### NOT_ENOUGH_PXP

```solidity
string NOT_ENOUGH_PXP
```

### MAX_LEVEL_REACHED

```solidity
string MAX_LEVEL_REACHED
```

### FALSE_SIGNATURE

```solidity
string FALSE_SIGNATURE
```

### TTL_PASSED

```solidity
string TTL_PASSED
```

### USED_NONCE

```solidity
string USED_NONCE
```

### POK_TRANSFER_NOT_ENABLED

```solidity
string POK_TRANSFER_NOT_ENABLED
```

### REVOKABLE_TIMESTAMP_PASSED

```solidity
string REVOKABLE_TIMESTAMP_PASSED
```

### CANT_TRNSFER_WHILE_REVOKABLE

```solidity
string CANT_TRNSFER_WHILE_REVOKABLE
```

### ONLY_MOD

```solidity
string ONLY_MOD
```

### MAX_MINTS_USER_REACHED

```solidity
string MAX_MINTS_USER_REACHED
```

### MSG_VALUE_SMALL

```solidity
string MSG_VALUE_SMALL
```

### TREASURY_TRANSFER_FAIL

```solidity
string TREASURY_TRANSFER_FAIL
```

### NEEDS_BIGGER_TIER

```solidity
string NEEDS_BIGGER_TIER
```

### MAX_MINT_SUPPLY_REACHED

```solidity
string MAX_MINT_SUPPLY_REACHED
```

