// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Test } from "forge-std/Test.sol";
import { POKSetup } from "../setup/POKSetup.sol";
import { POK } from "../../src/tokens/POK.sol";
import { AccessControlAssertions } from "../utils/AccessControlAssertions.sol";

contract POKTest is Test, AccessControlAssertions, POKSetup {
  address public admin = makeAddr("admin");
  address public minter = makeAddr("minter");
  address public user1 = makeAddr("user1");
  address public user2 = makeAddr("user2");

  function testFuzz_mint_revertOnlyRole(uint256 amount) public {
    expectRevertMissingRole(user1, pok.MINTER());
    vm.prank(user1);
    pok.mint(user1, amount);
  }

  function testFuzz_burn_revertOnlyRole(uint256 amount) public {
    expectRevertMissingRole(user1, pok.BURNER());
    vm.prank(user1);
    pok.burn(user1, amount);
  }

  function testFuzz__beforeTokenTransfer_revertSouldbound(uint256 amount) public {
    mintPOK(user1, amount);

    vm.expectRevert(POK.Soulbounded.selector);
    vm.prank(user1);
    pok.transfer(user2, amount);
  }
}
