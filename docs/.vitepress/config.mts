import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Kikikoko's Blog",
  description: '分享技术心得与编程经验的个人博客',
  lang: 'zh-CN',
  base: '/',
  cleanUrls: true,
  lastUpdated: true,
  sitemap: {
    hostname: 'https://kikikoko50517.github.io',
  },
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'referrer', content: 'no-referrer' }],
    [
      'meta',
      {
        name: 'keywords',
        content: '前端开发,微信小程序,JavaScript,TypeScript,Vue,React',
      },
    ],
    ['meta', { name: 'author', content: 'Kikikoko' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: "Kikikoko's Blog" }],
    [
      'meta',
      {
        property: 'og:description',
        content: '分享技术心得与编程经验的个人博客',
      },
    ],
    [
      'meta',
      { property: 'og:url', content: 'https://kikikoko50517.github.io' },
    ],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo.png',
    siteTitle: "Kikikoko's Blog",
    outline: {
      level: [2, 6],
      label: '目录',
    },
    nav: [
      { text: '首页', link: '/' },
    ],

    sidebar: [
      {
        text: '微信小程序',
        collapsed: false,
        items: [
          {
            text: '原生小程序工程化指北',
            link: '/miniprogram/原生小程序工程化指北',
          },
        ],
      },
      {
        text: '前端工程化',
        collapsed: false,
        items: [
          {
            text: '构建环境区分',
            link: '/engineering/构建环境区分',
          },
          {
            text: '常量管理',
            link: '/engineering/常量管理',
          },
          {
            text: '流水线 CI/CD',
            link: '/engineering/流水线 CI/CD',
          },
          {
            text: '前端性能优化',
            link: '/engineering/前端性能优化',
          },
          {
            text: '用一个简单 demo 理解 Webpack Module Federation',
            link: '/engineering/用一个简单 demo 理解 Webpack Module Federation',
          },
        ],
      },
      {
        text: '加密',
        collapsed: false,
        items: [
          {
            text: 'RSA + AES 混合加密实现',
            link: '/encryption/RSA + AES 混合加密实现',
          },
        ],
      },
    ],

    // 搜索功能
    search: {
      provider: 'local',
      options: {
        locales: {
          zh: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档',
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                },
              },
            },
          },
        },
      },
    },

    // 编辑链接
    editLink: {
      pattern: 'https://github.com/kikikoko50517/blog/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页面',
    },

    // 最后更新时间
    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium',
      },
    },

    // 文档页脚
    docFooter: {
      prev: '上一页',
      next: '下一页',
    },

    // 暗黑模式切换
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',

    // 侧边栏菜单标签
    sidebarMenuLabel: '菜单',

    // 返回顶部
    returnToTopLabel: '回到顶部',

    // 外部链接图标
    externalLinkIcon: true,

    socialLinks: [{ icon: 'github', link: 'https://github.com/kikikoko50517' }],
  },
})
