const fs = require('fs');
const path = require('path');

const src = 'C:\\Users\\PC\\AppData\\Local\\npm-cache\\_npx\\0ed97e7da290833f\\node_modules';
const dest = path.join(__dirname, 'node_modules');

console.log(`Copying node_modules from ${src} to ${dest}...`);

try {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  fs.cpSync(src, dest, { recursive: true });
  console.log('Successfully copied node_modules!');
} catch (err) {
  console.error('Error copying node_modules:', err);
}
