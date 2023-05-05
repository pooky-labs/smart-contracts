// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import {Setup} from "../Setup.sol";
import {Level} from "src/game/Level.sol";

contract LevelTest is Test, Setup {
    address admin = makeAddr("admin");
    address user = makeAddr("user");

    POK pok;
    Pookyball pookyball;
    Level level;

    function setUp() public {
        pok = new POK();
        pookyball = new Pookyball(
            "https://metadata.pooky.gg/pookyballs"
            );
        level = new Level();
    }
}
