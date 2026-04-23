// Unpack the __bundler-format standalone HTML back to source files.
// Usage: node unpack-bundle.js <input.html> <out-dir>
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const [,, inputPath, outDir] = process.argv;
if (!inputPath || !outDir) {
  console.error('usage: node unpack-bundle.js <input.html> <out-dir>');
  process.exit(1);
}

const html = fs.readFileSync(inputPath, 'utf8');

function extractScript(type) {
  const re = new RegExp(`<script type="__bundler/${type}">([\\s\\S]*?)</script>`);
  const m = html.match(re);
  if (!m) throw new Error(`missing ${type}`);
  return m[1];
}

const manifest = JSON.parse(extractScript('manifest'));
const template = JSON.parse(extractScript('template'));

fs.mkdirSync(outDir, { recursive: true });

const uuids = Object.keys(manifest);
console.log(`Found ${uuids.length} assets`);

const fileMap = {};
for (const uuid of uuids) {
  const entry = manifest[uuid];
  let bytes = Buffer.from(entry.data, 'base64');
  if (entry.compressed) {
    bytes = zlib.gunzipSync(bytes);
  }
  const name = entry.name || entry.path || entry.filename || uuid;
  const outPath = path.join(outDir, name);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, bytes);
  fileMap[uuid] = { name, size: bytes.length, mime: entry.mime || entry.type };
  console.log(`  ${name}  (${bytes.length} bytes${entry.compressed ? ', gz' : ''})`);
}

fs.writeFileSync(path.join(outDir, '_template.txt'), template);
fs.writeFileSync(path.join(outDir, '_manifest-map.json'), JSON.stringify(fileMap, null, 2));
console.log(`\nTemplate + map written to ${outDir}`);
