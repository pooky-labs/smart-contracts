# Solidity API

## POK

POK is ERC20 token used inside of the game.
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

### \_beforeTokenTransfer

```solidity
function _beforeTokenTransfer(address from, address to, uint256 amount) internal
```

_don't allow transfer if disabled
if transfers are disabled it's still posible to mint/burn tokens,
and send it to, or receive from, pooky game contracts_
