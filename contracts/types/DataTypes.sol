// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

enum BallRarity {
    Uncommon,
    Rare,
    Epic,
    Legendary,
    Mythic
}

struct BallInfo {
    BallRarity rarity;
    uint256 randomEntropy;
    uint256 level;
    uint256 pxp;
    bool canBreed;
    uint256 cardSlots;
    uint256[] cards;
    uint256 revokableUntilTimestamp;
}

struct MintTemplate {
    bool canMint;
    BallRarity rarity;
    uint256 maxMints;
    uint256 currentMints;
    uint256 price;
    address payingToken; // 0x0 for native
}

struct MintRandomRequest {
    address user;
    uint256 ballId;
}

struct BallUpdates {
    uint256 ballId;
    uint256 addPxp;
    bool toLevelUp;
}

struct Signature {
    uint8 _v;
    bytes32 _r; 
    bytes32 _s;
}



