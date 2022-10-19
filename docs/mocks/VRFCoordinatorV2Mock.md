# Solidity API

## VRFCoordinatorV2Mock

### BASE_FEE

```solidity
uint96 BASE_FEE
```

### GAS_PRICE_LINK

```solidity
uint96 GAS_PRICE_LINK
```

### MAX_CONSUMERS

```solidity
uint16 MAX_CONSUMERS
```

### InvalidSubscription

```solidity
error InvalidSubscription()
```

### InsufficientBalance

```solidity
error InsufficientBalance()
```

### MustBeSubOwner

```solidity
error MustBeSubOwner(address owner)
```

### TooManyConsumers

```solidity
error TooManyConsumers()
```

### InvalidConsumer

```solidity
error InvalidConsumer()
```

### InvalidRandomWords

```solidity
error InvalidRandomWords()
```

### RandomWordsRequested

```solidity
event RandomWordsRequested(bytes32 keyHash, uint256 requestId, uint256 preSeed, uint64 subId, uint16 minimumRequestConfirmations, uint32 callbackGasLimit, uint32 numWords, address sender)
```

### RandomWordsFulfilled

```solidity
event RandomWordsFulfilled(uint256 requestId, uint256 outputSeed, uint96 payment, bool success)
```

### SubscriptionCreated

```solidity
event SubscriptionCreated(uint64 subId, address owner)
```

### SubscriptionFunded

```solidity
event SubscriptionFunded(uint64 subId, uint256 oldBalance, uint256 newBalance)
```

### SubscriptionCanceled

```solidity
event SubscriptionCanceled(uint64 subId, address to, uint256 amount)
```

### ConsumerAdded

```solidity
event ConsumerAdded(uint64 subId, address consumer)
```

### ConsumerRemoved

```solidity
event ConsumerRemoved(uint64 subId, address consumer)
```

### s_currentSubId

```solidity
uint64 s_currentSubId
```

### s_nextRequestId

```solidity
uint256 s_nextRequestId
```

### s_nextPreSeed

```solidity
uint256 s_nextPreSeed
```

### Subscription

```solidity
struct Subscription {
  address owner;
  uint96 balance;
}
```

### s_subscriptions

```solidity
mapping(uint64 => struct VRFCoordinatorV2Mock.Subscription) s_subscriptions
```

### s_consumers

```solidity
mapping(uint64 => address[]) s_consumers
```

### Request

```solidity
struct Request {
  uint64 subId;
  uint32 callbackGasLimit;
  uint32 numWords;
}
```

### s_requests

```solidity
mapping(uint256 => struct VRFCoordinatorV2Mock.Request) s_requests
```

### constructor

```solidity
constructor(uint96 _baseFee, uint96 _gasPriceLink) public
```

### consumerIsAdded

```solidity
function consumerIsAdded(uint64 _subId, address _consumer) public view returns (bool)
```

### onlyValidConsumer

```solidity
modifier onlyValidConsumer(uint64 _subId, address _consumer)
```

### fulfillRandomWords

```solidity
function fulfillRandomWords(uint256 _requestId, address _consumer) external
```

fulfillRandomWords fulfills the given request, sending the random words to the supplied
consumer.

_This mock uses a simplified formula for calculating payment amount and gas usage, and does
not account for all edge cases handled in the real VRF coordinator. When making requests
against the real coordinator a small amount of additional LINK is required._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _requestId | uint256 | the request to fulfill |
| _consumer | address | the VRF randomness consumer to send the result to |

### fulfillRandomWordsWithOverride

```solidity
function fulfillRandomWordsWithOverride(uint256 _requestId, address _consumer, uint256[] _words) public
```

fulfillRandomWordsWithOverride allows the user to pass in their own random words.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _requestId | uint256 | the request to fulfill |
| _consumer | address | the VRF randomness consumer to send the result to |
| _words | uint256[] | user-provided random words |

### fundSubscription

```solidity
function fundSubscription(uint64 _subId, uint96 _amount) public
```

fundSubscription allows funding a subscription with an arbitrary amount for testing.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _subId | uint64 | the subscription to fund |
| _amount | uint96 | the amount to fund |

### requestRandomWords

```solidity
function requestRandomWords(bytes32 _keyHash, uint64 _subId, uint16 _minimumRequestConfirmations, uint32 _callbackGasLimit, uint32 _numWords) external returns (uint256)
```

### createSubscription

```solidity
function createSubscription() external returns (uint64 _subId)
```

Create a VRF subscription.

_You can manage the consumer set dynamically with addConsumer/removeConsumer.
Note to fund the subscription, use transferAndCall. For example
 LINKTOKEN.transferAndCall(
   address(COORDINATOR),
   amount,
   abi.encode(subId));_

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| _subId | uint64 |  |

### getSubscription

```solidity
function getSubscription(uint64 _subId) external view returns (uint96 balance, uint64 reqCount, address owner, address[] consumers)
```

### cancelSubscription

```solidity
function cancelSubscription(uint64 _subId, address _to) external
```

### onlySubOwner

```solidity
modifier onlySubOwner(uint64 _subId)
```

### getRequestConfig

```solidity
function getRequestConfig() external pure returns (uint16, uint32, bytes32[])
```

Get configuration relevant for making requests

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint16 | minimumRequestConfirmations global min for request confirmations |
| [1] | uint32 | maxGasLimit global max for request gas limit |
| [2] | bytes32[] | s_provingKeyHashes list of registered key hashes |

### addConsumer

```solidity
function addConsumer(uint64 _subId, address _consumer) external
```

### removeConsumer

```solidity
function removeConsumer(uint64 _subId, address _consumer) external
```

### getConfig

```solidity
function getConfig() external view returns (uint16 minimumRequestConfirmations, uint32 maxGasLimit, uint32 stalenessSeconds, uint32 gasAfterPaymentCalculation)
```

### getFeeConfig

```solidity
function getFeeConfig() external view returns (uint32 fulfillmentFlatFeeLinkPPMTier1, uint32 fulfillmentFlatFeeLinkPPMTier2, uint32 fulfillmentFlatFeeLinkPPMTier3, uint32 fulfillmentFlatFeeLinkPPMTier4, uint32 fulfillmentFlatFeeLinkPPMTier5, uint24 reqsForTier2, uint24 reqsForTier3, uint24 reqsForTier4, uint24 reqsForTier5)
```

### getFallbackWeiPerUnitLink

```solidity
function getFallbackWeiPerUnitLink() external view returns (int256)
```

### requestSubscriptionOwnerTransfer

```solidity
function requestSubscriptionOwnerTransfer(uint64 _subId, address _newOwner) external pure
```

### acceptSubscriptionOwnerTransfer

```solidity
function acceptSubscriptionOwnerTransfer(uint64 _subId) external pure
```

### pendingRequestExists

```solidity
function pendingRequestExists(uint64 subId) public view returns (bool)
```

