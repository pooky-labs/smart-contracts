import { readFile } from 'fs/promises';
import { run } from 'hardhat';
import { NomicLabsHardhatPluginError } from 'hardhat/plugins';
import { join } from 'path';

interface OpenZeppelinManifest {
  version: string;
  admin: {
    address: string;
    txHash: string;
  };
  proxies: {
    address: string;
    txHash: string;
    kind: string;
  }[];
  impls: Record<
    string,
    {
      address: string;
      txHash: string;
    }
  >;
}

/**
 * Use an OpenZeppelin manifest name, extract all the deployed contracts and their addresses to verify them on Polyscan.
 * @param manifest The manifest name (not the path).
 */
export default async function verifyAll(manifest: string) {
  const path = join(__dirname, '..', '.openzeppelin', `${manifest}.json`);
  const manifestData: OpenZeppelinManifest = JSON.parse(await readFile(path, { encoding: 'utf-8' }));

  const addresses = [
    // manifestData.admin.address, // skipped for now
    ...manifestData.proxies.map((p) => p.address),
    //...Object.values(manifestData.impls).map((i) => i.address), // implementations are verified with the proxy
  ];

  for (const address of addresses) {
    try {
      await run('verify:verify', {
        address,
        constructorArguments: [], // Upgradable contracts have no contractor arguments
      });
    } catch (e) {
      if (!NomicLabsHardhatPluginError.isNomicLabsHardhatPluginError(e)) {
        throw e;
      }

      if (e.message === 'Contract source code already verified') {
        // Silent this error
        continue;
      }

      throw e;
    }
  }
}
