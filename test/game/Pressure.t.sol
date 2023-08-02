// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { Pressure } from "@/game/Pressure.sol";
import { BaseTest } from "@test/BaseTest.sol";
import { POKSetup } from "@test/setup/POKSetup.sol";
import { InvalidReceiver } from "@test/utils/InvalidReceiver.sol";

struct PriceCase {
  uint8 current;
  uint8 amount;
  uint256 price;
}

contract PressureTest is BaseTest, POKSetup {
  address public treasury = makeAddr("treasury");
  address public user = makeAddr("user");

  Pressure public pressure;

  event Inflated(uint256 indexed tokenId, uint8 current, uint8 amount);

  function setUp() public {
    pressure = new Pressure(pok, treasury);

    vm.startPrank(makeAddr("admin"));
    pok.grantRole(pok.BURNER(), address(pressure));
    vm.stopPrank();
  }

  function testFuzz_priceNAT_revertIfCurrentPlusAmountIsGreaterThan100(uint8 current, uint8 amount)
    public
  {
    vm.assume(100 < uint256(current) + uint256(amount) && uint256(current) + uint256(amount) < 256);

    vm.expectRevert(abi.encodeWithSelector(Pressure.InvalidParameters.selector, current, amount));
    pressure.priceNAT(current, amount);
  }

  function test_priceNAT_cases() public {
    PriceCase[] memory cases = new PriceCase[](9);
    cases[0] = PriceCase(0, 11, 0.7e18);
    cases[1] = PriceCase(11, 10, 0.54e18);
    cases[2] = PriceCase(21, 10, 0.45e18);
    cases[3] = PriceCase(31, 10, 0.38e18);
    cases[4] = PriceCase(41, 10, 0.32e18);
    cases[5] = PriceCase(51, 10, 0.27e18);
    cases[6] = PriceCase(61, 15, 0.34e18);
    cases[7] = PriceCase(76, 24, 0.45e18);
    cases[8] = PriceCase(0, 100, 3.45e18);

    for (uint256 i = 0; i < 9; i++) {
      assertApproxEqAbs(
        pressure.priceNAT(cases[i].current, cases[i].amount), cases[i].price, 0.01e18
      );
    }
  }

  function testFuzz_pricePOK_revertIfCurrentPlusAmountIsGreaterThan100(uint8 current, uint8 amount)
    public
  {
    vm.assume(100 < uint256(current) + uint256(amount) && uint256(current) + uint256(amount) < 256);

    vm.expectRevert(abi.encodeWithSelector(Pressure.InvalidParameters.selector, current, amount));
    pressure.pricePOK(current, amount);
  }

  function test_pricePOK_cases() public {
    PriceCase[] memory cases = new PriceCase[](9);
    cases[0] = PriceCase(0, 11, 25.14e18);
    cases[1] = PriceCase(11, 10, 19.2e18);
    cases[2] = PriceCase(21, 10, 16.13e18);
    cases[3] = PriceCase(31, 10, 13.55e18);
    cases[4] = PriceCase(41, 10, 11.38e18);
    cases[5] = PriceCase(51, 10, 9.56e18);
    cases[6] = PriceCase(61, 15, 12.04e18);
    cases[7] = PriceCase(76, 24, 16.18e18);
    cases[8] = PriceCase(0, 100, 123.19e18);

    for (uint256 i = 0; i < 9; i++) {
      assertApproxEqAbs(
        pressure.pricePOK(cases[i].current, cases[i].amount), cases[i].price, 0.01e18
      );
    }
  }

  function testFuzz_inflate_nativeCurrency_revertIfInefficientValue(
    uint8 current,
    uint8 amount,
    uint256 tokenId,
    uint256 delta
  ) public {
    vm.assume(uint256(current) + uint256(amount) <= 100 && amount > 0);

    uint256 priceNAT = pressure.priceNAT(current, amount);
    delta = bound(delta, 1, priceNAT - 1);
    uint256 value = priceNAT - delta;

    vm.expectRevert(abi.encodeWithSelector(Pressure.InsufficientValue.selector, value, priceNAT));
    hoax(user, 1000 ether);
    pressure.inflate{ value: value }(tokenId, current, amount);
  }

  function testFuzz_inflate_nativeCurrency_revertTransferFailed(
    uint8 current,
    uint8 amount,
    uint256 tokenId
  ) public {
    vm.assume(uint256(current) + uint256(amount) <= 100 && amount > 0);

    treasury = address(new InvalidReceiver());
    pressure = new Pressure(pok, treasury);
    uint256 priceNAT = pressure.priceNAT(current, amount);

    vm.expectRevert(abi.encodeWithSelector(Pressure.TransferFailed.selector, user, priceNAT));
    hoax(user, 1000 ether);
    pressure.inflate{ value: priceNAT }(tokenId, current, amount);
  }

  function testFuzz_inflate_nativeCurrency_pass(uint8 current, uint8 amount, uint256 tokenId)
    public
  {
    vm.assume(uint256(current) + uint256(amount) <= 100 && amount > 0);

    uint256 priceNAT = pressure.priceNAT(current, amount);

    vm.expectEmit(true, true, true, true);
    emit Inflated(tokenId, current, amount);

    hoax(user, 1000 ether);
    pressure.inflate{ value: priceNAT }(tokenId, current, amount);
    assertGe(treasury.balance, priceNAT);
  }

  function testFuzz_inflate_POK_revertIfNotEnoughPOK(
    uint8 current,
    uint8 amount,
    uint256 tokenId,
    uint256 delta
  ) public {
    vm.assume(uint256(current) + uint256(amount) <= 100 && amount > 0);

    uint256 pricePOK = pressure.pricePOK(current, amount);
    delta = bound(delta, 1, pricePOK - 1);
    uint256 minted = pricePOK - delta;
    mintPOK(user, minted);

    vm.expectRevert(abi.encodeWithSelector(Pressure.InsufficientPOK.selector, minted, pricePOK));
    vm.prank(user);
    pressure.inflate(tokenId, current, amount);
  }

  function testFuzz_inflate_POK_pass(uint8 current, uint8 amount, uint256 tokenId) public {
    vm.assume(uint256(current) + uint256(amount) <= 100 && amount > 0);

    uint256 pricePOK = pressure.pricePOK(current, amount);
    mintPOK(user, pricePOK);

    vm.expectEmit(true, true, true, true, address(pressure));
    emit Inflated(tokenId, current, amount);

    vm.prank(user);
    pressure.inflate(tokenId, current, amount);
  }
}
