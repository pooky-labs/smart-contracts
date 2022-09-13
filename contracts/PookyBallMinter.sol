// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./interfaces/IPookyBall.sol";
import "./VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import {BallRarity, MintTemplate, MintRandomRequest} from "./types/DataTypes.sol";
import {Errors} from './types/Errors.sol';

contract PookyBallMinter is AccessControlUpgradeable, VRFConsumerBaseV2 {

    IPookyBall public pookyBall;

    bytes32 public constant MOD = keccak256("MOD");

    /* VRF */
    VRFCoordinatorV2Interface public VRF_COORDINATOR;
    uint64 public vrf_subscriptionId;
    uint32 public vrf_callbackGasLimit;
    uint16 public vrf_requestConfirmations;
    bytes32 public vrf_keyHash;

    uint256 public lastMintTemplateId;
    mapping(uint256 => MintTemplate) public mintTemplates;

    mapping(uint256 => MintRandomRequest) public mintRandomRequests;

    event CreateMintTemplate(uint256 indexed templateId); // TODO: add more parameters?
    event SetMintTemplateCanMint(uint256 indexed templateId, bool canMint);
    event RequestMintFromTemplate(uint256 indexed templateId, address indexed user);

    event RandomnessRequested(uint256 indexed requestId, address indexed user, uint256 indexed ballId);
    event RandomnessFullfiled(uint256 indexed requestId, uint256 indexed ballId, uint256 randomEntropy);

    function __PookyBallMinter_init(
        uint256 _startFromId,
        address _admin,
        address _vrfCoordinator,
        uint32 _callbackGasLimit,
        uint16 _requestConfirmations,
        bytes32 _keyHash,
        uint64 _subscriptionId
    ) public initializer {
        __AccessControl_init();
        lastMintTemplateId = _startFromId - 1;
        _setupRole(DEFAULT_ADMIN_ROLE, _admin);

        __VRFConsumerBaseV2_init(_vrfCoordinator);

        vrf_callbackGasLimit = _callbackGasLimit;
        vrf_requestConfirmations = _requestConfirmations;
        vrf_keyHash = _keyHash;

        VRF_COORDINATOR = VRFCoordinatorV2Interface(_vrfCoordinator);
        vrf_subscriptionId = _subscriptionId;
    }

    function setPookyBallContract(address pookyBallAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        pookyBall = IPookyBall(pookyBallAddress);
    }

    function createMintTemplate(MintTemplate memory newMintTemplate) external onlyRole(MOD) returns(uint256) {
        lastMintTemplateId++;
        mintTemplates[lastMintTemplateId] = newMintTemplate;
        emit CreateMintTemplate(lastMintTemplateId);
        return lastMintTemplateId;
    }

    function changeMintTemplateCanMint(uint256 mintTemplateId, bool _canMint) external onlyRole(MOD) {
        mintTemplates[mintTemplateId].canMint = _canMint;
        emit SetMintTemplateCanMint(mintTemplateId, _canMint);
    }

    function _requestMintFromTemplate(address user, uint256 mintTemplateId, uint256 revokableUntilTimestamp) internal {
        MintTemplate storage template = mintTemplates[mintTemplateId];
        require(template.canMint == true, Errors.MINTING_DISABLED);
        require(template.currentMints < template.maxMints, Errors.MAX_MINTS_REACHED);

        template.currentMints++;
        uint256 newBallId = pookyBall.mintWithRarityAndRevokableTimestamp(user, template.rarity, revokableUntilTimestamp);

        emit RequestMintFromTemplate(mintTemplateId, user);

        _requestRandomEntropyForMint(user, newBallId);
    }

    function _requestRandomEntropyForMint(address user, uint256 ballId) internal {

        uint256 requestId = VRF_COORDINATOR.requestRandomWords(
            vrf_keyHash,
            vrf_subscriptionId,
            vrf_requestConfirmations,
            vrf_callbackGasLimit,
            1
        );

        mintRandomRequests[requestId] = MintRandomRequest(user, ballId);
        emit RandomnessRequested(requestId, user, ballId);
    }

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        MintRandomRequest storage request = mintRandomRequests[requestId];

        pookyBall.setRandomEntropy(request.ballId, randomWords[0]);
        IERC721(address(pookyBall)).transferFrom(address(this), request.user, request.ballId);

        emit RandomnessFullfiled(requestId, request.ballId, randomWords[0]);
    }
}