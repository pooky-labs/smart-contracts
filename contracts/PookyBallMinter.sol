// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./interfaces/IPookyBall.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {BallRarity, MintTemplate, MintRandomRequest} from "./types/DataTypes.sol";

contract PookyBallMinter is OwnableUpgradeable {

    IPookyBall public pookyBall;

    uint256 public lastMintTemplateId;
    mapping(uint256 => MintTemplate) public mintTemplates;

    uint256 lastMintRandomRequests; // TODO: this is just mock for VRF, will not use later
    mapping(uint256 => MintRandomRequest) public mintRandomRequests;

    event CreateMintTemplate(uint256 indexed templateId); // TODO: add more parameters?
    event SetMintTemplateCanMint(uint256 indexed templateId, bool canMint);
    event MintFromTemplate(uint256 indexed templateId, address indexed user);

    function initialize() public initializer {
        __Ownable_init();
    }

    function setPookyBallContract(address pookyBallAddress) external onlyOwner {
        pookyBall = IPookyBall(pookyBallAddress);
    }

    function createMintTemplate(MintTemplate memory newMintTemplate) external onlyOwner returns(uint256) {
        lastMintTemplateId++;
        mintTemplates[lastMintTemplateId] = newMintTemplate;
        emit CreateMintTemplate(lastMintTemplateId);
        return lastMintTemplateId;
    }

    function changeMintTemplateCanMint(uint256 mintTemplateId, bool _canMint) external onlyOwner {
        mintTemplates[mintTemplateId].canMint = _canMint;
        emit SetMintTemplateCanMint(mintTemplateId, _canMint);
    }

    function mintFromTemplate(uint256 mintTemplateId) external {
        MintTemplate storage template = mintTemplates[mintTemplateId];
        require(template.canMint == true, "E");
        require(template.currentMints < template.maxMints, "E");
        
        template.currentMints++;
        IERC20(template.payingToken).transferFrom(msg.sender, address(this), template.price);

        // TODO: check if to send directly to user, or only when random is received
        // uint256 newBallId = pookyBall.mintWithRarity(msg.sender, template.rarity);
        uint256 newBallId = pookyBall.mintWithRarity(address(this), template.rarity);

        emit MintFromTemplate(mintTemplateId, msg.sender);

        _requestRandomEntropyForMint(msg.sender, newBallId);
    }

    function _requestRandomEntropyForMint(address user, uint256 ballId) internal {
        lastMintRandomRequests++; // TODO: mocked VRF
        mintRandomRequests[lastMintRandomRequests] = MintRandomRequest(user, ballId);

        _receiveRandomEntropyForMint(lastMintRandomRequests, keccak256(abi.encodePacked(user, ballId))); // TODO: mocked VRF
    }

    function _receiveRandomEntropyForMint(uint256 randomRequestId, bytes32 randomEntropy) internal {
        MintRandomRequest storage request = mintRandomRequests[randomRequestId];
        pookyBall.setRandomEntropy(request.ballId, randomEntropy);
        
        IERC721(address(pookyBall)).transferFrom(address(this), request.user, request.ballId);
    }

}