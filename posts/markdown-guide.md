---
title: Markdown 写作完全指南
date: 2026-07-20
tags: Markdown, 写作, 效率
category: 技术
summary: Markdown 是技术写作的事实标准。从基础语法到进阶技巧，一篇文章带你掌握这门「以内容为中心」的写作语言。
---

Markdown 的设计哲学很简单：**让作者专注于内容，而不是排版**。它用纯文本表达结构，渲染交给工具。

## 为什么是 Markdown

- **通用**：GitHub、Notion、微信编辑器都支持
- **可移植**：纯文本，永远可读，永远可迁移
- **专注**：写作时不打断思路
- **版本友好**：和 Git 天然契合

## 基础语法速查

### 标题

```markdown
# 一级标题
## 二级标题
### 三级标题
```

### 强调与代码

````markdown
**加粗文字** 和 *斜体文字*

行内代码用反引号包裹：`npm run build`

```js
// 代码块用三个反引号
const greeting = "Hello, World!";
```
````

### 列表与引用

```markdown
- 无序列表项
- 另一个列表项

1. 有序列表第一项
2. 有序列表第二项

> 这是一段引用文字
```

### 链接与图片

```markdown
[链接文字](https://example.com)
![图片描述](./image.png)
```

## 进阶技巧

### 表格

```markdown
| 语法 | 说明 |
| --- | --- |
| `**text**` | 加粗 |
| `*text*` | 斜体 |
```

### 任务列表

```markdown
- [x] 已完成的任务
- [ ] 待办的任务
```

### 锚点链接

```markdown
[跳转到标题](#进阶技巧)
```

## 我的写作工作流

```bash
# 新建文章
touch posts/$(date +%Y-%m-%d)-my-post.md

# 写作 → 构建 → 预览
npm run build
npm run serve
```

写完直接推送到 GitHub，Pages 自动更新，全程无感。

> 写作的秘诀只有一个：开始写。

工具越简单，写作越持久。愿你的文字找到它的读者。✍️
