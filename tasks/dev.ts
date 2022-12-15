import { task } from 'hardhat/config';

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

task('dev', async (_, hre) => {
  await hre.run('compile');
  const node = hre.run('node');
  await wait();

  const [deployer] = await hre.ethers.getSigners();
  const factory = await hre.ethers.getContractFactory('TestERC20');
  const contract = await factory.connect(deployer).deploy();
  await contract.deployed();

  console.log('TestERC20 deployed to', contract.address);

  await node;
});
