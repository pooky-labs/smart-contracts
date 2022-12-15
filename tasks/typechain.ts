import { TASK_TYPECHAIN_GENERATE_TYPES } from '@typechain/hardhat/dist/constants';
import { execSync } from 'child_process';
import { subtask } from 'hardhat/config';

subtask(TASK_TYPECHAIN_GENERATE_TYPES, async (args, hre, runSuper) => {
  await runSuper(args);
  execSync('tsc --project tsconfig.package.json');
});
