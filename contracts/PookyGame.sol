// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./interfaces/IPookyBall.sol";
import "./interfaces/IPook.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {Signature, BallUpdates, BallInfo, BallRarity} from "./types/DataTypes.sol";
import {Errors} from './types/Errors.sol';

contract PookyGame is OwnableUpgradeable {

    IPookyBall public pookyBall;
    address public pookySigner;

    IPook public pookToken;

    uint256[] public levelPxpNeeded;
    uint256[] public levelCost;
    mapping(BallRarity => uint256) maxBallLevelPerRarity;

    function initialize() public initializer {
        __Ownable_init();
        
        _setLevelPxpNeeded();
        _setLevelCost();
        _setMaxBallLevel();
    }

    // TODO: put correct values
    function _setLevelPxpNeeded() internal {
        levelPxpNeeded.push(0); // level 0
        levelPxpNeeded.push(3 ether); // level 1
        for(uint256 i=2; i<=100; i++) {
            levelPxpNeeded.push( (levelPxpNeeded[i-1] * 120) / 100 );
        }
    }

    // TODO: put correct values
    function _setLevelCost() internal {
        for(uint256 i=0; i<100; i++) {
            levelCost.push( levelPxpNeeded[i] / 3 );
        }
    }

    // TODO: put correct values
    function _setMaxBallLevel() internal {
        maxBallLevelPerRarity[BallRarity.Uncommon] = 40;
        maxBallLevelPerRarity[BallRarity.Rare] = 60;
        maxBallLevelPerRarity[BallRarity.Epic] = 80;
        maxBallLevelPerRarity[BallRarity.Legendary] = 100;
        maxBallLevelPerRarity[BallRarity.Mythic] = 100;
    }

    function setPookyBallContract(address pookyBallAddress) external onlyOwner {
        pookyBall = IPookyBall(pookyBallAddress);
    }

    function setPookySigner(address _pookySigner) external onlyOwner {
        pookySigner = _pookySigner;
    }

    function setPookToken(address _pookToken) external onlyOwner {
        pookToken = IPook(_pookToken);
    }

    function verifySignature(bytes memory message, Signature memory sig, address sigWalletCheck) private pure returns (bool) {
        bytes32 messageHash = keccak256(message);
        bytes32 signedMessageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        address signer = ecrecover(signedMessageHash, sig._v, sig._r, sig._s);
        return signer == sigWalletCheck;
    }

    function levelUp(uint256 ballId) public {
        require(IERC721(address(pookyBall)).ownerOf(ballId) == msg.sender, Errors.MUST_BE_OWNER);

        BallInfo memory ball = pookyBall.getBallInfo(ballId);
        require(ball.pxp > levelPxpNeeded[ball.level+1], Errors.NOT_ENOUGH_PXP);
        require(ball.level < maxBallLevelPerRarity[ball.rarity], Errors.MAX_LEVEL_REACHED);

        IERC20(address(pookToken)).transferFrom(msg.sender, address(this), levelCost[ball.level + 1]);

        pookyBall.changeBallLevel(ballId, ball.level+1);
    }

    function matchweekClaim(
        uint256 pookAmount, 
        BallUpdates[] calldata ballUpdates,
        uint256 ttl,
        Signature memory sig
    ) external {
        require(verifySignature(abi.encode(pookAmount, ballUpdates, ttl), sig, pookySigner), Errors.FALSE_SIGNATURE);
        require(block.timestamp < ttl, Errors.TTL_PASSED);
        
        pookToken.mint(msg.sender, pookAmount);

        for(uint256 i=0; i<ballUpdates.length; i++) {
            pookyBall.addBallPxp(ballUpdates[i].ballId, ballUpdates[i].addPxp);
            if (ballUpdates[i].toLevelUp) {
                levelUp(ballUpdates[i].ballId);
            }
        }
    }  
}