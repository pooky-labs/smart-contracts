import { readdir, Dirent, stat, readFileSync, existsSync, mkdirSync, promises as fsPromises } from 'fs';
import { resolve, join } from 'path';

/**
 * Recursively walk a directory asynchronously and obtain all file names (with full path).
 *
 * @param dir Folder name you want to recursively process
 * @param done Callback function, returns all files with full path.
 * @param filter Optional filter to specify which files to include,
 *   e.g. for json files: (f: string) => /.json$/.test(f)
 * @see https://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search/50345475#50345475
 */
const walk = (dir: string, done: (err: Error | null, results?: string[]) => void, filter?: (f: string) => boolean) => {
  let results: string[] = [];

  readdir(dir, { withFileTypes: true }, (err: NodeJS.ErrnoException | null, files: Dirent[]) => {
    if (err) {
      return done(err);
    }

    let pending = files.length;
    if (!pending) {
      return done(null, results);
    }
    files.forEach((file: Dirent) => {
      const fileName = resolve(dir, file.name);

      stat(fileName, (err2, stat) => {
        if (stat.isDirectory()) {
          walk(
            fileName,
            (err3, res) => {
              if (res) {
                results = results.concat(res);
              }
              if (!--pending) {
                done(null, results);
              }
            },
            filter,
          );
        } else {
          if (typeof filter === 'undefined' || (filter && filter(fileName))) {
            results.push(fileName);
          }
          if (!--pending) {
            done(null, results);
          }
        }
      });
    });
  });
};

async function asyncWriteFile(filename: string, data: string) {
  const filePath = join(__dirname, '../', filename);

  const folder = filePath.substring(0, filePath.lastIndexOf('/'));

  if (!existsSync(folder)) {
    mkdirSync(folder, { recursive: true });
  }

  try {
    await fsPromises.writeFile(filePath, data, {
      flag: 'w', // Open file for reading and writing. File is created if not exists
    });
  } catch (err) {
    console.log('Failed to write to file', filePath, err);
  }
}

async function main() {
  const dir = '/artifacts/contracts/';
  const destinationFolter = 'data/bytecode';

  walk(
    '.' + dir,
    (err: Error | null, results?: string[]) => {
      const regex = new RegExp(`.*${dir}`, 'g');

      if (results != undefined) {
        results.forEach((fullPath: string) => {
          let finalPath = fullPath.replace(regex, `${destinationFolter}/`);

          finalPath = finalPath.replace(/[a-zA-Z0-9,]*.sol\//, '');

          const data = readFileSync(fullPath, 'utf-8');

          const bytecode = JSON.parse(data).bytecode;

          asyncWriteFile(removeExtension(finalPath), bytecode);
        });

        console.log('Successfully extracted the contract bytecode');
      }
    },
    // match only the files which has a single dot
    (f: string) => /^.*\/[a-zA-Z0-9,]*[.]{0,1}[a-zA-Z0-9,]*$/.test(f),
  );
}

function removeExtension(filename: string) {
  return filename.substring(0, filename.lastIndexOf('.')) || filename;
}

main().catch((error) => {
  console.error('Failed to extract the contract bytecode', error);
  process.exitCode = 1;
});
