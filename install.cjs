const { spawn } = require('child_process');

console.log('Starting CI npm install...');
const proc = spawn('cmd.exe', ['/c', 'npm.cmd install --no-audit --no-fund --no-progress < nul'], {
  cwd: __dirname,
  env: {
    ...process.env,
    CI: 'true',
    NPM_CONFIG_YES: 'true',
    NPM_CONFIG_UPDATE_NOTIFIER: 'false',
    NPM_CONFIG_AUDIT: 'false',
    NPM_CONFIG_FUND: 'false'
  },
  stdio: ['ignore', 'inherit', 'inherit']
});

proc.on('close', (code) => {
  console.log('CI npm install process completed with code ' + code);
  process.exit(code);
});
