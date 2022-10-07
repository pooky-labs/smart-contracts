import { deployContracts } from '../lib/deployContracts';

async function main() {
  await deployContracts({ writeInDB: true });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
