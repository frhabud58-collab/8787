import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

const nm = path.resolve(__dirname, 'node_modules');
const fbRoot = path.resolve(nm, '@firebase');

function buildFirebaseAliases(): Record<string, string> {
  const aliases: Record<string, string> = {};
  if (!fs.existsSync(fbRoot)) return aliases;

  const packages = fs.readdirSync(fbRoot, { withFileTypes: true });
  for (const pkg of packages) {
    if (!pkg.isDirectory()) continue;
    if (pkg.name.startsWith('.')) continue;
    if (pkg.name.endsWith('-types') || pkg.name.endsWith('-compat')) continue;

    const pkgRoot = path.resolve(fbRoot, pkg.name);
    const esmDir = path.resolve(pkgRoot, 'dist', 'esm');

    const mainIndex = path.resolve(esmDir, 'index.js');
    if (fs.existsSync(mainIndex)) {
      aliases[`@firebase/${pkg.name}`] = mainIndex;
    }

    const internalFile = path.resolve(esmDir, 'internal.js');
    if (fs.existsSync(internalFile)) {
      aliases[`@firebase/${pkg.name}/internal`] = internalFile;
    }

    const liteFile = path.resolve(esmDir, 'lite.js');
    if (fs.existsSync(liteFile)) {
      aliases[`@firebase/${pkg.name}/lite`] = liteFile;
    }
  }
  return aliases;
}

const firebaseAliases = buildFirebaseAliases();

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      mainFields: ['browser', 'module', 'main'],
      conditions: ['browser', 'import', 'default'],
      alias: {
        '@': path.resolve(__dirname, '.'),
        ...firebaseAliases,
      },
    },
    optimizeDeps: {
      include: [
        'firebase/app',
        'firebase/auth',
        'firebase/firestore',
        'firebase/storage',
      ],
      exclude: [],
    },
    build: {
      commonjsOptions: {
        esmExternals: true,
        transformMixedEsModules: true,
      },
      rollupOptions: {
        onwarn(warning, warn) {
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
          if (warning.code === 'EVAL') return;
          warn(warning);
        },
      },
      // Ensure UTF-8 encoding in built assets
      assetsInlineLimit: 4096,
    },
    // Ensure proper charset in HTML
    html: {
      meta: {
        charset: 'utf-8'
      }
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
