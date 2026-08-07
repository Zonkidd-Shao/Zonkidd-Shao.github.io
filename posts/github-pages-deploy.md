---
title: 用 GitHub Pages 免费托管你的个人网站
date: 2026-07-15
tags: GitHub Pages, 部署, 前端
category: 技术
summary: GitHub Pages 提供免费、稳定的静态网站托管，带宽和 HTTPS 全包。这篇文章是完整的零基础部署教程。
---

想拥有一个自己的网站，又不想花钱买服务器？**GitHub Pages** 就是答案：免费托管、全球 CDN、自动 HTTPS、无限流量。

## 什么是 GitHub Pages

GitHub Pages 是 GitHub 提供的静态网站托管服务，直接关联你的仓库：

- 用户名仓库 `username.github.io` → 你的个人主页
- 项目仓库的 `gh-pages` 分支 → 项目文档站

## 两种部署方式

### 方式一：用户名仓库（推荐）

创建名为 `username.github.io` 的仓库，把站点文件推到 `main` 分支即可：

```bash
git init
git add .
git commit -m "init blog"
git branch -M main
git remote add origin https://github.com/zonkidd/zonkidd.github.io.git
git push -u origin main
```

几分钟后，访问 `https://zonkidd.github.io` 就能看到你的网站。

### 方式二：项目仓库 + GitHub Actions

在项目仓库中配置自动构建：

```yaml
name: Deploy to Pages
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci && npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: public
```

## 常见问题

| 问题 | 解决方案 |
| --- | --- |
| 页面 404 | 检查仓库是否设置为主分支/根目录 |
| CSS 不生效 | 确认资源使用相对路径 |
| 自定义域名 | 在 `Settings → Pages` 中配置 |

## 进阶配置

- **自定义域名**：绑定自己的域名，需要配置 CNAME
- **自定义 404**：放一个 `404.html` 就能生效
- **强制 HTTPS**：Settings 里一键开启

> 免费的东西，往往最值得认真对待。

希望这篇文章能帮你的第一个网站顺利上线。如果遇到问题，欢迎在评论区交流！🚀
