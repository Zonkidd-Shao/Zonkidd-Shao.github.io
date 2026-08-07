/* zonkidd.blog — 前端交互 */
(function () {
  'use strict';

  /* ---- 主题切换：localStorage 优先，其次跟随系统 ---- */
  const STORAGE_KEY = 'zonkidd-theme';
  const toggleBtn = document.getElementById('theme-toggle');

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) { /* ignore */ }

    // Mermaid 主题同步并重新渲染
    if (window.mermaid) {
      try {
        const mmdTheme = theme === 'dark' ? 'dark' : 'default';
        window.mermaid.initialize({
          startOnLoad: false,
          theme: mmdTheme,
          securityLevel: 'loose',
          flowchart: { useMaxWidth: true, htmlLabels: true, curve: 'basis' },
          sequence: { useMaxWidth: true },
          gantt: { useMaxWidth: true }
        });
        const nodes = document.querySelectorAll('.markdown-body .mermaid');
        nodes.forEach(function (el, idx) {
          const source = el.getAttribute('data-source') || el.textContent;
          if (!source) return;
          // 重置渲染标记 + 恢复源码
          el.removeAttribute('data-processed');
          el.textContent = source;
          const id = 'mmd-' + Date.now() + '-' + idx;
          try {
            // mermaid 10.x: render(id, source).then() 或用 mermaid.run({ nodes: [...] })
            window.mermaid.run({ nodes: [el] }).catch(function () { /* ignore */ });
          } catch (e) { /* ignore render errors */ }
        });
      } catch (e) { /* ignore mermaid errors */ }
    }
  }

  function getInitialTheme() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) { /* ignore */ }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  applyTheme(getInitialTheme());

  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      const current = document.documentElement.getAttribute('data-theme');
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  /* ---- 系统主题变化时，若用户未手动设置则跟随 ---- */
  try {
    if (!localStorage.getItem(STORAGE_KEY)) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
        applyTheme(e.matches ? 'dark' : 'light');
      });
    }
  } catch (e) { /* ignore */ }

  /* ---- 代码块：添加语言标签 + 复制按钮 ---- */
  document.querySelectorAll('.markdown-body pre').forEach(function (pre) {
    const code = pre.querySelector('code');
    if (!code) return;

    // 语言标签
    const langMatch = (code.className || '').match(/language-([\w+-]+)/);
    if (langMatch) {
      const badge = document.createElement('span');
      badge.className = 'code-lang';
      badge.textContent = langMatch[1];
      pre.style.position = 'relative';
      pre.appendChild(badge);
    }

    // 复制按钮
    const btn = document.createElement('button');
    btn.className = 'code-copy';
    btn.textContent = '复制';
    btn.setAttribute('aria-label', '复制代码');
    pre.appendChild(btn);

    btn.addEventListener('click', function () {
      const text = code.innerText;
      const done = function () {
        btn.textContent = '✓ 已复制';
        setTimeout(function () { btn.textContent = '复制'; }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
      } else {
        fallbackCopy(text, done);
      }
    });
  });

  function fallbackCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
  }

  /* ---- 页脚年份 ---- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---- 分类/标签页：分组折叠/展开 + 聚焦模式 ---- */
  const COLLAPSE_KEY = 'zonkidd-collapse-v1';

  function loadCollapseState() {
    try {
      const raw = localStorage.getItem(COLLAPSE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveCollapseState(state) {
    try {
      localStorage.setItem(COLLAPSE_KEY, JSON.stringify(state));
    } catch (e) { /* ignore */ }
  }

  function setCollapsed(group, collapsed, save) {
    const toggle = group.querySelector('.group-toggle');
    const content = group.querySelector('.group-content');
    if (!toggle || !content) return;
    group.dataset.collapsed = collapsed ? 'true' : 'false';
    toggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    if (save) {
      const state = loadCollapseState();
      const pageKey = location.pathname.split('/').pop() || 'index';
      const groupId = group.id;
      if (groupId) {
        if (collapsed) state[pageKey + ':' + groupId] = true;
        else delete state[pageKey + ':' + groupId];
        saveCollapseState(state);
      }
    }
  }

  // 初始化折叠/展开 + 聚焦模式
  const collapseGroups = document.querySelectorAll('.tag-group');
  if (collapseGroups.length) {
    const savedState = loadCollapseState();
    const pageKey = location.pathname.split('/').pop() || 'index';
    const groupWrap = document.querySelector('.tag-groups');
    const pageTitle = document.querySelector('.page-title')
      ? (document.querySelector('.page-title').textContent || '').trim()
      : '';
    const isCategories = /分类/.test(pageTitle) || location.pathname.endsWith('categories.html');
    const isTags = /标签/.test(pageTitle) || location.pathname.endsWith('tags.html');

    // 恢复保存的折叠状态（分类页 / 标签页通用）
    collapseGroups.forEach(function (group) {
      const toggle = group.querySelector('.group-toggle');
      if (!toggle) return;
      const groupId = group.id;
      if (groupId && savedState[pageKey + ':' + groupId]) setCollapsed(group, true, false);
    });

    if (isCategories) {
      /* ---- 分类页：树形交互。点击标题 = 展开/收起该级，无聚焦模式 ---- */
      collapseGroups.forEach(function (group) {
        const toggle = group.querySelector('.group-toggle');
        if (!toggle) return;
        toggle.addEventListener('click', function () {
          const isCollapsed = group.dataset.collapsed === 'true';
          setCollapsed(group, !isCollapsed, true);
        });
      });

      function expandPath(group) {
        let el = group;
        while (el && el !== document.body) {
          if (el.classList && el.classList.contains('tag-group') && el.dataset.collapsed === 'true') {
            setCollapsed(el, false, false);
          }
          el = el.parentElement;
        }
      }

      document.querySelectorAll('.tag-cloud .tag-chip[href^="#"]').forEach(function (chip) {
        chip.addEventListener('click', function (e) {
          const hash = chip.getAttribute('href');
          if (!hash || hash.length < 2) return;
          e.preventDefault();
          const target = document.getElementById(decodeURIComponent(hash.slice(1)));
          if (!target) return;
          expandPath(target);
          try { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (err) { /* ignore */ }
          try { history.replaceState(null, '', hash); } catch (err) { location.hash = hash; }
        });
      });

      function applyCatHash() {
        if (location.hash && location.hash.length > 1) {
          const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
          if (target) {
            expandPath(target);
            try { target.scrollIntoView({ block: 'start' }); } catch (err) { /* ignore */ }
          }
        }
      }
      applyCatHash();
      window.addEventListener('hashchange', applyCatHash);
    } else {
      /* ---- 标签页：聚焦模式（点击分组标题仅显示该分组） ---- */
      let focusActiveId = null;
      let backBtn = null;

      collapseGroups.forEach(function (group) {
        const toggle = group.querySelector('.group-toggle');
        if (!toggle) return;
        toggle.addEventListener('click', function (e) {
          if (focusActiveId && focusActiveId === group.id) {
            const isCollapsed = group.dataset.collapsed === 'true';
            setCollapsed(group, !isCollapsed, true);
            return;
          }
          e.preventDefault();
          enterFocusMode(group.id, true);
        });
      });

      function ensureBackBtn() {
        if (backBtn) return backBtn;
        if (!groupWrap) return null;
        backBtn = document.createElement('div');
        backBtn.className = 'focus-back-bar';
        const label = isTags ? '显示全部标签' : '显示全部';
        backBtn.innerHTML =
          '<button type="button" class="focus-back-btn" aria-label="显示全部">' +
            '<span class="focus-back-icon" aria-hidden="true">←</span> ' +
            '<span class="focus-back-label">' + label + '</span> ' +
            '<span class="focus-active-name"></span>' +
          '</button>';
        groupWrap.parentNode.insertBefore(backBtn, groupWrap);
        backBtn.querySelector('.focus-back-btn').addEventListener('click', function () {
          exitFocusMode(true);
        });
        return backBtn;
      }

      function enterFocusMode(groupId, updateHash) {
        if (!groupId) return;
        const target = document.getElementById(groupId);
        if (!target || !target.classList.contains('tag-group')) return;
        focusActiveId = groupId;
        if (groupWrap) groupWrap.classList.add('focus-mode');
        collapseGroups.forEach(function (g) {
          if (g.id === groupId) {
            g.classList.remove('focus-hidden');
            g.classList.add('focus-active');
            if (g.dataset.collapsed === 'true') setCollapsed(g, false, false);
          } else {
            g.classList.add('focus-hidden');
            g.classList.remove('focus-active');
          }
        });
        const bar = ensureBackBtn();
        if (bar) {
          bar.style.display = '';
          const nameEl = bar.querySelector('.focus-active-name');
          if (nameEl) {
            const titleEl = target.querySelector('.tag-name-inner');
            nameEl.textContent = '｜当前：' + (titleEl ? titleEl.textContent.trim() : groupId);
          }
        }
        try {
          const rect = target.getBoundingClientRect();
          if (rect.top < 100 || rect.top > 400) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        } catch (e) { /* ignore */ }
        if (updateHash) {
          const newHash = '#' + encodeURIComponent(groupId);
          if (location.hash !== newHash) {
            try { history.replaceState(null, '', newHash); } catch (e) { location.hash = newHash; }
          }
        }
      }

      function exitFocusMode(updateHash) {
        focusActiveId = null;
        if (groupWrap) groupWrap.classList.remove('focus-mode');
        collapseGroups.forEach(function (g) {
          g.classList.remove('focus-hidden');
          g.classList.remove('focus-active');
          const groupId = g.id;
          if (groupId && savedState[pageKey + ':' + groupId]) {
            setCollapsed(g, true, false);
          }
        });
        if (backBtn) backBtn.style.display = 'none';
        if (updateHash && location.hash) {
          try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { location.hash = ''; }
        }
      }

      document.querySelectorAll('.tag-cloud .tag-chip[href^="#"]').forEach(function (chip) {
        chip.addEventListener('click', function (e) {
          const hash = chip.getAttribute('href');
          if (!hash || hash.length < 2) return;
          e.preventDefault();
          enterFocusMode(hash.slice(1), true);
        });
      });

      function applyHashFocus() {
        if (location.hash && location.hash.length > 1) {
          const id = location.hash.slice(1);
          const target = document.getElementById(id);
          if (target && target.classList.contains('tag-group')) {
            enterFocusMode(id, false);
            return;
          }
        }
        if (focusActiveId) exitFocusMode(false);
      }
      applyHashFocus();
      window.addEventListener('hashchange', function () { applyHashFocus(); });
    }
  }
})();
