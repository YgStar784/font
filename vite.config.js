import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import commonjs from '@rollup/plugin-commonjs';
import requireTransform from 'vite-plugin-require-transform';
import legacy from '@vitejs/plugin-legacy';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs'


//import GlobalsPolyfills from '@esbuild-plugins/node-globals-polyfill'
//const GlobalsPolyfills = require("@esbuild-plugins/node-globals-polyfill").default
//import { url } from './src/views/Login/url.vue'
/* import { getCurrentInstance, ref } from "vue";// 获取当前实例，在当前实例充当vue2 中的this

import { Agent, get } from 'node:http' */
//import { littleUrlSetAPI } from './src/views/Login/littleUrlSet';
//import { url } from './src/littleUrlGet'
// https://vitejs.dev/config/
//import { getUserInfoAPI } from './src/apis/users'
//import { useUserStore } from '@/stores/user';

/* 
const userStore = useUserStore()
const url = useUserStore.userInfo.nodeIp + ':' + useUserStore.userInfo.nodePort */
console.log('vite')


export default defineConfig({
  plugins: [
    commonjs(),
    vue(), // Vue 插件，确保这个放在第一个

    vueJsx(), // 启用 JSX 支持
    requireTransform({ fileRegex: /.js$|.vue$/ }), // 处理 require 语法
    legacy({
      targets: ['defaults', 'not IE 11'] // 针对旧浏览器的兼容性
    }),


  ],
  optimizeDeps: {
    include: ['axios', 'some-package', 'another-package', '@monaco-editor/vue'],
    /*     esbuildOptions: {
          define: {
            global: 'globalThis',
          },
          plugins: [
            GlobalsPolyfills({
              process: true,
              buffer: true,
            }),
          ],
        } */
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      process: 'process/browser',
      stream: 'stream-browserify',
      util: 'util',
      https: 'agent-base',
      zlib: 'browserify-zlib',

    }
  },
  server: {

    proxy: {
      /* '/api/getAllUserPublic': {
        secure: false, // 如果目标服务器是 HTTPS 且没有有效证书，设置为 false
        target: 'https://120.48.18.15:7000',
        changeOrigin: true, // 更改请求的来源，使代理服务器的主机头与目标相匹配
        rewrite: (path) => path.replace(/^\/api\/getAllUser/, '/api/getAllUserPublic') // 保持目标路径一致
      }, */
      '/api': {
        secure: false,
        target: 'http://127.0.0.1:4523/m1/4311960-3954686-default/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },

      /* '/api': {
        secure: false,
        target: 'https://120.48.18.15:8000/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }, */
      '/littleApi': {
        secure: false,
        //target: `https://${localStorage.getItem('nodeIp')}:${localStorage.getItem('nodePort')}/api `,
        target: 'https://120.48.18.15:8000/api',
        //target: `https://${url}`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/littleApi/, ''),
        /*         configure: (proxy, options) => {
                  proxy.on("proxyReq", (proxyReq) => {
                    // 在这里通过正则匹配获取目标服务器地址
                    console.log(options.target)
                    //if (url != '') options.target = `https://${url}`;
                  });
                }, */

      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        // 自动导入定制化样式文件进行样式覆盖
        additionalData: `
        @use "@/styles/element/index.scss" as *;
        @use "@/styles/variables.scss" as *;
      `
      }
    }
  },

})
