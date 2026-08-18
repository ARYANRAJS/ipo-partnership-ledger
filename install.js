const { spawn } = require('child_process');
const fs = require('fs');

const logFile = fs.openSync('npm-install.log', 'w');

console.log('Starting npm install...');
const proc = spawn('cmd.exe', ['/c', 'npm.cmd', 'install', '--no-audit', '--no-fund'], {
  cwd: __dirname,
  stdio: ['ignore', logFile, logFile]
});

proc.on('close', (code) => {
  console.log('npm install process exited with code ' + code);
});
