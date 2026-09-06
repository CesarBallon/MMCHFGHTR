import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const manifestPath = path.join(root, 'docs/assets/SHA256SUMS.txt');
const roots = ['dist/assets', 'source-assets'];

async function walk(relative) {
  const entries = await readdir(path.join(root, relative), { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const child = path.posix.join(relative, entry.name);
    if (entry.isDirectory()) files.push(...await walk(child));
    else if (entry.isFile()) files.push(child);
  }
  return files;
}

async function digest(relative) {
  const bytes = await readFile(path.join(root, relative));
  return createHash('sha256').update(bytes).digest('hex');
}

const files = (await Promise.all(roots.map(walk))).flat().sort();
const lines = [];
for (const file of files) lines.push(`${await digest(file)}  ${file}`);
const generated = `${lines.join('\n')}\n`;

if (process.argv.includes('--write')) {
  await mkdir(path.dirname(manifestPath), { recursive: true });
  await writeFile(manifestPath, generated);
  console.log(`Wrote SHA-256 manifest for ${files.length} baseline assets.`);
} else {
  const expected = await readFile(manifestPath, 'utf8');
  if (expected !== generated) {
    console.error('Asset checksum manifest is stale. Review the asset changes, then run npm run assets:manifest.');
    process.exit(1);
  }
  console.log(`Verified SHA-256 manifest for ${files.length} baseline assets.`);
}
