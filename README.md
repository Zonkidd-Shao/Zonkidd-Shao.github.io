# Zonkidd 的个人技术博客

基于 **GitHub Pages** 的静态博客，使用 Node.js 构建脚本将 Markdown 渲染为 HTML。

## 快速开始

```bash
# 安装依赖
npm install

# 构建站点（输出到 docs/）
npm run build

# 本地预览
npm run serve
```

## 添加新文章

在 `posts/` 目录下新建 Markdown 文件，开头包含 frontmatter 元信息：

```markdown
---
title: 文章标题
date: 2026-08-07
category: 技术            # 分类（可选，默认"未分类"）
tags: 标签1, 标签2
summary: 文章摘要（可选，默认自动截取正文）
---

这里是文章正文，支持标准 Markdown 语法。
```

然后运行 `npm run build` 重新生成站点。

## 增加栏目（导航页）

在 `pages/` 目录放一个 Markdown 文件即可生成独立栏目页并自动加入顶部导航：

```markdown
---
title: 项目            # 栏目标题（同时用作导航文字）
summary: 栏目简介      # 可选，显示在页面顶部
nav: true             # 是否显示在导航栏（默认 true，设 false 则不显示）
---

这里是栏目正文，支持标准 Markdown 语法。
```

例如创建 `pages/projects.md` 即可得到「项目」栏目页。

## 部署到 GitHub Pages

### 模式 A：GitHub Actions 自动构建（推荐 ⭐）

仓库已内置 `.github/workflows/pages.yml` 工作流，**push 源码后云端自动构建并部署**，本地无需任何操作。

1. 创建仓库 `Zonkidd-Shao.github.io`（Public）并推送代码：

```bash
git remote add origin https://github.com/Zonkidd-Shao/Zonkidd-Shao.github.io.git
git push -u origin main
```

2. 仓库 **Settings → Pages**，Source 选择 **GitHub Actions**
3. 等待 Actions 运行完成（仓库 Actions 页可看进度），访问 `https://zonkidd-shao.github.io`

以后写文章：改 `posts/*.md` → `git push` 即可，自动构建部署。

### 模式 B：分支部署（无需 Actions，但需本地构建）

1. 本地执行 `npm run build` 生成 `docs/`
2. 推送代码后，仓库 **Settings → Pages**，Source 选择：
   - Branch：`main`
   - Folder：`/docs`

两种模式二选一，**不要同时启用**。

## 目录结构

```
blog/
├── build.mjs          # 构建脚本
├── package.json
├── posts/             # Markdown 文章源文件
├── pages/             # 自定义栏目页（每个 .md 生成一个导航栏目）
├── src/assets/        # 样式与脚本
└── docs/              # 构建产物（GitHub Pages 部署目录）
```
