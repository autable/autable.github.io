import { defineConfig } from "vitepress";

export default defineConfig({
  lang: "zh-CN",
  title: "Autable",
  description: "代码优先的多维表格、表单与工作流平台",
  outDir: "../site",
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: "/images/autable-mark.svg" }],
    ["meta", { name: "theme-color", content: "#0f766e" }],
    ["meta", { property: "og:title", content: "Autable" }],
    ["meta", { property: "og:description", content: "代码优先的多维表格、表单与工作流平台" }]
  ],
  themeConfig: {
    logo: "/images/autable-mark.svg",
    nav: [
      { text: "首页", link: "/" },
      { text: "指南", link: "/guide/what-is-autable" },
      { text: "节点", link: "/reference/nodes" },
      { text: "GitHub", link: "https://github.com/autable/autable" }
    ],
    sidebar: {
      "/guide/": [
        {
          text: "开始",
          items: [
            { text: "Autable 是什么", link: "/guide/what-is-autable" },
            { text: "快速开始", link: "/guide/quick-start" },
            { text: "配置", link: "/guide/configuration" },
            { text: "仓库布局", link: "/guide/repository-layout" }
          ]
        },
        {
          text: "核心模型",
          items: [
            { text: "表格与视图", link: "/guide/tables-and-views" },
            { text: "表单", link: "/guide/forms" },
            { text: "工作流", link: "/guide/workflows" },
            { text: "权限", link: "/guide/permissions" }
          ]
        },
        {
          text: "上线",
          items: [{ text: "部署与发布", link: "/guide/deployment" }]
        }
      ],
      "/reference/": [
        {
          text: "参考",
          items: [{ text: "Workflow Nodes", link: "/reference/nodes" }]
        }
      ]
    },
    socialLinks: [{ icon: "github", link: "https://github.com/autable/autable" }],
    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2026 Autable"
    },
    search: {
      provider: "local"
    },
    outline: {
      label: "本页目录",
      level: [2, 3]
    },
    docFooter: {
      prev: "上一页",
      next: "下一页"
    },
    lastUpdated: {
      text: "最后更新",
      formatOptions: {
        dateStyle: "medium",
        timeStyle: "short"
      }
    }
  }
});
