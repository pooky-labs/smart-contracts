// SPDX-License-Identifier: agpl-3.0
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
    bytes32 randomEntropy;
    uint256 level;
    uint256 pxp;
    bool canBreed;
    uint256 cardSlots;
    uint256[] cards;
}

struct MintTemplate {
    bool canMint;
    BallRarity rarity;
    uint256 maxMints;
    uint256 currentMints;
    uint256 price;
    address payingToken;
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



