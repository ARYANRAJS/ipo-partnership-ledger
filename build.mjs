import { pathToFileURL } from 'url';
import path from 'path';

const npxNodeModules = 'C:\\Users\\PC\\AppData\\Local\\npm-cache\\_npx\\0ed97e7da290833f\\node_modules';
const viteUrl = pathToFileURL(path.join(npxNodeModules, 'vite', 'dist', 'node', 'index.js')).href;
const pluginReactUrl = pathToFileURL(path.join(npxNodeModules, '@vitejs', 'plugin-react', 'dist', 'index.js')).href;

console.log('Importing Vite ESM modules...');
const { build } = await import(viteUrl);
const pluginReact = (await import(pluginReactUrl)).default;

console.log('Building production bundle...');
try {
  await build({
    configFile: false,
    root: process.cwd(),
    plugins: [pluginReact()],
    resolve: {
      alias: [
        { find: 'react/jsx-runtime', replacement: path.join(npxNodeModules, 'react', 'jsx-runtime.js') },
        { find: 'react/jsx-dev-runtime', replacement: path.join(npxNodeModules, 'react', 'jsx-dev-runtime.js') },
        { find: 'react-dom/client', replacement: path.join(npxNodeModules, 'react-dom', 'client.js') },
        { find: 'react-dom', replacement: path.join(npxNodeModules, 'react-dom') },
        { find: 'react', replacement: path.join(npxNodeModules, 'react') },
        { find: 'lucide-react', replacement: path.join(npxNodeModules, 'lucide-react') },
        { find: 'canvas-confetti', replacement: path.join(npxNodeModules, 'canvas-confetti') }
      ]
    }
  });
  console.log('Build completed successfully!');
} catch (err) {
  console.error('Build failed:', err);
}
