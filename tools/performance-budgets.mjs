import { readdir, stat } from 'node:fs/promises';
import { extname, join, relative, resolve } from 'node:path';

const root = resolve(process.cwd(), 'dist');
const limits = {
  total: 105 * 1024 * 1024,
  fighters: 55 * 1024 * 1024,
  audio: 50 * 1024 * 1024,
  stages: 3 * 1024 * 1024,
  ui: 2 * 1024 * 1024,
  shell: 100 * 1024,
};

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesIn(path) : [path];
  }));
  return nested.flat();
}

const totals = { total: 0, fighters: 0, audio: 0, stages: 0, ui: 0, shell: 0 };
for (const file of await filesIn(root)) {
  const size = (await stat(file)).size;
  const path = relative(root, file).replaceAll('\\', '/');
  totals.total += size;
  if (path.startsWith('assets/fighters/')) totals.fighters += size;
  else if (path.startsWith('assets/audio/')) totals.audio += size;
  else if (path.startsWith('assets/stages/')) totals.stages += size;
  else if (path.startsWith('assets/ui/')) totals.ui += size;
  else if (['.html', '.css', '.js'].includes(extname(path))) totals.shell += size;
}

let failed = false;
for (const [area, bytes] of Object.entries(totals)) {
  const limit = limits[area];
  const mib = (bytes / 1024 / 1024).toFixed(2);
  const limitMib = (limit / 1024 / 1024).toFixed(2);
  console.log(`${area.padEnd(8)} ${mib.padStart(7)} MiB / ${limitMib} MiB`);
  if (bytes > limit) {
    console.error(`Performance budget exceeded for ${area}: ${bytes} > ${limit} bytes`);
    failed = true;
  }
}
if (failed) process.exitCode = 1;
