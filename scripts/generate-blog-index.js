/**
 * generate-blog-index.js - 生成博客索引页 /blog/index.html
 * 直接读取 dist/blog/*.html，提取标题，生成列表页
 * 运行: node scripts/generate-blog-index.js
 */

const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, '..', 'dist', 'blog');
const DIST_DIR = path.join(__dirname, '..', 'dist');

function escapeHtml(s) {
  if (!s) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function generateBlogIndex() {
  if (!fs.existsSync(BLOG_DIR)) {
    console.log('  ⚠️  dist/blog/ 不存在，跳过博客索引生成');
    return;
  }

  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.html') && f !== 'manifest.json' && f !== 'index.html');
  if (files.length === 0) {
    console.log('  ⚠️  dist/blog/ 没有 HTML 文件');
    return;
  }

  // 读取 manifest 获取 description
  let descMap = {};
  const manifestPath = path.join(BLOG_DIR, 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      manifest.forEach(a => { descMap[a.url] = a.description || ''; });
    } catch(e) {}
  }

  // 读取每篇文章的标题
  const articles = files.map(f => {
    const filePath = path.join(BLOG_DIR, f);
    const content = fs.readFileSync(filePath, 'utf-8');
    const titleMatch = content.match(/<title>(.*?)<\/title>/);
    let title = titleMatch ? titleMatch[1] : f.replace('.html', '');
    // 清理标题中的 " | AI Tools Hub"
    title = title.replace(/\s*\|\s*AI Tools Hub\s*$/, '');
    const url = '/blog/' + f;
    return { title, url, description: descMap[url] || '' };
  });

  articles.sort((a, b) => a.title.localeCompare(b.title));

  const listHtml = articles.map(a =>
    '          <li class="blog-list-item"><a href="' + a.url + '">' + escapeHtml(a.title) + '</a>' +
    (a.description ? '<p class="blog-list-desc">' + escapeHtml(a.description.substring(0, 120)) + '...</p>' : '') +
    '</li>'
  ).join('\n');

  const html = '<!DOCTYPE html>\n' +
'<html lang="en">\n' +
'<head>\n' +
'  <meta charset="UTF-8">\n' +
'  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
'  <title>AI Tools Blog - Guides, Reviews & Comparisons | AI Tools Hub</title>\n' +
'  <meta name="description" content="Read expert AI tool reviews, comparisons, and guides. ' + articles.length + ' articles to help you choose the best AI tools in 2026.">\n' +
'  <meta property="og:title" content="AI Tools Blog - ' + articles.length + ' Articles | AI Tools Hub">\n' +
'  <meta property="og:description" content="Expert AI tool reviews, comparisons, and buying guides.">\n' +
'  <meta property="og:type" content="blog">\n' +
'  <link rel="canonical" href="https://aitoolshub.cn/blog/">\n' +
'  <link rel="stylesheet" href="/css/style.css">\n' +
'  <script type="application/ld+json">\n' +
'  {"@context":"https://schema.org","@type":"Blog","name":"AI Tools Hub Blog","description":"Expert AI tool reviews and guides","url":"https://aitoolshub.cn/blog/"}\n' +
'  </script>\n' +
'</head>\n' +
'<body>\n' +
renderHeader('/blog') + '\n' +
'  <div class="container">\n' +
'    <div class="page" style="max-width:900px;margin:40px auto;">\n' +
'      <h1>AI Tools Blog</h1>\n' +
'      <p class="article-meta">' + articles.length + ' articles · Expert reviews, comparisons, and buying guides</p>\n' +
'      <div class="blog-intro" style="background:var(--bg-secondary);padding:24px;border-radius:12px;margin:24px 0;">\n' +
'        <p>Welcome to the AI Tools Hub blog. We publish in-depth reviews, head-to-head comparisons, and practical guides to help you navigate the rapidly evolving AI tools landscape. All articles are researched and written by our editorial team.</p>\n' +
'      </div>\n' +
'      <ul class="blog-list" style="list-style:none;padding:0;">\n' +
listHtml + '\n' +
'      </ul>\n' +
'    </div>\n' +
'  </div>\n' +
renderFooter() + '\n' +
'</body>\n' +
'</html>';

  // 写入文件
  const outPath = path.join(DIST_DIR, 'blog', 'index.html');
  fs.writeFileSync(outPath, html, 'utf-8');
  console.log('  [OK] blog/index.html (' + articles.length + ' articles)');
}

// 从 build.js 中借用的 header/footer 渲染函数（简化版）
// 直接内联，不依赖 build.js
function renderHeader(activePath) {
  return '  <header class="header">\n' +
'    <div class="header-inner">\n' +
'      <a href="/" class="logo">\n' +
'        <div class="logo-icon"><svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg></div>\n' +
'        AI Tools Hub\n' +
'      </a>\n' +
'      <nav class="nav">\n' +
'        <a href="/"' + (activePath === '/' ? ' class="active"' : '') + '>Home</a>\n' +
'        <a href="/categories.html"' + (activePath.includes('categor') ? ' class="active"' : '') + '>Categories</a>\n' +
'        <a href="/compare/chatgpt-vs-claude.html"' + (activePath.includes('compare') ? ' class="active"' : '') + '>Compare</a>\n' +
'        <a href="/blog/index.html"' + (activePath.includes('blog') ? ' class="active"' : '') + '>Blog</a>\n' +
'        <a href="/submit.html" class="nav-cta">Submit Tool</a>\n' +
'      </nav>\n' +
'    </div>\n' +
'  </header>';
}

function renderFooter() {
  return '  <footer class="footer">\n' +
'    <div class="footer-inner">\n' +
'      <p>&copy; 2026 AI Tools Hub. All rights reserved.</p>\n' +
'      <div class="footer-links">\n' +
'        <a href="/privacy.html">Privacy Policy</a>\n' +
'        <a href="/terms.html">Terms of Service</a>\n' +
'        <a href="/about.html">About</a>\n' +
'        <a href="/contact.html">Contact</a>\n' +
'      </div>\n' +
'    </div>\n' +
'  </footer>';
}

// 主流程
console.log('📝 Generating blog index page...');
console.log('='.repeat(50));
generateBlogIndex();
console.log('='.repeat(50));
console.log('✅ Blog index page complete!');
