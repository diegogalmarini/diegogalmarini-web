import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      plugins: [react()],
      // PostCSS/Tailwind se configura en postcss.config.js, no desde Vite
      css: {},
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        }
      },
      esbuild: {
        // Deshabilitar verificación de tipos durante el build
        logOverride: { 'this-is-undefined-in-esm': 'silent' },
        target: 'es2020',
        format: 'esm'
      },
      build: {
        rollupOptions: {
          onwarn(warning, warn) {
            // Suprimir warnings durante el build
            if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;
            if (warning.code === 'CIRCULAR_DEPENDENCY') return;
            warn(warning);
          }
        }
      }
    };
});
