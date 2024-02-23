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
		// visualizer({ open: true, filename: 'bundle-report.html' }),
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
			'@': path.resolve(__dirname, './src'),
			stream: 'stream-browserify',
			https: 'agent-base',
			zlib: 'browserify-zlib',
		}
	},
	define: {
		// 禁用Options API
		__VUE_OPTIONS_API__: false,
		// 禁用生产环境的Vue Devtools
		__VUE_PROD_DEVTOOLS__: false,
		__VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
	  }
});
