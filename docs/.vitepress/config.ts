import { defineConfig } from '@koishijs/vitepress'

export default defineConfig({
  lang: 'zh-CN',
  title: 'koishi-plugin-dialogue',
  description: '基于 Koishi 的对话系统',

  head: [
    ['link', { rel: 'icon', href: 'https://koishi.chat/logo.png' }],
    ['link', { rel: 'manifest', href: 'https://koishi.chat/manifest.json' }],
    ['meta', { name: 'theme-color', content: '#5546a3' }],
  ],

  themeConfig: {
    sidebar: [{
      text: '指南',
      items: [
        { text: '基本用法', link: '/' },
        { text: '插值调用', link: '/interp.md' },
        { text: '概率机制', link: '/prob.md' },
        { text: '正则匹配', link: '/regexp.md' },
        { text: '上下文机制', link: '/context.md' },
        { text: '前置与后继问答', link: '/flow.md' },
        { text: '其他机制', link: '/misc.md' },
        { text: '配置项', link: '/config.md' },
      ],
    }, {
      text: '更多',
      items: [
        { text: 'Koishi 官网', link: 'https://koishi.chat' },
        { text: '支持作者', link: 'https://afdian.net/a/shigma' },
      ],
    }],
  },

  vite: {
    resolve: {
      dedupe: ['vue'],
    },
  },
})
