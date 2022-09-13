// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./interfaces/IPookyBall.sol";
import "./PookyBallMinter.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {BallRarity, MintTemplate, MintRandomRequest} from "./types/DataTypes.sol";
import {Errors} from './types/Errors.sol';

/**
 * @notice PookyMintEvent contract is the extension of PookyBallMinter, used only for initial minting event.
 * @notice Before minting starts, templates with different rarities should be made
 * @notice  using function from the base PookyBallMinter contract
 *
 * @notice Roles:
 * @notice   DEFAULT_ADMIN_ROLE can add/remove roles
 * @notice   BE role represents backend which can mint to the user address
 */
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

    /** 
     * @notice sets the tier of `_address` to the `_tier`
     * @notice only MOD role can call this function
     */
    function setAddressTier(address _address, uint256 _tier) external onlyRole(MOD) {
        userTiers[_address] = _tier;
        emit UserTierSet(_address, _tier);
    }

    /** 
     * @notice sets the minimum tier requiered to be able to mint to `_minTierToBuy`
     * @notice only MOD role can call this function
     */
    function setMinTierToBuy(uint256 _minTierToBuy) external onlyRole(MOD) {
        minTierToBuy = _minTierToBuy;
    }

    /** 
     * @notice sets the maximum number of mintable balls per address to `_maxBallsPerUser`
     * @notice only MOD role can call this function
     */
    function setMaxBallsPerUser(uint256 _maxBallsPerUser) external onlyRole(MOD) {
        maxBallsPerUser = _maxBallsPerUser;
    }

    /**
     * @notice sets revoke period to `_revokePeriod`
     * only MOD role can call this function
     */
    function setRevokePeriod(uint256 _revokePeriod) external onlyRole(MOD) {
        revokePeriod = _revokePeriod;
    }

    /**
     * @return retunrs number of the avilable mints left to the address `user`
     */
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

    /**
     * @notice function called by backend to mint `numberOfBalls` balls to the address `user` with 
     * @notice   template id `templateId`. 
     * @notice This function is used when the user paid offchain for the balls.
     * @notice Revoke period is set if there is dispute in the payment during this period.
     * @notice only BE role can call this function
     */
    function mintBallsAuthorized(address user, uint256 numberOfBalls, uint256 templateId) external onlyRole(BE) {
        _mintBalls(user, numberOfBalls, templateId, block.timestamp + revokePeriod);
    }

    /**
     * @notice function called by backend to revoke the ball.
     * @notice This function is used when there is dispute in the payment.
     * @notice only BE role can call this function
     */
    function revokeBallAuthorized(uint256 ballId) external onlyRole(BE) {
        pookyBall.revokeBall(ballId);
    }

    /**
     * @notice function callable by users to mint 
     */
    function mintBalls(uint256 numberOfBalls, uint256 templateId) external payable {

        uint256 totalPrice = mintTemplates[templateId].price * numberOfBalls;
        require(msg.value >= totalPrice, Errors.MSG_VALUE_SMALL);

        _mintBalls(msg.sender, numberOfBalls, templateId, 0);

        (bool sent, bytes memory data) = treasuryWallet.call{value: msg.value}("");
        require(sent, Errors.TREASURY_TRANSFER_FAIL);
    }

}