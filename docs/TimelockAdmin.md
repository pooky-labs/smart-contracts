# Solidity API

## TimelockAdmin

This contract will be used as ProxyAdmin on proxy contracts
and as DEFAULT_ADMIN_ROLE in implementation contracts.
It's standard OpenZepellin implementation of Timelock contract in which
each action needs to be proposed and waited for `minDelay` time until exectued.

`proposers` will be set to Pooky Tech Team multisig wallet and Pooky Executives Team multisig.
`executors` will be only Pooky Executives Team multisig.

### constructor

```solidity
constructor(uint256 minDelay, address[] proposers, address[] executors) public
```

