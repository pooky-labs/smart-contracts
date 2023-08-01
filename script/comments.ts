import glob from 'fast-glob';
import { readFile, writeFile } from 'node:fs/promises';

async function run(file: string) {
  const code = await readFile(file, 'utf-8');
  const patch = code
    .replace(/^ *\/\*\*$/gm, '~~~')
    .replace(/^ +\*\/$/gm, '~~~')
    .replaceAll('~~~\n', '')
    .replace(/^( *) \* /gm, '$1/// ');
  await writeFile(file, patch);
}

const contracts = await glob('src/**/*.sol');
const jobs = contracts.map((file) => run(file));

await Promise.all(jobs);
