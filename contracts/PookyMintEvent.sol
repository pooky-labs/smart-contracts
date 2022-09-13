// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./interfaces/IPookyBall.sol";
import "./PookyBallMinter.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {BallRarity, MintTemplate, MintRandomRequest} from "./types/DataTypes.sol";
import {Errors} from './types/Errors.sol';

contract PookyMintEvent is PookyBallMinter {

    // bigger number is better tier; TODO: change in spec
    mapping(address => uint256) public userTiers;
    uint256 public minTierToBuy;
    uint256 public maxBallsPerUser;
    mapping(address => uint256) userBallsMinted;

    uint256 public ballsMinted;
    uint256 public maxMintSupply;

    uint256 public revokePeriod;
    address public treasuryWallet;

    event UserTierSet(address indexed user, uint256 tier);

    bytes32 public constant BE = keccak256("BE");

    function initialize(
        uint256 _startFromId,
        address _admin,
        address _treasuryWallet,
        uint256 _maxMintSupply,
        uint256 _maxBallsPerUser,
        uint256 _revokePeriod,
        address _vrfCoordinator,
        uint32 _callbackGasLimit,
        uint16 _requestConfirmations,
        bytes32 _keyHash,
        uint64 _subscriptionId
    ) public initializer {
        treasuryWallet = _treasuryWallet;
        maxMintSupply = _maxMintSupply;
        maxBallsPerUser = _maxBallsPerUser;
        revokePeriod = _revokePeriod;

        __PookyBallMinter_init(
            _startFromId, 
            _admin, 
            _vrfCoordinator, 
            _callbackGasLimit, 
            _requestConfirmations, 
            _keyHash, 
            _subscriptionId
        );
    }

    function setAddressTier(address _address, uint256 _tier) external onlyRole(MOD) {
        userTiers[_address] = _tier;
        emit UserTierSet(_address, _tier);
    }

    function setMinTierToBuy(uint256 _minTierToBuy) external onlyRole(MOD) {
        minTierToBuy = _minTierToBuy;
    }

    function setMaxBallsPerUser(uint256 _maxBallsPerUser) external onlyRole(MOD) {
        maxBallsPerUser = _maxBallsPerUser;
    }

    function setRevokePeriod(uint256 _revokePeriod) external onlyRole(MOD) {
        revokePeriod = _revokePeriod;
    }

    function mintsLeft(address user) public view returns(uint256) {
        return maxBallsPerUser - userBallsMinted[user];
    }

    function _mintBalls(address user, uint256 numberOfBalls, uint256 templateId, uint256 revokeUntilTimestamp) internal {
        require(userTiers[user] >= minTierToBuy, Errors.NEEDS_BIGGER_TIER);
        require(mintsLeft(user) >= numberOfBalls, Errors.MAX_MINTS_USER_REACHED);
        require(ballsMinted + numberOfBalls <= maxMintSupply, Errors.MAX_MINT_SUPPLY_REACHED);

        userBallsMinted[user] += numberOfBalls;
        ballsMinted += numberOfBalls;

        for(uint256 i=0; i < numberOfBalls; i++) {
            _requestMintFromTemplate(user, templateId, revokeUntilTimestamp);
        }
    }

    function mintBallsAuthorized(address user, uint256 numberOfBalls, uint256 templateId) external onlyRole(BE) {
        _mintBalls(user, numberOfBalls, templateId, block.timestamp + revokePeriod);
    }

    function revokeBallAuthorized(uint256 ballId) external onlyRole(BE) {
        pookyBall.revokeBall(ballId);
    }

    function mintBalls(uint256 numberOfBalls, uint256 templateId) external payable {

        uint256 totalPrice = mintTemplates[templateId].price * numberOfBalls;
        require(msg.value >= totalPrice, Errors.MSG_VALUE_SMALL);

        _mintBalls(msg.sender, numberOfBalls, templateId, 0);

        (bool sent, bytes memory data) = treasuryWallet.call{value: msg.value}("");
        require(sent, Errors.TREASURY_TRANSFER_FAIL);
    }

}