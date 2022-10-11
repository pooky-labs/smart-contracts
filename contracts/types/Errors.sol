// SPDX-License-Identifier: UNLICENSED
// Pooky Game Contracts (types/Errors.sol)

pragma solidity ^0.8.9;

// TODO: separate by contracts
/**
 * @notice Errors used in require statements.
 */
library Errors {
  string public constant ONLY_POOKY_CONTRACTS = '1'; // msg.sender must be pooky contract
  string public constant TOKEN_NOT_FOUND = '2'; // token id must exist
  string public constant MINTING_DISABLED = '3'; // mintin is disabled in minting template
  string public constant MAX_MINTS_REACHED = '4'; // maximum numbers of mints reached
  string public constant MUST_BE_OWNER = '5'; // msg.sender must be owner of the token
  string public constant NOT_ENOUGH_PXP = '6'; // ball doesn't have enough pxp for next level
  string public constant MAX_LEVEL_REACHED = '7'; // ball maximum level is reached
  string public constant FALSE_SIGNATURE = '8'; // signature from the backend wallet is not correct
  string public constant TTL_PASSED = '9'; // "time to live" of signature passed
  string public constant USED_NONCE = '10'; // same nonce already used
  string public constant POK_TRANSFER_NOT_ENABLED = '11'; // transferring POK is not enabled
  string public constant REVOCABLE_TIMESTAMP_PASSED = '12'; // time for revoking passed
  string public constant CANT_TRANSFER_WHILE_REVOCABLE = '13'; // ball can't be transffered while it's still revocable
  string public constant ONLY_MOD = '14'; // only moderator can call
  string public constant MAX_MINTS_USER_REACHED = '15'; // maximum number of mints for user reached
  string public constant MSG_VALUE_SMALL = '16'; // user didn't send enough native tokens
  string public constant TREASURY_TRANSFER_FAIL = '17'; // failed transfer to treasury wallet
  string public constant NEEDS_BIGGER_TIER = '18'; // user's tier still can't buy
  string public constant MAX_MINT_SUPPLY_REACHED = '19'; // max minting supply reached
  string public constant ONLY_VRF_COORDINATOR = '20'; // only vrf coordinator can call the contract
  string public constant BALL_ENTROPY_ALREADY_SET = '21'; // ball entropy was already set
  string public constant SIZE_MISMATCH = '22'; // argument size mismatch
}
