import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import ViteTsconfigPaths from 'vite-tsconfig-paths'
import ElementPlus from 'unplugin-element-plus/vite'
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
    ElementPlus({
        
    }),
  ],
  resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    }
});
