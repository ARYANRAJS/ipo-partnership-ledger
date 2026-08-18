const path = require('path');
const npxNodeModules = 'C:\\Users\\PC\\AppData\\Local\\npm-cache\\_npx\\0ed97e7da290833f\\node_modules';

// Add npxNodeModules to module search paths
module.paths.unshift(npxNodeModules);

const { createServer } = require(path.join(npxNodeModules, 'vite'));
const reactPlugin = require(path.join(npxNodeModules, '@vitejs', 'plugin-react'));

async function start() {
  console.log('Creating programmatic Vite dev server...');
  const server = await createServer({
    configFile: false,
    root: __dirname,
    plugins: [reactPlugin()],
    server: {
      port: 5173,
      host: true
    }
  });

  await server.listen();
  console.log(`Vite server running at http://localhost:${server.config.server.port}/`);
  server.printUrls();
}

start().catch(err => {
  console.error('Failed to start Vite server:', err);
});
