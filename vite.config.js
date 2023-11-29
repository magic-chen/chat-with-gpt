import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import ViteTsconfigPaths from 'vite-tsconfig-paths';
import styleImport from 'vite-plugin-style-import'

export default defineConfig({
	server: {
	    host: '0.0.0.0',
		port: 3001,
		proxy: {
		      '/*': {
		        target: 'http://127.0.0.1:5000',
		        changeOrigin: true,
		      },
		    },
	  },
  plugins: [
    vue(),
	ViteTsconfigPaths(),
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
});
