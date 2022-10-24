# Solidity API

## PookyballMinter

PookyballMinter contains the game logic related to Pookyball mint.
Mints can only be triggers by specifying a MintTemplate id.
This contract is the base contract for {PookyMintEvent}, and will be used for the PookyStore.

Chainlink VRF requests are used to obtain randomEntropy for the Pookyballs.

Roles:
- DEFAULT_ADMIN_ROLE can add/remove roles
- TECH role can create/change mint templates

### TECH

```solidity
bytes32 TECH
```

### pookyBall

```solidity
contract IPookyball pookyBall
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

### MintTemplateCreated

```solidity
event MintTemplateCreated(uint256 templateId)
```

### MintTemplateEnabled

```solidity
event MintTemplateEnabled(uint256 templateId, bool enabled)
```

### RequestMintFromTemplate

```solidity
event RequestMintFromTemplate(uint256 templateId, address recipient)
```

### RandomnessRequested

```solidity
event RandomnessRequested(uint256 requestId, uint256 tokenId, address recipient)
```

### RandomnessFulfilled

```solidity
event RandomnessFulfilled(uint256 requestId, uint256 tokenId, uint256 randomEntropy)
```

### MintDisabled

```solidity
error MintDisabled(uint256 templateId)
```

### MaximumMintsReached

```solidity
error MaximumMintsReached(uint256 templateId, uint256 maximumMints)
```

### OnlyVRFCoordinator

```solidity
error OnlyVRFCoordinator(address coordinator, address actual)
```

### __PookyballMinter_init

```solidity
function __PookyballMinter_init(uint256 _startFromId, address _admin, address _vrfCoordinator, uint32 _callbackGasLimit, uint16 _requestConfirmations, bytes32 _keyHash, uint64 _subscriptionId) public
```

Initialization function that sets Chainlink VRF parameters.

### setVrfParameters

```solidity
function setVrfParameters(address _coordinator, uint64 subscriptionId, uint32 callbackGasLimit, uint16 requestConfirmations, bytes32 keyHash) external
```

Change the Chainlink VRF parameters.

_Requirements:
- only TECH role can change the Chainlink VRF parameters._

### setPookyballContract

```solidity
function setPookyballContract(address _pookyBall) external
```

Sets the address of the Pookyball contract.

_Requirements:
- only DEFAULT_ADMIN_ROLE role can call this function._

### createMintTemplate

```solidity
function createMintTemplate(struct MintTemplate newMintTemplate) external returns (uint256)
```

Create a new MintTemplate.

_Requirements:
- only TECH role can create MintTemplates.
Emits a MintTemplateCreated event._

### enableMintTemplate

```solidity
function enableMintTemplate(uint256 mintTemplateId, bool _enabled) external
```

Enable/disable mint for MintTemplate with id `templateId`.

_Requirements:
- only TECH role can create MintTemplates.
Emits a MintTemplateEnabled event._

### _requestMintFromTemplate

```solidity
function _requestMintFromTemplate(address recipient, uint256 templateId) internal
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
| recipient | address | The final recipient of the newly linted Pookyball. |
| templateId | uint256 | The MintTemplate id. |

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
Pookyball random entropy.
Emits a RandomnessFulfilled event._

### rawFulfillRandomWords

```solidity
function rawFulfillRandomWords(uint256 requestId, uint256[] randomWords) external
```

Called by the Chainlink VRF coordinator when fulfilling random words.

_Requirements:
- Only vrf_coordinator can call this function._
