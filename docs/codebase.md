# Codebase

## General rules

### NatSpec

NatSpec MUST be written using the triple slash `///` syntax.

Contract header of the source code must at least include:

```solidity
/// @title MyContract
/// @author Author1, Author2 for Pooky Labs Ltd.
```

If contract includes `@notice` or `@dev` section, a blank line MUST be inserted after the `@title` and `@author` tags.

```solidity
/// @title MyContract
/// @author Author1, Author2 for Pooky Labs Ltd.
///
/// @notice Hello world
/// @dev This is me
```

### Imports

Imports MUST use the explicit bracket syntax:

```solidity
// Good
import { ERC721A } from "ERC721A/ERC721.sol":

// Bad
import "ERC721A/ERC721.sol":
```

Imports MUST be sorted with the following rules:

1. First group: vendor dependencies
2. Source code (imports starting with `@/`)
3. Test code (imports starting with `@test/`)
4. Script code (imports starting with `@script/`)

## Contract updates

Contracts that have already been deployed to mainnet **MUST NOT be updated**.

A few exceptions to this rules:

- Comments and/or documentation update
- File/directory architecture changes
- Imports path updates
- Syntactic and/or grammar typos
