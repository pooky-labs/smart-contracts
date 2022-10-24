// SPDX-License-Identifier: MIT
// Pooky Game Contracts (PookyballMinter.sol)

pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "./interfaces/IPookyball.sol";
import { BallRarity, MintTemplate, MintRandomRequest } from "./types/DataTypes.sol";
import "./vendor/VRFConsumerBaseV2.sol";

/**
 * @title PookyballMinter
 * @author Pooky Engineering Team
 *
 * @notice PookyballMinter contains the game logic related to Pookyball mint.
 * Mints can only be triggers by specifying a MintTemplate id.
 * This contract is the base contract for {PookyMintEvent}, and will be used for the PookyStore.
 *
 * Chainlink VRF requests are used to obtain randomEntropy for the Pookyballs.

 * Roles:
 * - DEFAULT_ADMIN_ROLE can add/remove roles
 * - TECH role can create/change mint templates
 */
abstract contract PookyballMinter is AccessControlUpgradeable, VRFConsumerBaseV2 {
  // Roles
  bytes32 public constant TECH = keccak256("TECH");

  // Contracts
  IPookyball public pookyBall;

  // Chainlink VRF parameters
  VRFCoordinatorV2Interface public vrf_coordinator;
  uint64 public vrf_subscriptionId;
  uint32 public vrf_callbackGasLimit;
  uint16 public vrf_requestConfirmations;
  bytes32 public vrf_keyHash;

  uint256 public lastMintTemplateId;
  mapping(uint256 => MintTemplate) public mintTemplates;
  mapping(uint256 => MintRandomRequest) public mintRandomRequests;

  // MintTemplate events
  event MintTemplateCreated(uint256 indexed templateId);
  event MintTemplateEnabled(uint256 indexed templateId, bool enabled);
  event RequestMintFromTemplate(uint256 indexed templateId, address indexed recipient);

  // Chainlink VRF events
  event RandomnessRequested(uint256 indexed requestId, uint256 indexed tokenId, address indexed recipient);
  event RandomnessFulfilled(uint256 indexed requestId, uint256 indexed tokenId, uint256 randomEntropy);

  error MintDisabled(uint256 templateId);
  error MaximumMintsReached(uint256 templateId, uint256 maximumMints);
  error OnlyVRFCoordinator(address coordinator, address actual);

  /**
   * Initialization function that sets Chainlink VRF parameters.
   */
  function __PookyballMinter_init(
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

    // We have to initialize the VRF parameters without the setter as it requires the deployer to have the TECH role
    vrf_coordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
    vrf_callbackGasLimit = _callbackGasLimit;
    vrf_requestConfirmations = _requestConfirmations;
    vrf_keyHash = _keyHash;
    vrf_subscriptionId = _subscriptionId;
  }

  /**
   * @notice Change the Chainlink VRF parameters.
   * @dev Requirements:
   * - only TECH role can change the Chainlink VRF parameters.
   */
  function setVrfParameters(
    address _coordinator,
    uint64 subscriptionId,
    uint32 callbackGasLimit,
    uint16 requestConfirmations,
    bytes32 keyHash
  ) external onlyRole(TECH) {
    vrf_coordinator = VRFCoordinatorV2Interface(_coordinator);
    vrf_subscriptionId = subscriptionId;
    vrf_callbackGasLimit = callbackGasLimit;
    vrf_requestConfirmations = requestConfirmations;
    vrf_keyHash = keyHash;
  }

  /**
   * @notice Sets the address of the Pookyball contract.
   * @dev Requirements:
   * - only DEFAULT_ADMIN_ROLE role can call this function.
   */
  function setPookyballContract(address _pookyBall) external onlyRole(DEFAULT_ADMIN_ROLE) {
    pookyBall = IPookyball(_pookyBall);
  }

  /**
   * @notice Create a new MintTemplate.
   * @dev Requirements:
   * - only TECH role can create MintTemplates.
   * Emits a MintTemplateCreated event.
   */
  function createMintTemplate(MintTemplate memory newMintTemplate) external onlyRole(TECH) returns (uint256) {
    lastMintTemplateId++;
    mintTemplates[lastMintTemplateId] = newMintTemplate;
    emit MintTemplateCreated(lastMintTemplateId);
    return lastMintTemplateId;
  }

  /**
   * @notice Enable/disable mint for MintTemplate with id `templateId`.
   * @dev Requirements:
   * - only TECH role can create MintTemplates.
   * Emits a MintTemplateEnabled event.
   */
  function enableMintTemplate(uint256 mintTemplateId, bool _enabled) external onlyRole(TECH) {
    mintTemplates[mintTemplateId].enabled = _enabled;
    emit MintTemplateEnabled(mintTemplateId, _enabled);
  }

  /**
   * @dev Internal function that mints a ball to the current contract and that will later be forwarded to {recipient}.
   * After checking all requirements:
   * - MintTemplate is enabled.
   * - MintTemplate maximum mints has not been reached.
   * The random entropy is made to Chainlink VRF platform.
   * Emits a RequestMintFromTemplate event.
   * @param recipient The final recipient of the newly linted Pookyball.
   * @param templateId The MintTemplate id.
   */
  function _requestMintFromTemplate(address recipient, uint256 templateId) internal {
    MintTemplate storage template = mintTemplates[templateId];

    if (!template.enabled) {
      revert MintDisabled(templateId);
    }

    if (template.currentMints >= template.maxMints) {
      revert MaximumMintsReached(templateId, template.maxMints);
    }

    template.currentMints++;
    uint256 newTokenId = pookyBall.mint(address(this), template.rarity, template.luxury);

    emit RequestMintFromTemplate(templateId, recipient);
    _requestRandomEntropyForMint(recipient, newTokenId);
  }

  /**
   * @dev Internal function used to request random entropy from the Chainlink VRF.
   * Emits a RandomnessRequested event.
   */
  function _requestRandomEntropyForMint(address recipient, uint256 tokenId) internal {
    uint256 requestId = vrf_coordinator.requestRandomWords(
      vrf_keyHash,
      vrf_subscriptionId,
      vrf_requestConfirmations,
      vrf_callbackGasLimit,
      1 // Only one word is required
    );

    mintRandomRequests[requestId] = MintRandomRequest(recipient, tokenId);
    emit RandomnessRequested(requestId, tokenId, recipient);
  }

  /**
   * @dev Handle randomness response from Chainlink VRF coordinator.
   * Since only 1 word is requested in {_requestRandomEntropyForMint}, only first received number is used to set the
   * Pookyball random entropy.
   * Emits a RandomnessFulfilled event.
   */
  function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
    MintRandomRequest storage request = mintRandomRequests[requestId];

    pookyBall.setRandomEntropy(request.tokenId, randomWords[0]);
    pookyBall.transferFrom(address(this), request.recipient, request.tokenId);

    emit RandomnessFulfilled(requestId, request.tokenId, randomWords[0]);
  }

  /**
   * @notice Called by the Chainlink VRF coordinator when fulfilling random words.
   * @dev Requirements:
   * - Only vrf_coordinator can call this function.
   */
  function rawFulfillRandomWords(uint256 requestId, uint256[] memory randomWords) external override {
    if (msg.sender != address(vrf_coordinator)) {
      revert OnlyVRFCoordinator(address(vrf_coordinator), msg.sender);
    }

    fulfillRandomWords(requestId, randomWords);
  }
}