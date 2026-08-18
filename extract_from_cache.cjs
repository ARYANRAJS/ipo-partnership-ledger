const fs = require('fs');
const path = require('path');

const npmCache = 'C:\\Users\\PC\\AppData\\Local\\npm-cache';

function walk(dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    try {
      const stat = fs.statSync(full);
      if (stat && stat.isDirectory()) {
        walk(full, results);
      } else {
        if (file.endsWith('.tgz') || file.includes('vite') || file.includes('react')) {
          results.push(full);
        }
      }
    } catch(e) {}
  });
  return results;
}

const found = walk(npmCache);
console.log(`Found ${found.length} files in npm cache.`);
found.slice(0, 20).forEach(f => console.log(f));
