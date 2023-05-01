// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "openzeppelin/token/ERC721/ERC721.sol";
import "../../src/mint/RefillableSale.sol";
import "src/tokens/Pookyball.sol";
import "chainlink/contracts/src/v0.8/mocks/VRFCoordinatorV2Mock.sol";

contract RefillableSaleTest is Test {
    VRFCoordinatorV2Mock vrf;
    Pookyball pookyball;
    RefillableSale sale;

    Refill[] refills;

    address treasury = makeAddr("treasury");
    address admin = makeAddr("admin");
    address seller = makeAddr("seller");
    address user = makeAddr("user");

    function setUp() public {
        refills.push(Refill(PookyballRarity.COMMON, 77, 20 ether));
        refills.push(Refill(PookyballRarity.RARE, 18, 80 ether));
        refills.push(Refill(PookyballRarity.EPIC, 4, 320 ether));
        refills.push(Refill(PookyballRarity.LEGENDARY, 1, 1280 ether));

        vrf = new VRFCoordinatorV2Mock(0, 0);
        uint64 subId = vrf.createSubscription();
        pookyball = new Pookyball(
            "https://tokens.pooky.gg",
            "https://contracts.pooky.gg/contracts/Pookyball",
            treasury,
            address(vrf),
            0x8af398995b04c28e9951adb9721ef74c74f93e6a478f39e7e0777be13527e7ef,
            subId,
            10,
            2500000
        );
        
        address[] memory sellers = new address[](1);
        sellers[0] = seller;
        sale = new RefillableSale(pookyball, treasury, admin, sellers);

        vm.prank(seller);
        sale.restock(refills, 1);
    }

    function testPermissions() public {
        assertTrue(sale.hasRole(sale.DEFAULT_ADMIN_ROLE(), admin));
        assertTrue(sale.hasRole(sale.SELLER(), seller));
    }

    function testGetTemplates() public {
        Item[] memory templates = sale.getTemplates();
        assertEq(templates.length, refills.length);
    }

    function testIsClosedClosedUntilIsZero() public {
        vm.prank(seller);
        sale.restock(refills, 0);
        assertTrue(sale.isClosed());
    }

    function testIsClosedClosedInTheFuture(uint256 future) public {
        vm.assume(future > block.timestamp);
        vm.prank(seller);
        sale.restock(refills, future);
        assertTrue(sale.isClosed());
    }

    function testEligibleSaleIsClosed(uint256 future) public {
        vm.assume(future > block.timestamp);
        vm.prank(seller);
        sale.restock(refills, future);

        for (uint256 i = 0; i < refills.length; i++) {
            assertEq(sale.eligible(refills[i].rarity, 1), "sale is closed");
        }
    }

    function testEligibleInsufficientRemainingSupply(uint256 quantity) public {
        vm.assume(0 < quantity && quantity < 100);

        vm.prank(seller);
        Refill[] memory refills = new Refill[](1);
        refills[0] = Refill(PookyballRarity.COMMON, quantity, 20 ether);
        sale.restock(refills, 1);

        vm.prank(user);
        assertEq(sale.eligible(PookyballRarity.COMMON, quantity), '');
        assertEq(sale.eligible(PookyballRarity.COMMON, quantity + 1), 'insufficient supply');
    }

    function testEligibleInsufficientRemainingSupply() public {
        vm.prank(user);
        assertEq(sale.eligible(PookyballRarity.COMMON, 1), '');
    }
}