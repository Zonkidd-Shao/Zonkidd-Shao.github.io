/**
 * zonkidd.blog 构建脚本
 * 将 posts/*.md 渲染为静态 HTML 站点，输出到 docs/
 *
 * 用法：node build.mjs
 * 新增文章：在 posts/ 目录创建 .md 文件（含 frontmatter），重新构建即可。
 *
 * frontmatter 字段：
 *   title:    文章标题（必填）
 *   date:     发布日期，格式 YYYY-MM-DD（必填，默认 1970-01-01）
 *   tags:     标签，逗号分隔（可选）
 *   category: 分类，一个（可选，默认"未分类"）
 *   summary:  摘要 / 副标题（可选，不填则自动截取正文前 120 字）
 *   pinned:   是否置顶 true/false（可选，默认 false）。置顶文章永远排在最前
 *   weight:   自定义排序权重（可选，数字越小越靠前，默认 9999）。排序优先级：pinned → weight → date
 */
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const POSTS_DIR = path.join(ROOT, 'posts');
const SRC_DIR = path.join(ROOT, 'src');
const OUT_DIR = path.join(ROOT, 'docs');

/* ---------------- Markdown 渲染器 ---------------- */
const marked = new Marked(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      if (lang === 'mermaid') return code; // mermaid 不做 hljs 高亮，交给前端 mermaid.js 渲染
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    },
  })
);
marked.use({
  gfm: true,
  breaks: false,
});

// HTML 实体反转义（marked 默认会把 code 内的特殊字符做 escape）
function htmlDecode(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

// Markdown → HTML，同时将 ```mermaid 代码块替换为 <div class="mermaid"> 供前端渲染
function renderMarkdown(body) {
  let html = marked.parse(body);
  // 正则替换：<pre><code class="hljs language-mermaid">…</code></pre> → <div class="mermaid" data-source="源码">源码</div>
  html = html.replace(
    /<pre><code class="hljs language-mermaid">([\s\S]*?)<\/code><\/pre>/g,
    function (_match, inner) {
      const source = htmlDecode(inner.trim());
      return `<div class="mermaid" data-source="${escapeHtml(source)}">${escapeHtml(source)}</div>\n`;
    }
  );
  return html;
}

/* ---------------- 站点配置 ---------------- */
const SITE = {
  title: 'Zonkidd 的技术博客',
  name: 'Zonkidd',
  subtitle: '记录代码、探索技术、分享思考',
  author: 'Zonkidd-Shao',
  email: 'zonkidd.shao@foxmail.com',
  github: 'https://github.com/Zonkidd-Shao',
  description: 'Zonkidd 的个人技术博客 —— 分享编程、开发实践与技术思考。',
};

/* ---------------- 工具函数 ---------------- */
function slugify(relativePath) {
  // 将相对路径（如 "文章/函数题/xxx.md"）转为安全的 slug
  // 去掉 .md 后缀，路径分隔符替换为 -
  const withoutExt = relativePath.replace(/\.md$/, '');
  return withoutExt.split(path.sep).join('-').split('/').join('-');
}

// 递归收集目录下所有 .md 文件，返回相对 baseDir 的路径数组
function collectMdFiles(dir, baseDir = dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      results.push(...collectMdFiles(full, baseDir));
    } else if (ent.isFile() && ent.name.endsWith('.md')) {
      results.push(path.relative(baseDir, full));
    }
  }
  return results;
}

function parseFrontmatter(raw) {
  const fm = {};
  let body = raw;
  if (raw.startsWith('---')) {
    const end = raw.indexOf('\n---', 4);
    if (end !== -1) {
      const block = raw.slice(4, end);
      body = raw.slice(end + 4);
      for (const line of block.split('\n')) {
        const idx = line.indexOf(':');
        if (idx === -1) continue;
        const key = line.slice(0, idx).trim();
        let val = line.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        fm[key] = val;
      }
    }
  }
  // 去掉 body 开头的空行
  body = body.replace(/^\n+/, '');
  return { fm, body };
}

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function excerpt(html, maxLen = 120) {
  const text = stripHtml(html);
  return text.length > maxLen ? text.slice(0, maxLen) + '…' : text;
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d)) return dateStr;
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ---------------- 页面模板 ---------------- */
function layout({ title, prefix, body, activeNav = '', customNav = [] }) {
  const navItems = [
    { key: 'home', href: prefix + 'index.html', label: '首页' },
    ...customNav.map((p) => ({
      key: p.slug,
      href: prefix + `${p.slug}.html`,
      label: p.navLabel || p.title,
    })),
    { key: 'categories', href: prefix + 'categories.html', label: '分类' },
    { key: 'tags', href: prefix + 'tags.html', label: '标签' },
    { key: 'about', href: prefix + 'about.html', label: '关于' },
  ];
  const navHtml = navItems
    .map(
      (n) =>
        `<a class="nav-link ${n.key === activeNav ? 'active' : ''}" href="${n.href}">${n.label}</a>`
    )
    .join('');
  const pageTitle = title ? `${title} · ${SITE.name}` : SITE.title;

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(pageTitle)}</title>
<meta name="description" content="${escapeHtml(SITE.description)}">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🚀</text></svg>">
<link rel="stylesheet" href="${prefix}assets/style.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/github.min.css" media="(prefers-color-scheme: light)">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/github-dark.min.css" media="(prefers-color-scheme: dark)">
</head>
<body>
<header class="site-header">
  <div class="container header-inner">
    <a class="brand" href="${prefix}index.html">
      <span class="brand-mark">&lt;/&gt;</span>
      <span class="brand-name">${SITE.name}</span>
    </a>
    <nav class="site-nav">${navHtml}</nav>
    <button id="theme-toggle" class="theme-toggle" aria-label="切换主题" title="切换亮/暗色主题">
      <svg class="icon-sun" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
      <svg class="icon-moon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
    </button>
  </div>
</header>
<main class="site-main">${body}</main>
<footer class="site-footer">
  <div class="container footer-inner">
    <p>© ${new Date().getFullYear()} ${SITE.name} · Powered by <a href="https://pages.github.com/" target="_blank" rel="noopener">GitHub Pages</a></p>
    <p class="footer-links">
      <a href="${SITE.github}" target="_blank" rel="noopener">GitHub</a>
      <a href="mailto:${SITE.email}">Email</a>
    </p>
  </div>
</footer>
<script src="https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', function () {
    if (window.mermaid) {
      var theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'default';
      mermaid.initialize({
        startOnLoad: true,
        theme: theme,
        securityLevel: 'loose',
        flowchart: { useMaxWidth: true, htmlLabels: true, curve: 'basis' },
        sequence: { useMaxWidth: true },
        gantt: { useMaxWidth: true }
      });
    }
  });
</script>
<script src="${prefix}assets/main.js"></script>
</body>
</html>`;
}

function tagChip(tag, prefix) {
  return `<a class="tag-chip" href="${prefix}tags.html#${encodeURIComponent(tag)}"># ${escapeHtml(tag)}</a>`;
}

function postCard(post, prefix) {
  const tags = (post.tags || [])
    .map((t) => `<span class="card-tag">${escapeHtml(t)}</span>`)
    .join('');
  const pinnedBadge = post.pinned ? '<span class="pinned-badge" title="置顶文章">📌 置顶</span>' : '';
  return `<article class="post-card">
  <div class="card-meta">${pinnedBadge}<time>${formatDate(post.date)}</time><span class="card-category">${escapeHtml(post.category || '')}</span></div>
  <h2 class="card-title"><a href="${prefix}posts/${post.slug}.html">${escapeHtml(post.title)}</a></h2>
  <p class="card-summary">${escapeHtml(post.summary)}</p>
  ${tags ? `<div class="card-tags">${tags}</div>` : ''}
</article>`;
}

/* ---------------- 页面生成 ---------------- */
function renderIndex(posts) {
  const cards = posts.map((p) => postCard(p, '')).join('\n  ');
  const body = `
<section class="hero">
  <div class="container">
    <div class="hero-glow"></div>
    <p class="hero-kicker">HELLO, WORLD 👋</p>
    <h1 class="hero-title">${SITE.name}</h1>
    <p class="hero-subtitle">${SITE.subtitle}</p>
    <div class="hero-actions">
      <a class="btn btn-primary" href="#posts">阅读文章</a>
      <a class="btn btn-ghost" href="${SITE.github}" target="_blank" rel="noopener">GitHub →</a>
    </div>
  </div>
</section>
<section class="section" id="posts">
  <div class="container">
    <h2 class="section-title">最新文章 <span class="section-count">${posts.length}</span></h2>
    <div class="post-grid">
  ${cards}
    </div>
  </div>
</section>`;
  return layout({ title: '', prefix: '', body, activeNav: 'home', customNav });
}

function renderPost(post, customNav) {
  const tags = (post.tags || []).map((t) => tagChip(t, '../')).join(' ');
  const prev = post.prev ? `<a class="nav-post prev" href="../posts/${post.prev.slug}.html">← ${escapeHtml(post.prev.title)}</a>` : '<span></span>';
  const next = post.next ? `<a class="nav-post next" href="../posts/${post.next.slug}.html">${escapeHtml(post.next.title)} →</a>` : '<span></span>';
  const body = `
<article class="post-page">
  <div class="container post-container">
    <header class="post-header">
      <h1 class="post-title">${escapeHtml(post.title)}</h1>
      <div class="post-meta">
        <time>${formatDate(post.date)}</time>
        <span class="dot">·</span>
        <span>${post.readingTime} 分钟阅读</span>
      </div>
      ${tags ? `<div class="post-tags">${tags}</div>` : ''}
    </header>
    <div class="post-content markdown-body">
${post.html}
    </div>
    <nav class="post-pager">
      ${prev}
      ${next}
    </nav>
  </div>
</article>`;
  return layout({ title: post.title, prefix: '../', body, activeNav: '', customNav });
}

function renderPage(page, customNav) {
  const body = `
<section class="section page-head">
  <div class="container">
    <h1 class="page-title">${escapeHtml(page.title)}</h1>
    ${page.summary ? `<p class="page-desc">${escapeHtml(page.summary)}</p>` : ''}
  </div>
</section>
<section class="section">
  <div class="container about-card">
    <div class="markdown-body">
${page.html}
    </div>
  </div>
</section>`;
  return layout({ title: page.title, prefix: '', body, activeNav: page.slug, customNav });
}

function renderTags(allPosts, customNav) {
  const tagMap = new Map();
  for (const p of allPosts) {
    for (const t of p.tags || []) {
      if (!tagMap.has(t)) tagMap.set(t, []);
      tagMap.get(t).push(p);
    }
  }
  const sortedTags = [...tagMap.entries()].sort((a, b) => b[1].length - a[1].length);
  const cloud = sortedTags
    .map(([tag, posts]) => {
      const list = posts
        .map((p) => `<li>${p.pinned ? '<span class="pinned-pin" title="置顶">📌</span> ' : ''}<a href="posts/${p.slug}.html">${escapeHtml(p.title)}</a><time>${formatDate(p.date)}</time></li>`)
        .join('');
      return `<div class="tag-group" id="${encodeURIComponent(tag)}" data-collapsed="true">
        <button class="group-toggle" type="button" aria-expanded="false">
          <span class="group-title"><span class="tag-name-inner"># ${escapeHtml(tag)}</span> <span class="tag-count">${posts.length}</span></span>
          <span class="group-arrow" aria-hidden="true"></span>
        </button>
        <div class="group-content">
          <ul class="tag-posts">${list}</ul>
        </div>
      </div>`;
    })
    .join('\n  ');
  const chips = sortedTags
    .map(([tag, posts]) => `<a class="tag-chip" href="#${encodeURIComponent(tag)}"># ${escapeHtml(tag)} <em>${posts.length}</em></a>`)
    .join(' ');
  const body = `
<section class="section page-head">
  <div class="container">
    <h1 class="page-title">标签</h1>
    <p class="page-desc">按主题浏览全部文章，共 ${sortedTags.length} 个标签。点击标签标题或胶囊可聚焦查看该分组的文章。</p>
  </div>
</section>
<section class="section">
  <div class="container">
    <div class="tag-cloud">${chips}</div>
    <div class="tag-groups">${cloud}</div>
  </div>
</section>`;
  return layout({ title: '标签', prefix: '', body, activeNav: 'tags', customNav });
}

function renderCategories(allPosts, customNav) {
  const catMap = new Map();
  for (const p of allPosts) {
    const cat = p.category || '未分类';
    if (!catMap.has(cat)) catMap.set(cat, []);
    catMap.get(cat).push(p);
  }
  const sortedCats = [...catMap.entries()].sort((a, b) => b[1].length - a[1].length);
  const groups = sortedCats
    .map(([cat, posts]) => {
      const list = posts
        .map(
          (p) => `<li>
            ${p.pinned ? '<span class="pinned-pin" title="置顶">📌</span> ' : ''}<a href="posts/${p.slug}.html">${escapeHtml(p.title)}</a>
            <time>${formatDate(p.date)}</time>
          </li>`
        )
        .join('');
      return `<div class="tag-group" id="${encodeURIComponent(cat)}" data-collapsed="true">
        <button class="group-toggle" type="button" aria-expanded="false">
          <span class="group-title"><span class="tag-name-inner">${escapeHtml(cat)}</span> <span class="tag-count">${posts.length}</span></span>
          <span class="group-arrow" aria-hidden="true"></span>
        </button>
        <div class="group-content">
          <ul class="tag-posts">${list}</ul>
        </div>
      </div>`;
    })
    .join('\n  ');
  const chips = sortedCats
    .map(([cat, posts]) => `<a class="tag-chip" href="#${encodeURIComponent(cat)}">${escapeHtml(cat)} <em>${posts.length}</em></a>`)
    .join(' ');
  const body = `
<section class="section page-head">
  <div class="container">
    <h1 class="page-title">分类</h1>
    <p class="page-desc">按内容方向浏览文章，共 ${sortedCats.length} 个分类。点击分类标题或胶囊可聚焦查看该分组的文章。</p>
  </div>
</section>
<section class="section">
  <div class="container">
    <div class="tag-cloud">${chips}</div>
    <div class="tag-groups">${groups}</div>
  </div>
</section>`;
  return layout({ title: '分类', prefix: '', body, activeNav: 'categories', customNav });
}

function renderAbout(customNav) {
  const body = `
<section class="section page-head">
  <div class="container">
    <h1 class="page-title">关于我</h1>
  </div>
</section>
<section class="section">
  <div class="container about-card">
    <div class="markdown-body">
      <h2>你好，我是 ${SITE.name} 👋</h2>
      <p>一名热爱技术的开发者。这个博客用来记录我在编程、开发和工程实践中的思考与经验。</p>
      <h3>这个博客</h3>
      <ul>
        <li>基于 <strong>GitHub Pages</strong> 托管，完全免费、稳定</li>
        <li>静态站点，加载快、零维护成本</li>
        <li>写作使用 Markdown，添加新文章只需一条命令</li>
      </ul>
      <h3>联系方式</h3>
      <ul>
        <li>GitHub：<a href="${SITE.github}" target="_blank" rel="noopener">@${SITE.author}</a></li>
        <li>Email：<a href="mailto:${SITE.email}">${SITE.email}</a></li>
      </ul>
      <blockquote>Talk is cheap. Show me the code.</blockquote>
    </div>
  </div>
</section>`;
  return layout({ title: '关于', prefix: '', body, activeNav: 'about', customNav });
}

function render404(customNav = []) {
  const body = `
<section class="section page-head">
  <div class="container notfound">
    <h1 class="page-title">404</h1>
    <p class="page-desc">页面不存在或已被移动。</p>
    <a class="btn btn-primary" href="index.html">回到首页</a>
  </div>
</section>`;
  return layout({ title: '404', prefix: '', body, customNav });
}

/* ---------------- 构建主流程 ---------------- */
function readPosts() {
  if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR, { recursive: true });
  const relativeFiles = collectMdFiles(POSTS_DIR);
  const posts = relativeFiles
    .map((relPath) => {
      const raw = fs.readFileSync(path.join(POSTS_DIR, relPath), 'utf-8');
      const { fm, body } = parseFrontmatter(raw);
      const html = renderMarkdown(body);
      const tags = (fm.tags || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
      const pinned = fm.pinned === 'true' || fm.pinned === true;
      const weight = Number.isFinite(+fm.weight) && fm.weight !== '' && fm.weight != null ? +fm.weight : 9999;
      return {
        slug: slugify(relPath),
        title: fm.title || slugify(relPath),
        date: fm.date || '1970-01-01',
        category: fm.category || '未分类',
        tags,
        summary: fm.summary || excerpt(html, 120),
        html,
        readingTime: Math.max(1, Math.round(words / 300)),
        pinned,
        weight,
      };
    })
    .sort((a, b) => {
      // 排序优先级：1. pinned 置顶优先 2. weight 升序（小→大） 3. date 降序（新→旧）
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      if (a.weight !== b.weight) return a.weight - b.weight;
      return a.date < b.date ? 1 : -1;
    });

  // 计算上一篇 / 下一篇
  posts.forEach((p, i) => {
    p.prev = posts[i + 1] || null;
    p.next = posts[i - 1] || null;
  });
  return posts;
}

function copyAssets() {
  const assetsSrc = path.join(SRC_DIR, 'assets');
  const assetsOut = path.join(OUT_DIR, 'assets');
  fs.mkdirSync(assetsOut, { recursive: true });
  for (const f of fs.readdirSync(assetsSrc)) {
    fs.copyFileSync(path.join(assetsSrc, f), path.join(assetsOut, f));
  }
}

/* 读取自定义栏目页：pages/*.md → 独立页面 + 导航栏目
 * frontmatter 支持：
 *   title  栏目标题（必填，同时用作导航文字）
 *   nav    是否显示在顶部导航，false 则仅生成页面不加入导航（默认 true）
 *   summary 栏目页副标题（可选）
 */
function readPages() {
  const dir = path.join(ROOT, 'pages');
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .sort();
  return files.map((f) => {
    const raw = fs.readFileSync(path.join(dir, f), 'utf-8');
    const { fm, body } = parseFrontmatter(raw);
    return {
      slug: slugify(f),
      title: fm.title || slugify(f),
      navLabel: fm.navLabel || fm.title || slugify(f),
      nav: fm.nav !== 'false',
      summary: fm.summary || '',
      html: renderMarkdown(body),
    };
  });
}

function cleanOut() {
  // 沙箱环境拦截删除 API，改为全量覆盖写。
  // 每次构建所有页面都会重新生成并覆盖；如需彻底清理残留文件，
  // 可在普通终端中手动删除 public/ 目录。
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// 让站点支持 GitHub Pages 的 404 页面（仅根路径部署时）
function write404(customNav) {
  fs.writeFileSync(path.join(OUT_DIR, '404.html'), render404(customNav));
}

/* ---------------- 执行 ---------------- */
console.log('🚀 开始构建 zonkidd.blog ...');

cleanOut();
copyAssets();

const posts = readPosts();
console.log(`📄 发现 ${posts.length} 篇文章`);

const pages = readPages();
const customNav = pages.filter((p) => p.nav);
console.log(`📑 发现 ${pages.length} 个自定义栏目页`);

// 首页 & 文章页
fs.writeFileSync(path.join(OUT_DIR, 'index.html'), renderIndex(posts, customNav));
for (const p of posts) {
  const dir = path.join(OUT_DIR, 'posts');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${p.slug}.html`), renderPost(p, customNav));
}

// 自定义栏目页
for (const page of pages) {
  fs.writeFileSync(path.join(OUT_DIR, `${page.slug}.html`), renderPage(page, customNav));
}

// 标签页 & 分类页 & 关于页 & 404
fs.writeFileSync(path.join(OUT_DIR, 'tags.html'), renderTags(posts, customNav));
fs.writeFileSync(path.join(OUT_DIR, 'categories.html'), renderCategories(posts, customNav));
fs.writeFileSync(path.join(OUT_DIR, 'about.html'), renderAbout(customNav));
write404(customNav);

console.log('✅ 构建完成 → docs/');
