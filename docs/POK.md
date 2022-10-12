# Solidity API

## TransfersDisabled

```solidity
error TransfersDisabled()
```

## POK

POK is ERC20 token used inside of the game.
Mintable by other Pooky game contracts.
$POK is soul-bounded during first gaming phase, where the Pooky team will balance the rewards.
Transfers will later be enabled by the Pooky team.

_Roles:
- DEFAULT_ADMIN_ROLE can add/remove roles, can enable/disable token transfers.
- POOKY_CONTRACT role can mint new tokens, can receive/send tokens while transfers are disabled._

### POOKY_CONTRACT

```solidity
bytes32 POOKY_CONTRACT
```

### transferEnabled

```solidity
bool transferEnabled
```

### SetTransferEnabled

```solidity
event SetTransferEnabled(bool transferEnabled)
```

### initialize

```solidity
function initialize(string _name, string _symbol, address _admin) public
```

### mint

```solidity
function mint(address to, uint256 amount) external
```

Mint an arbitrary amount of $POK to an account.

_Requirements:
- only POOKY_CONTRACT role can mint $POK tokens_

### burn

```solidity
function burn(address from, uint256 amount) external
```

Burn an arbitrary amount of $POK of an account.

_Requirements:
- only POOKY_CONTRACT role can mint $POK tokens_

### setTransferEnabled

```solidity
function setTransferEnabled(bool _transferEnabled) external
```

Enable/disable transfers of $POK tokens between users.

_Requirements:
- only POOKY_CONTRACT role can mint $POK tokens_

### _beforeTokenTransfer

```solidity
function _beforeTokenTransfer(address from, address to, uint256) internal view
```

_Restrict the $POK transfers between accounts.
- Do not allow transfer between users if they are disabled, see {POK-setTransferEnabled}.
- Mints and burns are always allowed.
- POOKY_CONTRACT can always send and receive tokens._

