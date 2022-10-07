// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import '@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import '@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol';
import './interfaces/IPookyBall.sol';
import { BallRarity, MintTemplate, MintRandomRequest } from './types/DataTypes.sol';
import { Errors } from './types/Errors.sol';
import './vendor/VRFConsumerBaseV2.sol';

/**
 * @notice PookyBallMinter is contract for minting balls with defined MintTemplates.
 * @notice   This contract is the base contract for PookyMintEvent, and will be used
 * @notice   for the PookyStore.
 * @notice Contract is using Chainlink VRF requests to get randomEntropy for the ball.
 * @notice
 *
 * @notice Roles:
 * @notice   DEFAULT_ADMIN_ROLE can add/remove roles
 * @notice   MOD role can create/change mint templates
 */
contract PookyBallMinter is AccessControlUpgradeable, VRFConsumerBaseV2 {
  IPookyBall public pookyBall;

  bytes32 public constant MOD = keccak256('MOD');

  /* VRF */
  VRFCoordinatorV2Interface public vrf_coordinator;
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

    vrf_coordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
    vrf_callbackGasLimit = _callbackGasLimit;
    vrf_requestConfirmations = _requestConfirmations;
    vrf_keyHash = _keyHash;
    vrf_subscriptionId = _subscriptionId;
  }

  /**
   * @notice sets the configuration for chainlink vrf
   * @notice only MOD role can call this function
   */
  function setVrfParameters(
    address _coordinator,
    uint64 subscriptionId,
    uint32 callbackGasLimit,
    uint16 requestConfirmation,
    bytes32 keyHash
  ) external onlyRole(MOD) {
    vrf_coordinator = VRFCoordinatorV2Interface(_coordinator);
    vrf_subscriptionId = subscriptionId;
    vrf_callbackGasLimit = callbackGasLimit;
    vrf_requestConfirmations = requestConfirmation;
    vrf_keyHash = keyHash;
  }

  /**
   * @dev sets the address of PookyBall contract
   * @dev only DEFAULT_ADMIN_ROLE role can call this function
   */
  function setPookyBallContract(address pookyBallAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
    pookyBall = IPookyBall(pookyBallAddress);
  }

  /**
   * @notice creates the new mint template with `newMintTemplate` parameters
   * @notice only MOD role can call this function
   * @notice emits event CreateMintTemplate
   */
  function createMintTemplate(MintTemplate memory newMintTemplate) external onlyRole(MOD) returns (uint256) {
    lastMintTemplateId++;
    mintTemplates[lastMintTemplateId] = newMintTemplate;
    emit CreateMintTemplate(lastMintTemplateId);
    return lastMintTemplateId;
  }

  /**
   * @notice change if tokens can be minted using minting template with id `mintTemplateId`
   * @notice only MOD role can call this function
   * @notice emits event SetMintTemplateCanMint
   */
  function changeMintTemplateCanMint(uint256 mintTemplateId, bool _canMint) external onlyRole(MOD) {
    mintTemplates[mintTemplateId].canMint = _canMint;
    emit SetMintTemplateCanMint(mintTemplateId, _canMint);
  }

  /**
   * @dev internal function used to request new mint for the address `user`, using mint template `mintTemplateId`
   * @dev  and the ball will be revokable until `revokableUntilTimestamp`.
   * @dev function does all the checks, and requests random entropy from the Chainlink VRF.
   * @notice emits events RequestMintFromTemplate and  RandomnessRequested
   */
  function _requestMintFromTemplate(
    address user,
    uint256 mintTemplateId,
    uint256 revokableUntilTimestamp
  ) internal {
    MintTemplate storage template = mintTemplates[mintTemplateId];
    require(template.canMint == true, Errors.MINTING_DISABLED);
    require(template.currentMints < template.maxMints, Errors.MAX_MINTS_REACHED);

    template.currentMints++;
    uint256 newBallId = pookyBall.mintWithRarityAndRevokableTimestamp(
      address(this),
      template.rarity,
      revokableUntilTimestamp
    );

    emit RequestMintFromTemplate(mintTemplateId, user);

    _requestRandomEntropyForMint(user, newBallId);
  }

  /**
   * @dev internal function used to request random entropy from the Chainilnk VRF
   * @notice emits event RandomnessRequested
   */
  function _requestRandomEntropyForMint(address user, uint256 ballId) internal {
    uint256 requestId = vrf_coordinator.requestRandomWords(
      vrf_keyHash,
      vrf_subscriptionId,
      vrf_requestConfirmations,
      vrf_callbackGasLimit,
      1
    );

    mintRandomRequests[requestId] = MintRandomRequest(user, ballId);
    emit RandomnessRequested(requestId, user, ballId);
  }

  /**
   * @dev this function is used in the response from Chainlink
   * @dev we are using only first received number to set ball random entropy.
   * @param requestId id of the sent request
   * @param randomWords received random wards.
   * @notice emits event RandomnessFullfiled
   */
  function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
    MintRandomRequest storage request = mintRandomRequests[requestId];

    pookyBall.setRandomEntropy(request.ballId, randomWords[0]);
    IERC721(address(pookyBall)).transferFrom(address(this), request.user, request.ballId);

    emit RandomnessFullfiled(requestId, request.ballId, randomWords[0]);
  }

  function rawFulfillRandomWords(uint256 requestId, uint256[] memory randomWords) external override {
    require(msg.sender == address(vrf_coordinator), Errors.ONLY_VRF_COORDINATOR);
    fulfillRandomWords(requestId, randomWords);
  }
}
