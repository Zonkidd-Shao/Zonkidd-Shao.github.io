"""迁移脚本：将旧格式 posts → Hugo Stack 格式 content/post/"""
import os, re, shutil

SRC = r'E:\Code\Zonkidd-Shao.github.io\posts\文章'
DST = r'E:\Code\Zonkidd-Shao.github.io\hugo_site\content\post'

def parse_frontmatter(text):
    fm = {}
    body = text
    if text.startswith('---'):
        end = text.index('\n---', 4)
        block = text[4:end]
        body = text[end+4:].lstrip('\n')
        for line in block.split('\n'):
            if ':' not in line: continue
            idx = line.index(':')
            key = line[:idx].strip()
            val = line[idx+1:].strip().strip('"').strip("'")
            fm[key] = val
    return fm, body

def convert_fm(fm, slug):
    """旧 frontmatter → Hugo Stack YAML frontmatter"""
    lines = ['---']
    lines.append(f'title: "{fm.get("title", slug)}"')
    lines.append(f'date: {fm.get("date", "2026-01-01")}')
    
    # description (原 summary)
    desc = fm.get('summary', '').replace('"', "'")
    if desc:
        lines.append(f'description: "{desc}"')
    
    # categories → 层级路径数组
    cat = fm.get('category', '')
    cats = []
    if cat and cat != '未分类':
        cats.append(cat)
    if cats:
        lines.append('categories:')
        for c in cats:
            lines.append(f'  - {c}')
    
    # tags → YAML 列表
    tags = fm.get('tags', '')
    if tags:
        tag_list = [t.strip() for t in tags.split(',') if t.strip()]
        if tag_list:
            lines.append('tags:')
            for t in tag_list:
                lines.append(f'  - {t}')
    
    # weight 保留
    weight = fm.get('weight', '')
    if weight:
        lines.append(f'weight: {weight}')
    
    # slug 使用原文件名 slug
    lines.append(f'slug: {slug}')
    
    lines.append('---')
    return '\n'.join(lines)

def slugify(name):
    """简单 slug：文件名去 .md"""
    return name.replace('.md', '').replace(' ', '-')

os.makedirs(DST, exist_ok=True)

count = 0
for root, dirs, files in os.walk(SRC):
    for f in files:
        if not f.endswith('.md'):
            continue
        src_path = os.path.join(root, f)
        slug = slugify(f)
        
        with open(src_path, 'r', encoding='utf-8') as fh:
            raw = fh.read()
        
        fm, body = parse_frontmatter(raw)
        new_fm = convert_fm(fm, slug)
        
        # 创建 post 子目录
        post_dir = os.path.join(DST, slug)
        os.makedirs(post_dir, exist_ok=True)
        
        with open(os.path.join(post_dir, 'index.md'), 'w', encoding='utf-8') as fh:
            fh.write(new_fm + '\n' + body)
        
        count += 1

print(f'Migrated {count} posts to {DST}')
