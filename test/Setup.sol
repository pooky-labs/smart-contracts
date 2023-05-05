// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {POK} from "src/tokens/POK.sol";
import {Pookyball} from "src/tokens/Pookyball.sol";

abstract contract Setup {
    POK pok;
    Pookyball pookyball;

    constructor() {
        pok = new POK();
        pookyball = new Pookyball();
    }

    function setUp() public {}
}
