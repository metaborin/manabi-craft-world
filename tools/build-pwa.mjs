import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, relative, join } from 'node:path';
// In the craft source repository: node tools/build-pwa.mjs (after Vite).
// For distribution-only repositories: node Tools/build-pwa.mjs APP_DIR TEMPLATE.
const output = resolve(process.argv[2] || 'dist');
const template = resolve(process.argv[3] || 'tools/pwa/sw-template.js');
const hash = data => createHash('sha256').update(data).digest('hex');
const assets = [];
async function visit(directory) {
  for (const name of (await readdir(directory)).sort()) {
    if (name.startsWith('.') || ['node_modules', 'tools', 'README.md', 'sw.js'].includes(name)) continue;
    const path = join(directory, name); const info = await stat(path);
    if (info.isDirectory()) { await visit(path); continue; }
    const pathName = relative(output, path).replaceAll('\\', '/');
    if (!/\.(?:html|js|css|json|webmanifest|svg|png|jpg|jpeg|webp|woff2?|ttf|unityweb|wasm|data|txt)$/.test(pathName)) throw new Error(`Unclassified public asset: ${pathName}`);
    const bytes = await readFile(path); assets.push({ path: pathName, bytes: bytes.length, sha256: hash(bytes) });
  }
}
await visit(output);
if (!assets.some(x => x.path === 'index.html')) throw new Error('Missing built index.html');
const source = await readFile(template, 'utf8');
const version = hash(JSON.stringify(assets) + source).slice(0, 20);
const release = { version, bytes: assets.reduce((sum, x) => sum + x.bytes, 0), assets };
await writeFile(join(output, 'sw.js'), source.replace('/* RELEASE_CATALOG */', JSON.stringify(release)));
console.log(JSON.stringify({ output, version, files: assets.length, bytes: release.bytes }));
