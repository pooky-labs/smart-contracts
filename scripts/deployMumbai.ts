import { deployContracts } from '../lib/deployContracts';

async function main() {
  await deployContracts({ writeInDB: true, mock: true });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
