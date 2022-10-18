# Solidity API

## VRFConsumerBaseV2

---

Interface for contracts using VRF randomness

---

\_PURPOSE

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

---

USAGE

Calling contracts must inherit from VRFConsumerBase, and can
initialize VRFConsumerBase's attributes in their constructor as
shown:

contract VRFConsumer {
constructor(<other arguments>, address \_vrfCoordinator, address \_link)
VRFConsumerBase(\_vrfCoordinator) public {
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

---

SECURITY CONSIDERATIONS

A method with the ability to call your fulfillRandomness method directly
could spoof a VRF response with any random value, so it's critical that
it cannot be directly called by anything other than this base contract
(specifically, by the VRFConsumerBase.rawFulfillRandomness method).

For your users to trust that your contract's random behavior is free
from malicious interference, it's best if you can write it so that all
behaviors implied by a VRF response are executed _during_ your
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
call is mixed into the input to the VRF _last_, a sufficiently powerful
miner could, in principle, fork the blockchain to evict the block
containing the request, forcing the request to be included in a
different block with a different hash, and therefore a different input
to the VRF. However, such an attack would incur a substantial economic
cost. This cost scales with the number of blocks the VRF oracle waits
until it calls responds to a request. It is for this reason that
that you can signal to an oracle you'd like them to wait longer before
responding to the request (however this is not enforced in the contract
and so remains effective only in the case of unmodified oracle software).\_

### OnlyCoordinatorCanFulfill

```solidity
error OnlyCoordinatorCanFulfill(address have, address want)
```

### vrfCoordinator

```solidity
address vrfCoordinator
```

### \_\_VRFConsumerBaseV2_init

```solidity
function __VRFConsumerBaseV2_init(address _vrfCoordinator) internal
```

#### Parameters

| Name             | Type    | Description                        |
| ---------------- | ------- | ---------------------------------- |
| \_vrfCoordinator | address | address of VRFCoordinator contract |

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

#### Parameters

| Name        | Type      | Description                                              |
| ----------- | --------- | -------------------------------------------------------- |
| requestId   | uint256   | The Id initially returned by requestRandomness           |
| randomWords | uint256[] | the VRF output expanded to the requested number of words |

### rawFulfillRandomWords

```solidity
function rawFulfillRandomWords(uint256 requestId, uint256[] randomWords) external virtual
```
