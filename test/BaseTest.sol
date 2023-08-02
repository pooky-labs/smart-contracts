// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { Test } from "forge-std/Test.sol";

abstract contract BaseTest is Test {
  string internal root;

  constructor() {
    root = vm.projectRoot();
  }

  function loadDataset(string memory file) internal view returns (bytes memory) {
    string memory path = string.concat(root, "/test/datasets/", file);
    return vm.parseJson(vm.readFile(path));
  }
}
