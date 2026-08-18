const fs = require('fs');
const path = require('path');

const localAppData = process.env.LOCALAPPDATA || '';
const appData = process.env.APPDATA || '';

console.log('LocalAppData:', localAppData);
console.log('AppData:', appData);

const npmCache1 = path.join(localAppData, 'npm-cache');
const npmCache2 = path.join(appData, 'npm-cache');

console.log('npmCache1 exists:', fs.existsSync(npmCache1));
console.log('npmCache2 exists:', fs.existsSync(npmCache2));
