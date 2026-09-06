import { access, readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const fighters = ['saja', 'benita', 'mariachay', 'asunta', 'shabuka', 'bella', 'jarjacha', 'coraima'];
const stages = ['titicaca', 'prison', 'machu', 'lima', 'circus', 'cumbia', 'mercado', 'arequipa'];
const themes = ['Saja', 'Benita', 'Mariachay', 'Asunta', 'Shabuka', 'Bella', 'Jarjacha', 'Coraima'];
const requiredAtlases = {
  saja: ['locomotion', 'combat', 'braid-lash', 'saya-wave'],
  benita: ['locomotion', 'combat', 'beer-bath', 'revolver'],
  mariachay: ['locomotion', 'combat', 'rolling-rush', 'sky-slap'],
  asunta: ['locomotion', 'combat', 'baby-shriek', 'diaper-toss'],
  shabuka: ['locomotion', 'combat', 'pom-power', 'rising-cheer'],
  bella: ['locomotion', 'combat', 'high-note', 'mic-return'],
  jarjacha: ['locomotion', 'combat', 'dizzy-hands', 'sandal-return'],
  coraima: ['locomotion', 'combat', 'flying-kiss', 'tornado-heel']
};

const errors = [];
const forbiddenPrototypePaths = [
  'dist/assets/fighters/idle',
  'dist/assets/fighters/portraits-v11',
  'dist/assets/fighters/select-v11',
  'source-assets/idle-inbetweens',
  'source-assets/idle-keyframes',
  'source-assets/roster-cutouts',
  'source-assets/roster-source'
];

async function requireFile(relative, minimumBytes = 1) {
  const absolute = path.join(root, relative);
  try {
    await access(absolute);
    const info = await stat(absolute);
    if (!info.isFile()) errors.push(`${relative} is not a file`);
    else if (info.size < minimumBytes) errors.push(`${relative} is unexpectedly small (${info.size} bytes)`);
  } catch {
    errors.push(`missing ${relative}`);
  }
}

await Promise.all([
  requireFile('dist/index.html', 100),
  requireFile('dist/game.js', 1000),
  ...fighters.flatMap((fighter) => [
    requireFile(`dist/assets/fighters/select-v16/${fighter}.webp`, 1000),
    requireFile(`dist/assets/fighters/portraits-v16/${fighter}.webp`, 1000),
    requireFile(`source-assets/canonical-models-v16/${fighter}.png`, 1000),
    ...requiredAtlases[fighter].flatMap((atlas) => [
      requireFile(`source-assets/action-atlases/${fighter}/${atlas}.png`, 1000),
      requireFile(`dist/assets/fighters/actions/${fighter}/${atlas}.webp`, 1000)
    ])
  ]),
  ...stages.map((stage) => requireFile(`dist/assets/stages/${stage}.webp`, 1000)),
  ...themes.map((theme) => requireFile(`dist/assets/audio/soundtrack/${theme}Theme.mp3`, 1000)),
  requireFile('dist/assets/audio/soundtrack/Intro_SelectionScreen.mp3', 1000),
  requireFile('dist/assets/audio/soundtrack/EndCredits.mp3', 1000),
  requireFile('dist/assets/audio/soundtrack/BonusTrack.mp3', 1000)
]);

try {
  await access(path.join(root, '.openai/hosting.json'));
} catch {
  await requireFile('.openai/hosting.example.json', 20);
}

const gameSource = await readFile(path.join(root, 'dist/game.js'), 'utf8');
for (const fighter of fighters) {
  if (!gameSource.includes(`id:'${fighter}'`)) errors.push(`dist/game.js has no roster entry for ${fighter}`);
  if (!gameSource.includes(`select-v16/${fighter}.webp`)) errors.push(`dist/game.js does not use the current selection atlas for ${fighter}`);
  if (!gameSource.includes(`portraits-v16/${fighter}.webp`)) errors.push(`dist/game.js does not use the current portrait for ${fighter}`);
  for (const atlas of requiredAtlases[fighter]) {
    if (!gameSource.includes(`actions/${fighter}/${atlas}.webp`)) errors.push(`dist/game.js does not reference ${fighter}/${atlas}.webp`);
  }
}
if (/\bjarana\b/i.test(gameSource)) errors.push('dist/game.js still contains the retired Jarana identifier');

async function walk(relative) {
  const entries = await readdir(path.join(root, relative), { withFileTypes: true });
  for (const entry of entries) {
    const child = path.join(relative, entry.name);
    if (entry.isDirectory()) await walk(child);
    else if (/\.(tmp|bak|orig)$|~$/i.test(entry.name)) errors.push(`temporary file committed: ${child}`);
  }
}
await walk('dist');

for (const relative of forbiddenPrototypePaths) {
  try {
    await access(path.join(root, relative));
    errors.push(`prototype-only path present in baseline: ${relative}`);
  } catch {
    // Expected: prototype-only assets live in the separate backup bundle.
  }
}

for (const fighter of fighters) {
  try {
    await access(path.join(root, `source-assets/action-atlases/${fighter}/raw`));
    errors.push(`raw intermediary atlases must not be committed: source-assets/action-atlases/${fighter}/raw`);
  } catch {
    // Expected.
  }
}

if (errors.length) {
  console.error(`Validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validated ${fighters.length} fighters, ${fighters.length * 4} source/runtime action-atlas pairs, ${stages.length} stages and ${themes.length + 3} soundtrack files.`);
