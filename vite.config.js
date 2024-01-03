import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import ViteTsconfigPaths from 'vite-tsconfig-paths'
import styleImport from 'vite-plugin-style-import'
import Components from 'unplugin-vue-components/vite';
import path from 'path';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';

export default defineConfig({
	server: {
	    host: '0.0.0.0',
		port: 3001,
		proxy: {
		      '/*': {
		        target: 'http://localhost:5000',
		        changeOrigin: true,
		      },
		    },
	  },
  plugins: [
    vue(),
	ViteTsconfigPaths(),
	Components({
	  resolvers: [
		AntDesignVueResolver({
		  importStyle: false, // css in js
		}),
	  ],
	}),
    styleImport({
      libs: [{
        libraryName: 'element-plus',
        esModule: true,
        ensureStyleFile: true,
        resolveStyle: (name) => {
          return `element-plus/lib/theme-chalk/${name}.css`
        },
        resolveComponent: (name) => {
          return `element-plus/lib/${name}`
        },
      }],
    }),
  ],
  resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    }
});
