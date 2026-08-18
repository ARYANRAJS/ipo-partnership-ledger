const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\PC\\AppData\\Local\\npm-cache\\_npx\\0ed97e7da290833f\\node_modules';
const destDir = path.join(__dirname, 'node_modules');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const items = fs.readdirSync(srcDir);
console.log(`Found ${items.length} items to copy...`);

for (const item of items) {
  if (item === '.bin') continue; // Skip symlinked .bin
  const srcItem = path.join(srcDir, item);
  const destItem = path.join(destDir, item);

  try {
    const stat = fs.lstatSync(srcItem);
    if (stat.isSymbolicLink()) continue;

    console.log(`Copying ${item}...`);
    fs.cpSync(srcItem, destItem, { recursive: true, dereference: true });
  } catch (err) {
    console.error(`Skipped ${item}:`, err.message);
  }
}

console.log('All packages copied successfully!');
