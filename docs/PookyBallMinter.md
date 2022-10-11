# Solidity API

## PookyBallMinter

PookyBallMinter contains the game logic related to Pooky Ball mint.
Mints can only be triggers by specifying a MintTemplate id.
This contract is the base contract for {PookyMintEvent}, and will be used for the PookyStore.

Chainlink VRF requests are used to obtain randomEntropy for the Pooky Balls.

Roles:
- DEFAULT_ADMIN_ROLE can add/remove roles
- MOD role can create/change mint templates

### MOD

```solidity
bytes32 MOD
```

### pookyBall

```solidity
contract IPookyBall pookyBall
```

### vrf_coordinator

```solidity
contract VRFCoordinatorV2Interface vrf_coordinator
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

### MintTemplateEnabled

```solidity
event MintTemplateEnabled(uint256 templateId, bool enabled)
```

### RequestMintFromTemplate

```solidity
event RequestMintFromTemplate(uint256 templateId, address user)
```

### RandomnessRequested

```solidity
event RandomnessRequested(uint256 requestId, address user, uint256 tokenId)
```

### RandomnessFulfilled

```solidity
event RandomnessFulfilled(uint256 requestId, uint256 tokenId, uint256 randomEntropy)
```

### __PookyBallMinter_init

```solidity
function __PookyBallMinter_init(uint256 _startFromId, address _admin, address _vrfCoordinator, uint32 _callbackGasLimit, uint16 _requestConfirmations, bytes32 _keyHash, uint64 _subscriptionId) public
```

Initialization function that sets Chainlink VRF parameters.

### setVrfParameters

```solidity
function setVrfParameters(address _coordinator, uint64 subscriptionId, uint32 callbackGasLimit, uint16 requestConfirmation, bytes32 keyHash) external
```

Change the Chainlink VRF parameters.

_Requirements:
- only MOD role can change the Chainlink VRF parameters._

### setPookyBallContract

```solidity
function setPookyBallContract(address _pookyBall) external
```

Sets the address of the PookyBall contract.

_Requirements:
- only DEFAULT_ADMIN_ROLE role can call this function._

### createMintTemplate

```solidity
function createMintTemplate(struct MintTemplate newMintTemplate) external returns (uint256)
```

Create a new MintTemplate.

_Requirements:
- only MOD role can create MintTemplates.
Emits a CreateMintTemplate event._

### enableMintTemplate

```solidity
function enableMintTemplate(uint256 mintTemplateId, bool _enabled) external
```

Enable/disable mint for MintTemplate with id `mintTemplateId`.

_Requirements:
- only MOD role can create MintTemplates.
Emits a MintTemplateEnabled event._

### _requestMintFromTemplate

```solidity
function _requestMintFromTemplate(address recipient, uint256 mintTemplateId, uint256 revocableUntil) internal
```

_Internal function that mints a ball to the current contract and that will later be forwarded to {recipient}.
After checking all requirements:
- MintTemplate is enabled.
- MintTemplate maximum mints has not been reached.
The random entropy is made to Chainlink VRF platform.
Emits a RequestMintFromTemplate event._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| recipient | address | The final recipient of the newly linted Pooky Ball. |
| mintTemplateId | uint256 | The MintTemplate id. |
| revocableUntil | uint256 | The UNIX timestamp until the ball can be revoked. |

### _requestRandomEntropyForMint

```solidity
function _requestRandomEntropyForMint(address recipient, uint256 tokenId) internal
```

_Internal function used to request random entropy from the Chainlink VRF.
Emits a RandomnessRequested event._

### fulfillRandomWords

```solidity
function fulfillRandomWords(uint256 requestId, uint256[] randomWords) internal
```

_Handle randomness response from Chainlink VRF coordinator.
Since only 1 word is requested in {_requestRandomEntropyForMint}, only first received number is used to set the
Pooky Ball random entropy.
Emits a RandomnessFulfilled event._

### rawFulfillRandomWords

```solidity
function rawFulfillRandomWords(uint256 requestId, uint256[] randomWords) external
```

Called by the Chainlink VRF coordinator when fulfilling random words.

_Requirements:
- Only vrf_coordinator can call this function._

