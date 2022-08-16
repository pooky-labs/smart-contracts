// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.9;

library Errors {
    string public constant ONLY_POOKY_CONTRACTS = '1'; // msg.sender must be pooky contract
    string public constant TOKEN_DOESNT_EXIST = '2'; // token id must exist
    string public constant MINTING_DISABLED = '3'; // mintin is disabled in minting template
    string public constant MAX_MINTS_REACHED = '4'; // maximum numbers of mints reached
    string public constant MUST_BE_OWNER = '5'; // msg.sender must be owner of the token 
    string public constant NOT_ENOUGH_PXP = '6'; // ball doesn't have enough pxp for next level
    string public constant MAX_LEVEL_REACHED = '7'; // ball maximum level is reached
    string public constant FALSE_SIGNATURE ='8'; // signature from the backend wallet is not correct
    string public constant TTL_PASSED = '9'; // "time to live" of signature passed
}
