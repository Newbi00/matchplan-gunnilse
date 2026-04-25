// Bygg en standalone HTML genom att inlinea styles.css + data.js + Components.jsx + Sections.jsx + App.jsx i matchplan/index.html.
// Usage: node build-standalone.js
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'matchplan');
const out = path.join(__dirname, 'matchplan-standalone.html');

const read = (f) => fs.readFileSync(path.join(src, f), 'utf8');

let html = read('index.html');
const css = read('styles.css');
const pitchGeo = read('pitchGeometry.js');
const data = read('data.js');
const components = read('Components.jsx');
const taktikBilder = read('TaktikBilder.jsx');
const sections = read('Sections.jsx');
const app = read('App.jsx');

html = html.replace(
  /<link rel="stylesheet" href="styles\.css">/,
  `<style>\n${css}\n</style>`
);
html = html.replace(
  /<script src="pitchGeometry\.js"><\/script>/,
  `<script>\n${pitchGeo}\n</script>`
);
html = html.replace(
  /<script src="data\.js"><\/script>/,
  `<script>\n${data}\n</script>`
);
html = html.replace(
  /<script type="text\/babel" src="Components\.jsx"><\/script>/,
  `<script type="text/babel" data-presets="react">\n${components}\n</script>`
);
html = html.replace(
  /<script type="text\/babel" src="TaktikBilder\.jsx"><\/script>/,
  `<script type="text/babel" data-presets="react">\n${taktikBilder}\n</script>`
);
html = html.replace(
  /<script type="text\/babel" src="Sections\.jsx"><\/script>/,
  `<script type="text/babel" data-presets="react">\n${sections}\n</script>`
);
html = html.replace(
  /<script type="text\/babel" src="App\.jsx"><\/script>/,
  `<script type="text/babel" data-presets="react">\n${app}\n</script>`
);

fs.writeFileSync(out, html);
console.log(`Wrote ${out} (${html.length} bytes)`);
