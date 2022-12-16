import { task } from 'hardhat/config';
import { join } from 'path';
import rimrafAsync from 'rimraf';
import { promisify } from 'util';

const rimraf = promisify(rimrafAsync);

const paths = ['coverage', 'dist', 'coverage.json'];

// Override the default cleans task to also delete the dist directory
task('clean', async (args, hre, runSuper) => {
  await runSuper(args);
  await Promise.all([paths.map((path) => rimraf(join(process.cwd(), path)))]);
});
