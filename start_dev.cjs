const { spawn } = require('child_process');
const path = require('path');

const npxNodeModules = 'C:\\Users\\PC\\AppData\\Local\\npm-cache\\_npx\\0ed97e7da290833f\\node_modules';
const viteCmd = path.join(npxNodeModules, '.bin', 'vite.cmd');

console.log('Starting Vite server with -c false...');

const env = Object.assign({}, process.env, {
  NODE_PATH: npxNodeModules
});

const proc = spawn(viteCmd, ['-c', 'false', '--host', '--port', '5173'], {
  cwd: __dirname,
  env: env,
  shell: true,
  stdio: 'inherit'
});

proc.on('close', (code) => {
  console.log('Vite server exited with code ' + code);
});
