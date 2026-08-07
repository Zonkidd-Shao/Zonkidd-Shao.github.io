---
title: 博客上线啦！欢迎来到 Zonkidd 的代码世界
date: 2026-08-07
tags: 博客, GitHub Pages, 前端
category: 博客
summary: 我的个人技术博客正式上线了，基于 GitHub Pages 免费托管，零成本、零维护。这篇文章分享一下博客的搭建思路。
pinned: true
weight: 1
---

经过一段时间的准备，我的个人技术博客终于上线了 🎉

## 为什么搭建博客

写博客是**对自己知识体系的整理**。很多知识当时觉得懂了，真正写出来才发现理解得不够透彻。把思路梳理成文字，是对自己最好的复习。

另外，技术人需要一块自己的地盘。社交媒体上的内容随时可能消失，而这里的一切都在我的掌控之中。

## 技术选型

| 项目 | 选择 | 理由 |
| --- | --- | --- |
| 托管 | GitHub Pages | 免费、稳定、全球 CDN |
| 构建 | Node.js 脚本 | 零框架依赖，完全可控 |
| 写作 | Markdown | 简单纯粹，专注内容 |
| 高亮 | highlight.js | 轻量、主题丰富 |

核心构建脚本只有短短几行：

```js
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';

const marked = new Marked(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    },
  })
);
```

## 以后写什么

- **编程实践**：遇到的坑、解决的过程、沉淀的经验
- **技术教程**：从零开始的系列文章
- **工具推荐**：提升效率的开发工具
- **随想**：偶尔发发牢骚和感悟

> Talk is cheap. Show me the code.

最后，欢迎通过邮件或者 GitHub 联系我，一起交流技术！🚀
