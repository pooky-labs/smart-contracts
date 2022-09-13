// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./interfaces/IPookyBall.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {BallInfo,BallRarity} from "./types/DataTypes.sol";
import {Errors} from './types/Errors.sol';

contract PookyBall is IPookyBall, ERC721Upgradeable, AccessControlUpgradeable {

    string public baseUri;
    string public contractUri;

    bytes32 public constant POOKY_CONTRACT = keccak256("POOKY_CONTRACT");

    uint256 lastBallId;
    mapping(uint256 => BallInfo) public balls;

    event BallLevelChange(uint256 indexed ballId, uint256 level);
    event BallAddPxp(uint256 indexed ballId, uint256 addPxp);
    event BallSetRandomEntropy(uint256 indexed ballId, uint256 randomEntropy);

    function initialize(
        string memory _name, 
        string memory _symbol, 
        string memory _baseUri,
        string memory _contractUri,
        address _admin
    ) public initializer {
        __ERC721_init(_name, _symbol);
        __AccessControl_init();
        _setupRole(DEFAULT_ADMIN_ROLE, _admin);

        baseUri = _baseUri;
        contractUri = _contractUri;
    }

    function contractURI() public view returns (string memory) {
        return contractUri;
    }

    function setContractURI(string memory _contractUri) external onlyRole(DEFAULT_ADMIN_ROLE) {
        contractUri = _contractUri;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseUri;
    }
    
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), Errors.TOKEN_DOESNT_EXIST);

        return bytes(baseUri).length > 0 ? string(abi.encodePacked(baseUri, uintToStr(tokenId), ".json")) : "";
    }

    function getBallInfo(uint256 ballId) external view returns(BallInfo memory) {
        return balls[ballId];
    }

    function getBallPxp(uint256 ballId) external view returns(uint256) {
        return balls[ballId].pxp;
    }

    function addBallPxp(uint256 ballId, uint256 addPxpAmount) external onlyRole(POOKY_CONTRACT) {
        balls[ballId].pxp += addPxpAmount;
        emit BallAddPxp(ballId, addPxpAmount);
    }

    function getBallLevel(uint256 ballId) external view returns(uint256) {
        return balls[ballId].level;
    }

    function changeBallLevel(uint256 ballId, uint256 newLevel) external onlyRole(POOKY_CONTRACT) {
        balls[ballId].level = newLevel;
        emit BallLevelChange(ballId, newLevel);
    }

    function _mintBall(address to, BallInfo memory ballInfo) internal returns(uint256) {
        lastBallId++;
        _mint(to, lastBallId);
        balls[lastBallId] = ballInfo;
        return lastBallId;
    }

    function mintWithRarity(address to, BallRarity rarity) external onlyRole(POOKY_CONTRACT) returns(uint256) {
        return _mintBall(
            to, 
            BallInfo(
                rarity, // rarity
                0, // randomEntropy
                0, // level
                0, // pxp
                true, // canBreed
                1, // cardSlots
                new uint[](0), // cards,
                0 // revokableUntilTimestamp
            )
        );
    }

    function mintWithRarityAndRevokableTimestamp(
        address to, 
        BallRarity rarity,
        uint256 revokableUntil
    ) external onlyRole(POOKY_CONTRACT) returns(uint256) {
        return _mintBall(
            to, 
            BallInfo(
                rarity, // rarity
                0, // randomEntropy
                0, // level
                0, // pxp
                true, // canBreed
                1, // cardSlots
                new uint[](0), // cards,
                revokableUntil // revokableUntilTimestamp
            )
        );
    }

    function revokeBall(uint256 ballId) external onlyRole(POOKY_CONTRACT) {
        require(block.timestamp <= balls[ballId].revokableUntilTimestamp, Errors.REVOKABLE_TIMESTAMP_PASSED);
        _burn(ballId);
    }

    function setRandomEntropy(uint256 ballId, uint256 _randomEntropy) external onlyRole(POOKY_CONTRACT) {
        balls[ballId].randomEntropy = _randomEntropy;
        emit BallSetRandomEntropy(ballId, _randomEntropy);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) override internal {
        if (from == address(0) || to == address(0)) return;
        require(block.timestamp > balls[tokenId].revokableUntilTimestamp, Errors.CANT_TRNSFER_WHILE_REVOKABLE);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721Upgradeable, AccessControlUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function uintToStr(uint _i) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len;
        while (_i != 0) {
            k = k-1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
}