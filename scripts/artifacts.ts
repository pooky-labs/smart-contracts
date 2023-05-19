import glob from "fast-glob";
import { exec } from "node:child_process";
import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { basename, dirname } from "node:path";

/**
 * Generate the contract json ABI.
 * @param contract The contract path.
 */
async function abi(contract: string): Promise<void> {
  const name = basename(contract).replace(/\.sol$/, "");
  const output = contract.replace(/^src/, "abi").replace(/\.sol$/, ".json");
  await mkdir(dirname(output), { recursive: true });
  const stream = createWriteStream(output);
  exec(`forge inspect ${contract}:${name} abi`).stdout?.pipe(stream);
}

/**
 * Generate the contract bytecode.
 * @param contract The contract path.
 */
async function bytecode(contract: string): Promise<void> {
  const name = basename(contract).replace(/\.sol$/, "");
  const output = contract.replace(/^src/, "bytecode").replace(/\.sol$/, ".bin");
  await mkdir(dirname(output), { recursive: true });
  const stream = createWriteStream(output);
  exec(`forge inspect ${contract}:${name} bytecode`).stdout?.pipe(stream);
}

await exec;

const contracts = await glob("src/**/*.sol");
const jobs = contracts.reduce<Promise<void>[]>((acc, contract) => {
  acc.push(abi(contract), bytecode(contract));
  return acc;
}, []);

await Promise.all(jobs);
