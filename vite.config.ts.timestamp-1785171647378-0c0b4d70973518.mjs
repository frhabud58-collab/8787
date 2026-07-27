// vite.config.ts
import tailwindcss from "file:///home/project/node_modules/@tailwindcss/vite/dist/index.mjs";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.js";
import fs from "fs";
import path from "path";
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
var __vite_injected_original_dirname = "/home/project";
var nm = path.resolve(__vite_injected_original_dirname, "node_modules");
var fbRoot = path.resolve(nm, "@firebase");
function buildFirebaseAliases() {
  const aliases = {};
  if (!fs.existsSync(fbRoot)) return aliases;
  const packages = fs.readdirSync(fbRoot, { withFileTypes: true });
  for (const pkg of packages) {
    if (!pkg.isDirectory()) continue;
    if (pkg.name.startsWith(".")) continue;
    if (pkg.name.endsWith("-types") || pkg.name.endsWith("-compat")) continue;
    const pkgRoot = path.resolve(fbRoot, pkg.name);
    const esmDir = path.resolve(pkgRoot, "dist", "esm");
    const mainIndex = path.resolve(esmDir, "index.js");
    if (fs.existsSync(mainIndex)) {
      aliases[`@firebase/${pkg.name}`] = mainIndex;
    }
    const internalFile = path.resolve(esmDir, "internal.js");
    if (fs.existsSync(internalFile)) {
      aliases[`@firebase/${pkg.name}/internal`] = internalFile;
    }
    const liteFile = path.resolve(esmDir, "lite.js");
    if (fs.existsSync(liteFile)) {
      aliases[`@firebase/${pkg.name}/lite`] = liteFile;
    }
  }
  return aliases;
}
var firebaseAliases = buildFirebaseAliases();
var vite_config_default = defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      mainFields: ["browser", "module", "main"],
      conditions: ["browser", "import", "default"],
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "."),
        ...firebaseAliases
      }
    },
    optimizeDeps: {
      include: [
        "firebase/app",
        "firebase/auth",
        "firebase/firestore",
        "firebase/storage"
      ],
      exclude: []
    },
    build: {
      commonjsOptions: {
        esmExternals: true,
        transformMixedEsModules: true
      },
      rollupOptions: {
        onwarn(warning, warn) {
          if (warning.code === "MODULE_LEVEL_DIRECTIVE") return;
          if (warning.code === "EVAL") return;
          warn(warning);
        }
      },
      // Ensure UTF-8 encoding in built assets
      assetsInlineLimit: 4096
    },
    // Ensure proper charset in HTML
    html: {
      meta: {
        charset: "utf-8"
      }
    },
    server: {
      hmr: process.env.DISABLE_HMR !== "true",
      watch: process.env.DISABLE_HMR === "true" ? null : {}
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgdGFpbHdpbmRjc3MgZnJvbSAnQHRhaWx3aW5kY3NzL3ZpdGUnO1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0JztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7ZGVmaW5lQ29uZmlnfSBmcm9tICd2aXRlJztcblxuY29uc3Qgbm0gPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnbm9kZV9tb2R1bGVzJyk7XG5jb25zdCBmYlJvb3QgPSBwYXRoLnJlc29sdmUobm0sICdAZmlyZWJhc2UnKTtcblxuZnVuY3Rpb24gYnVpbGRGaXJlYmFzZUFsaWFzZXMoKTogUmVjb3JkPHN0cmluZywgc3RyaW5nPiB7XG4gIGNvbnN0IGFsaWFzZXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcbiAgaWYgKCFmcy5leGlzdHNTeW5jKGZiUm9vdCkpIHJldHVybiBhbGlhc2VzO1xuXG4gIGNvbnN0IHBhY2thZ2VzID0gZnMucmVhZGRpclN5bmMoZmJSb290LCB7IHdpdGhGaWxlVHlwZXM6IHRydWUgfSk7XG4gIGZvciAoY29uc3QgcGtnIG9mIHBhY2thZ2VzKSB7XG4gICAgaWYgKCFwa2cuaXNEaXJlY3RvcnkoKSkgY29udGludWU7XG4gICAgaWYgKHBrZy5uYW1lLnN0YXJ0c1dpdGgoJy4nKSkgY29udGludWU7XG4gICAgaWYgKHBrZy5uYW1lLmVuZHNXaXRoKCctdHlwZXMnKSB8fCBwa2cubmFtZS5lbmRzV2l0aCgnLWNvbXBhdCcpKSBjb250aW51ZTtcblxuICAgIGNvbnN0IHBrZ1Jvb3QgPSBwYXRoLnJlc29sdmUoZmJSb290LCBwa2cubmFtZSk7XG4gICAgY29uc3QgZXNtRGlyID0gcGF0aC5yZXNvbHZlKHBrZ1Jvb3QsICdkaXN0JywgJ2VzbScpO1xuXG4gICAgY29uc3QgbWFpbkluZGV4ID0gcGF0aC5yZXNvbHZlKGVzbURpciwgJ2luZGV4LmpzJyk7XG4gICAgaWYgKGZzLmV4aXN0c1N5bmMobWFpbkluZGV4KSkge1xuICAgICAgYWxpYXNlc1tgQGZpcmViYXNlLyR7cGtnLm5hbWV9YF0gPSBtYWluSW5kZXg7XG4gICAgfVxuXG4gICAgY29uc3QgaW50ZXJuYWxGaWxlID0gcGF0aC5yZXNvbHZlKGVzbURpciwgJ2ludGVybmFsLmpzJyk7XG4gICAgaWYgKGZzLmV4aXN0c1N5bmMoaW50ZXJuYWxGaWxlKSkge1xuICAgICAgYWxpYXNlc1tgQGZpcmViYXNlLyR7cGtnLm5hbWV9L2ludGVybmFsYF0gPSBpbnRlcm5hbEZpbGU7XG4gICAgfVxuXG4gICAgY29uc3QgbGl0ZUZpbGUgPSBwYXRoLnJlc29sdmUoZXNtRGlyLCAnbGl0ZS5qcycpO1xuICAgIGlmIChmcy5leGlzdHNTeW5jKGxpdGVGaWxlKSkge1xuICAgICAgYWxpYXNlc1tgQGZpcmViYXNlLyR7cGtnLm5hbWV9L2xpdGVgXSA9IGxpdGVGaWxlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYWxpYXNlcztcbn1cblxuY29uc3QgZmlyZWJhc2VBbGlhc2VzID0gYnVpbGRGaXJlYmFzZUFsaWFzZXMoKTtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCgpID0+IHtcbiAgcmV0dXJuIHtcbiAgICBwbHVnaW5zOiBbcmVhY3QoKSwgdGFpbHdpbmRjc3MoKV0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgbWFpbkZpZWxkczogWydicm93c2VyJywgJ21vZHVsZScsICdtYWluJ10sXG4gICAgICBjb25kaXRpb25zOiBbJ2Jyb3dzZXInLCAnaW1wb3J0JywgJ2RlZmF1bHQnXSxcbiAgICAgIGFsaWFzOiB7XG4gICAgICAgICdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4nKSxcbiAgICAgICAgLi4uZmlyZWJhc2VBbGlhc2VzLFxuICAgICAgfSxcbiAgICB9LFxuICAgIG9wdGltaXplRGVwczoge1xuICAgICAgaW5jbHVkZTogW1xuICAgICAgICAnZmlyZWJhc2UvYXBwJyxcbiAgICAgICAgJ2ZpcmViYXNlL2F1dGgnLFxuICAgICAgICAnZmlyZWJhc2UvZmlyZXN0b3JlJyxcbiAgICAgICAgJ2ZpcmViYXNlL3N0b3JhZ2UnLFxuICAgICAgXSxcbiAgICAgIGV4Y2x1ZGU6IFtdLFxuICAgIH0sXG4gICAgYnVpbGQ6IHtcbiAgICAgIGNvbW1vbmpzT3B0aW9uczoge1xuICAgICAgICBlc21FeHRlcm5hbHM6IHRydWUsXG4gICAgICAgIHRyYW5zZm9ybU1peGVkRXNNb2R1bGVzOiB0cnVlLFxuICAgICAgfSxcbiAgICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgICAgb253YXJuKHdhcm5pbmcsIHdhcm4pIHtcbiAgICAgICAgICBpZiAod2FybmluZy5jb2RlID09PSAnTU9EVUxFX0xFVkVMX0RJUkVDVElWRScpIHJldHVybjtcbiAgICAgICAgICBpZiAod2FybmluZy5jb2RlID09PSAnRVZBTCcpIHJldHVybjtcbiAgICAgICAgICB3YXJuKHdhcm5pbmcpO1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIC8vIEVuc3VyZSBVVEYtOCBlbmNvZGluZyBpbiBidWlsdCBhc3NldHNcbiAgICAgIGFzc2V0c0lubGluZUxpbWl0OiA0MDk2LFxuICAgIH0sXG4gICAgLy8gRW5zdXJlIHByb3BlciBjaGFyc2V0IGluIEhUTUxcbiAgICBodG1sOiB7XG4gICAgICBtZXRhOiB7XG4gICAgICAgIGNoYXJzZXQ6ICd1dGYtOCdcbiAgICAgIH1cbiAgICB9LFxuICAgIHNlcnZlcjoge1xuICAgICAgaG1yOiBwcm9jZXNzLmVudi5ESVNBQkxFX0hNUiAhPT0gJ3RydWUnLFxuICAgICAgd2F0Y2g6IHByb2Nlc3MuZW52LkRJU0FCTEVfSE1SID09PSAndHJ1ZScgPyBudWxsIDoge30sXG4gICAgfSxcbiAgfTtcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF5TixPQUFPLGlCQUFpQjtBQUNqUCxPQUFPLFdBQVc7QUFDbEIsT0FBTyxRQUFRO0FBQ2YsT0FBTyxVQUFVO0FBQ2pCLFNBQVEsb0JBQW1CO0FBSjNCLElBQU0sbUNBQW1DO0FBTXpDLElBQU0sS0FBSyxLQUFLLFFBQVEsa0NBQVcsY0FBYztBQUNqRCxJQUFNLFNBQVMsS0FBSyxRQUFRLElBQUksV0FBVztBQUUzQyxTQUFTLHVCQUErQztBQUN0RCxRQUFNLFVBQWtDLENBQUM7QUFDekMsTUFBSSxDQUFDLEdBQUcsV0FBVyxNQUFNLEVBQUcsUUFBTztBQUVuQyxRQUFNLFdBQVcsR0FBRyxZQUFZLFFBQVEsRUFBRSxlQUFlLEtBQUssQ0FBQztBQUMvRCxhQUFXLE9BQU8sVUFBVTtBQUMxQixRQUFJLENBQUMsSUFBSSxZQUFZLEVBQUc7QUFDeEIsUUFBSSxJQUFJLEtBQUssV0FBVyxHQUFHLEVBQUc7QUFDOUIsUUFBSSxJQUFJLEtBQUssU0FBUyxRQUFRLEtBQUssSUFBSSxLQUFLLFNBQVMsU0FBUyxFQUFHO0FBRWpFLFVBQU0sVUFBVSxLQUFLLFFBQVEsUUFBUSxJQUFJLElBQUk7QUFDN0MsVUFBTSxTQUFTLEtBQUssUUFBUSxTQUFTLFFBQVEsS0FBSztBQUVsRCxVQUFNLFlBQVksS0FBSyxRQUFRLFFBQVEsVUFBVTtBQUNqRCxRQUFJLEdBQUcsV0FBVyxTQUFTLEdBQUc7QUFDNUIsY0FBUSxhQUFhLElBQUksSUFBSSxFQUFFLElBQUk7QUFBQSxJQUNyQztBQUVBLFVBQU0sZUFBZSxLQUFLLFFBQVEsUUFBUSxhQUFhO0FBQ3ZELFFBQUksR0FBRyxXQUFXLFlBQVksR0FBRztBQUMvQixjQUFRLGFBQWEsSUFBSSxJQUFJLFdBQVcsSUFBSTtBQUFBLElBQzlDO0FBRUEsVUFBTSxXQUFXLEtBQUssUUFBUSxRQUFRLFNBQVM7QUFDL0MsUUFBSSxHQUFHLFdBQVcsUUFBUSxHQUFHO0FBQzNCLGNBQVEsYUFBYSxJQUFJLElBQUksT0FBTyxJQUFJO0FBQUEsSUFDMUM7QUFBQSxFQUNGO0FBQ0EsU0FBTztBQUNUO0FBRUEsSUFBTSxrQkFBa0IscUJBQXFCO0FBRTdDLElBQU8sc0JBQVEsYUFBYSxNQUFNO0FBQ2hDLFNBQU87QUFBQSxJQUNMLFNBQVMsQ0FBQyxNQUFNLEdBQUcsWUFBWSxDQUFDO0FBQUEsSUFDaEMsU0FBUztBQUFBLE1BQ1AsWUFBWSxDQUFDLFdBQVcsVUFBVSxNQUFNO0FBQUEsTUFDeEMsWUFBWSxDQUFDLFdBQVcsVUFBVSxTQUFTO0FBQUEsTUFDM0MsT0FBTztBQUFBLFFBQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsR0FBRztBQUFBLFFBQ2hDLEdBQUc7QUFBQSxNQUNMO0FBQUEsSUFDRjtBQUFBLElBQ0EsY0FBYztBQUFBLE1BQ1osU0FBUztBQUFBLFFBQ1A7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsTUFDQSxTQUFTLENBQUM7QUFBQSxJQUNaO0FBQUEsSUFDQSxPQUFPO0FBQUEsTUFDTCxpQkFBaUI7QUFBQSxRQUNmLGNBQWM7QUFBQSxRQUNkLHlCQUF5QjtBQUFBLE1BQzNCO0FBQUEsTUFDQSxlQUFlO0FBQUEsUUFDYixPQUFPLFNBQVMsTUFBTTtBQUNwQixjQUFJLFFBQVEsU0FBUyx5QkFBMEI7QUFDL0MsY0FBSSxRQUFRLFNBQVMsT0FBUTtBQUM3QixlQUFLLE9BQU87QUFBQSxRQUNkO0FBQUEsTUFDRjtBQUFBO0FBQUEsTUFFQSxtQkFBbUI7QUFBQSxJQUNyQjtBQUFBO0FBQUEsSUFFQSxNQUFNO0FBQUEsTUFDSixNQUFNO0FBQUEsUUFDSixTQUFTO0FBQUEsTUFDWDtBQUFBLElBQ0Y7QUFBQSxJQUNBLFFBQVE7QUFBQSxNQUNOLEtBQUssUUFBUSxJQUFJLGdCQUFnQjtBQUFBLE1BQ2pDLE9BQU8sUUFBUSxJQUFJLGdCQUFnQixTQUFTLE9BQU8sQ0FBQztBQUFBLElBQ3REO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
