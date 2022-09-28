# Solidity API

## PookyBallMinter

PookyBallMinter is contract for minting balls with defined MintTemplates.
  This contract is the base contract for PookyMintEvent, and will be used 
  for the PookyStore.
Contract is using Chainlink VRF requests to get randomEntropy for the ball.
  

Roles:
  DEFAULT_ADMIN_ROLE can add/remove roles
  MOD role can create/change mint templates

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

### setVrfSubscriptionId

```solidity
function setVrfSubscriptionId(uint64 subscriptionId, uint32 callbackGasLimit, uint16 requestConfirmation, bytes32 keyHash) external
```

sets the configuration for chainlink vrf
only MOD role can call this function

### setPookyBallContract

```solidity
function setPookyBallContract(address pookyBallAddress) external
```

_sets the address of PookyBall contract
only DEFAULT_ADMIN_ROLE role can call this function_

### createMintTemplate

```solidity
function createMintTemplate(struct MintTemplate newMintTemplate) external returns (uint256)
```

creates the new mint template with `newMintTemplate` parameters
only MOD role can call this function
emits event CreateMintTemplate

### changeMintTemplateCanMint

```solidity
function changeMintTemplateCanMint(uint256 mintTemplateId, bool _canMint) external
```

change if tokens can be minted using minting template with id `mintTemplateId`
only MOD role can call this function
emits event SetMintTemplateCanMint

### _requestMintFromTemplate

```solidity
function _requestMintFromTemplate(address user, uint256 mintTemplateId, uint256 revokableUntilTimestamp) internal
```

emits events RequestMintFromTemplate and  RandomnessRequested

_internal function used to request new mint for the address `user`, using mint template `mintTemplateId`
 and the ball will be revokable until `revokableUntilTimestamp`.
function does all the checks, and requests random entropy from the Chainlink VRF._

### _requestRandomEntropyForMint

```solidity
function _requestRandomEntropyForMint(address user, uint256 ballId) internal
```

emits event RandomnessRequested

_internal function used to request random entropy from the Chainilnk VRF_

### fulfillRandomWords

```solidity
function fulfillRandomWords(uint256 requestId, uint256[] randomWords) internal
```

emits event RandomnessFullfiled

_this function is used in the response from Chainlink
we are using only first received number to set ball random entropy._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| requestId | uint256 | id of the sent request |
| randomWords | uint256[] | received random wards. |

