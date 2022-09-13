// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./interfaces/IPookyBall.sol";
import "./interfaces/IPOK.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {Signature, BallUpdates, BallInfo, BallRarity} from "./types/DataTypes.sol";
import {Errors} from './types/Errors.sol';

/**
 * @notice PookyGame is contract used from the game. 
 * @notice   Contains function to update ball points after the matchweek and level up balls.
 *
 * @notice Roles:
 * @notice   owner role can set contract parameters
 */
contract PookyGame is OwnableUpgradeable {

    IPookyBall public pookyBall;
    address public pookySigner;
    mapping(uint256 => bool) usedNonce;

    IPOK public pookToken;

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
    /**
     * @dev internal function used in initialization to set pxp points 
     * @dev   which is needed for ball to get to the each level
     */
    function _setLevelPxpNeeded() internal {
        levelPxpNeeded.push(0); // level 0
        levelPxpNeeded.push(3 ether); // level 1
        for(uint256 i=2; i<=100; i++) {
            levelPxpNeeded.push( (levelPxpNeeded[i-1] * 120) / 100 );
        }
    }

    // TODO: put correct values
    /**
     * @dev internal function used in initialization to set cost of levelling up
     * @dev   the ball for the each level
     */
    function _setLevelCost() internal {
        for(uint256 i=0; i<100; i++) {
            levelCost.push( levelPxpNeeded[i] / 3 );
        }
    }

    // TODO: put correct values
    /**
     * @dev internal function used in initialization to set maximum level of the ball per rarity
     */
    function _setMaxBallLevel() internal {
        maxBallLevelPerRarity[BallRarity.Uncommon] = 40;
        maxBallLevelPerRarity[BallRarity.Rare] = 60;
        maxBallLevelPerRarity[BallRarity.Epic] = 80;
        maxBallLevelPerRarity[BallRarity.Legendary] = 100;
        maxBallLevelPerRarity[BallRarity.Mythic] = 100;
    }

    /** 
     * @notice sets the address of PookyBall contract
     * @notice only owner role can call this function
     */
    function setPookyBallContract(address pookyBallAddress) external onlyOwner {
        pookyBall = IPookyBall(pookyBallAddress);
    }

    /** 
     * @notice sets the address of backend signer
     * @notice only owner role can call this function
     */
    function setPookySigner(address _pookySigner) external onlyOwner {
        pookySigner = _pookySigner;
    }

    /** 
     * @notice sets the address of POK token contract
     * @notice only owner role can call this function
     */
    function setPookToken(address _pookToken) external onlyOwner {
        pookToken = IPOK(_pookToken);
    }

    /**
     * @dev internal library function to verify the signature
     * @dev can be replaced by OZ ECDSA library
     */
    function verifySignature(bytes memory message, Signature memory sig, address sigWalletCheck) private pure returns (bool) {
        bytes32 messageHash = keccak256(message);
        bytes32 signedMessageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        address signer = ecrecover(signedMessageHash, sig._v, sig._r, sig._s);
        return signer == sigWalletCheck;
    }

    /**
     * @notice level up the ball with `ballId`. Must be called by the ball owner.
     * @notice   required amount of POK tokens are paid from the user address.
     */
    function levelUp(uint256 ballId) public {
        require(IERC721(address(pookyBall)).ownerOf(ballId) == msg.sender, Errors.MUST_BE_OWNER);

        BallInfo memory ball = pookyBall.getBallInfo(ballId);
        require(ball.pxp > levelPxpNeeded[ball.level+1], Errors.NOT_ENOUGH_PXP);
        require(ball.level < maxBallLevelPerRarity[ball.rarity], Errors.MAX_LEVEL_REACHED);

        IERC20(address(pookToken)).transferFrom(msg.sender, address(this), levelCost[ball.level + 1]);

        pookyBall.changeBallLevel(ballId, ball.level+1);
    }

    /**
     * @notice Function used to claim rewards after the matchweek. 
     * @notice All parameters must be confirmed by backend and valid signature of them provided.
     * @param pookAmount amount of POK token to reward to the user
     * @param ballUpdates array of BallUpdates struct containing parameters for all balls which should be rewarded points.
     * @param ttl timestamp until signature is valid
     * @param nonce unique nonce send by backend, used to not allow resending the same signature.
     * @param sig structe contain parameters of the ECDSA signature from the backend. Must be signed by `pookySigner`
     */
    function matchweekClaim(
        uint256 pookAmount, 
        BallUpdates[] calldata ballUpdates,
        uint256 ttl,
        uint256 nonce,
        Signature memory sig
    ) external {
        require(verifySignature(abi.encode(pookAmount, ballUpdates, ttl, nonce), sig, pookySigner), Errors.FALSE_SIGNATURE);
        require(!usedNonce[nonce], Errors.USED_NONCE);
        require(block.timestamp < ttl, Errors.TTL_PASSED);

        usedNonce[nonce] = true;
        
        pookToken.mint(msg.sender, pookAmount);

        for(uint256 i=0; i<ballUpdates.length; i++) {
            pookyBall.addBallPxp(ballUpdates[i].ballId, ballUpdates[i].addPxp);
            if (ballUpdates[i].toLevelUp) {
                levelUp(ballUpdates[i].ballId);
            }
        }
    } 
}