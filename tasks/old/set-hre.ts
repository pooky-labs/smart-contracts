import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

export let HRE: HardhatRuntimeEnvironment = {} as HardhatRuntimeEnvironment;
export const setHRE = (_HRE: HardhatRuntimeEnvironment) => {
  HRE = _HRE;
};

task(`set-hre`, `Inits the BRE, to have access to all the plugins' objects`).setAction(async (_, _HRE) => {
  if (HRE) return;
  setHRE(_HRE);
  return _HRE;
});
