// Génère data/audio.js à partir des fichiers présents dans assets/audio/
// (require() doit recevoir des chemins écrits en dur, d'où cette table.)
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'assets', 'audio');
const files = fs.readdirSync(dir).filter((f) => /^\d{3}\.mp3$/i.test(f)).sort();

let out = '// Fichier généré par scripts/genAudio.js — ne pas modifier à la main.\n';
out += 'export const AUDIO = {\n';
for (const f of files) {
  out += `  ${parseInt(f, 10)}: require('../assets/audio/${f}'),\n`;
}
out += '};\n';

fs.writeFileSync(path.join(__dirname, '..', 'data', 'audio.js'), out);
console.log(`${files.length} fichier(s) audio référencé(s) dans data/audio.js`);
