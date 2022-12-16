import { ethers, run } from 'hardhat';
import mainnet from '../lib/config/mainnet';
import { deployContracts } from '../lib/deployContracts';

async function wait() {
  let ok = false;

  do {
    try {
      const res = await fetch('http://localhost:8545', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ method: 'eth_chainId' }),
      });
      ok = res.ok;
    } catch (_) {
      // ignore error
    }

    if (!ok) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  } while (!ok);
}

async function main() {
  await run('compile');
  const node = run('node');
  await wait();

  const [deployer] = await ethers.getSigners();
  await deployContracts(deployer, { ...mainnet, verify: false, confirmations: 0 });

  await node;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
