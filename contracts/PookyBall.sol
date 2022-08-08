// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./interfaces/IPookyBall.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {BallInfo,BallRarity} from "./types/DataTypes.sol";

contract PookyBall is IPookyBall, ERC721Upgradeable, OwnableUpgradeable {

    string public baseURI;
    string public _contractURI;

    uint256 lastBallId;
    mapping(uint256 => BallInfo) public balls;

    mapping(address => bool) public pookyContracts;

    event BallLevelChange(uint256 indexed ballId, uint256 level);
    event BallAddPxp(uint256 indexed ballId, uint256 addPxp);
    event BallSetRandomEntropy(uint256 indexed ballId, bytes32 randomEntropy);


    function initialize(
        string memory name_, 
        string memory symbol_, 
        string memory baseURI_,
        string memory contractURI_
    ) public initializer {

        __ERC721_init(name_, symbol_);
        __Ownable_init();

       
        baseURI = baseURI_;
        _contractURI = contractURI_;
    }

    function setPookyContract(address contractAddress, bool toSet) external onlyOwner {
        pookyContracts[contractAddress] = toSet;
    }

    modifier onlyPookyContracts {
        require(pookyContracts[msg.sender], "E");
        _;
    } 

    function contractURI() public view returns (string memory) {
        return _contractURI;
    }

    function setContractURI(string memory contractURI_) external onlyOwner {
        _contractURI = contractURI_;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }
    
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "E");

        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, uintToStr(tokenId), ".json")) : "";
    }

    function getBallInfo(uint256 ballId) external view returns(BallInfo memory) {
        return balls[ballId];
    }

    function getBallPxp(uint256 ballId) external view returns(uint256) {
        return balls[ballId].pxp;
    }

    function addBallPxp(uint256 ballId, uint256 addPxpAmount) external onlyPookyContracts {
        balls[ballId].pxp += addPxpAmount;
        emit BallAddPxp(ballId, addPxpAmount);
    }

    function getBallLevel(uint256 ballId) external view returns(uint256) {
        return balls[ballId].level;
    }

    function changeBallLevel(uint256 ballId, uint256 newLevel) external onlyPookyContracts {
        balls[ballId].level = newLevel;
        emit BallLevelChange(ballId, newLevel);
    }

    // function setBallInfo(uint256 ballId, BallInfo memory ballInfo) external onlyPookyContracts {
    //     balls[ballId] = ballInfo;
    // }

    function _mintBall(address to, BallInfo memory ballInfo) internal returns(uint256) {
        lastBallId++;
        _mint(to, lastBallId);
        balls[lastBallId] = ballInfo;
        return lastBallId;
    }

    function mintWithRarity(address to, BallRarity rarity) external onlyPookyContracts returns(uint256) {
        return _mintBall(
            to, 
            BallInfo(
                rarity, // rarity
                "", // randomEntropy
                0, // level
                0, // pxp
                true, // canBreed
                1, // cardSlots
                new uint[](0) // cards
            )
        );
    }

    function setRandomEntropy(uint256 ballId, bytes32 _randomEntropy) external onlyPookyContracts {
        balls[ballId].randomEntropy = _randomEntropy;
        emit BallSetRandomEntropy(ballId, _randomEntropy);
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