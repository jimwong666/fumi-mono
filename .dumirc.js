import { defineConfig } from 'dumi';

export default defineConfig({
  themeConfig: {
    name: '文档',
    logo: 'fumi.svg',
    nav: [
      { title: '快速开始', link: '/start' },
      { title: 'fumi命令行工具', link: '/fumi-cli' },
      { title: 'fumi脚手架', link: '/fumi' },
      { title: '变更日志', link: '/changelog' },
    ],
    footer: 'Powered by 移动研发部',
    favicons: ['fumi.svg'],
  },
});
