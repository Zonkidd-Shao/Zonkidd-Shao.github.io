---
title: 一套好用的 Git 协作工作流
date: 2026-08-01
tags: Git, 工程实践, 协作
category: 技术
summary: 团队协作中，一套清晰一致的 Git 工作流能省去大量沟通成本。分享我常用的分支模型和提交规范。
---

团队协作开发中，**清晰一致的 Git 工作流**比任何工具都重要。混乱的分支和随意的提交信息，是代码库腐烂的开始。

## 分支模型

我倾向使用简洁的 `main` + `feature` 分支模型：

```
main  ──●────────●────────●──
         \      / \      /
feature   ●──●    ●──●
```

- `main`：永远保持可发布状态
- `feature/*`：新功能、修复都从这里开
- `release/*`：发布前的最后调整

## 提交信息规范

使用 Conventional Commits 规范，让历史一目了然：

```bash
# 提交信息格式
<type>(<scope>): <subject>

# 示例
feat(auth): 新增登录页记住密码功能
fix(api): 修复用户列表接口返回 500 的问题
docs(readme): 补充快速开始文档
refactor(utils): 重构日期格式化工具函数
```

常用 type：

| Type | 含义 |
| --- | --- |
| `feat` | 新功能 |
| `fix` | 修复 bug |
| `docs` | 文档变更 |
| `refactor` | 重构（不改变行为） |
| `perf` | 性能优化 |
| `test` | 测试相关 |
| `chore` | 构建/工具链 |

## 日常操作模板

```bash
# 开新功能
git checkout -b feature/login-page

# 小步提交
git add .
git commit -m "feat(login): 实现密码加密存储"

# 同步主分支
git fetch origin
git rebase origin/main

# 合并回主分支
git checkout main
git merge --no-ff feature/login-page
```

## 几个实用技巧

1. **小步提交**：一次提交只做一件事，方便回滚和 review
2. **写清楚 Why**：提交信息说明「为什么改」，而不是「改了什么」
3. **善用 rebase**：合并前用 `rebase` 保持历史线性，但**不要** rebase 已推送的分支

> 好的提交历史，是代码库最忠实的文档。

工作流没有银弹，关键是**团队一致**。选定一套规则，写进 README，严格执行，收益会随时间复利增长。
