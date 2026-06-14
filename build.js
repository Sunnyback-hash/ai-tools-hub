const fs = require('fs');
const path = require('path');

  const tools = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'tools.json'), 'utf-8'));
  
  // 动态日期：构建时自动生成当前日期
  const todayStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  // 版本号：强制 Wrangler 重新上传（每次构建不同）
  const buildVer = new Date().toISOString();

// Google AdSense code
const ADSENSE_CODE = '  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3362391181724689"\n     crossorigin="anonymous"></script>';

const CATEGORIES = {
  'ai-chatbot': { name: 'AI Chatbots', icon: 'message-circle', color: '#4F46E5' },
  'ai-image': { name: 'AI Image', icon: 'image', color: '#EC4899' },
  'ai-video': { name: 'AI Video', icon: 'video', color: '#F59E0B' },
  'ai-coding': { name: 'AI Coding', icon: 'code', color: '#10B981' },
  'ai-writing': { name: 'AI Writing', icon: 'edit-3', color: '#6366F1' },
  'ai-research': { name: 'AI Research', icon: 'search', color: '#8B5CF6' },
  'ai-audio': { name: 'AI Audio', icon: 'music', color: '#06B6D4' },
  'ai-design': { name: 'AI Design', icon: 'layout', color: '#F97316' },
  'ai-productivity': { name: 'AI Productivity', icon: 'zap', color: '#14B8A6' },
  'ai-marketing': { name: 'AI Marketing', icon: 'trending-up', color: '#EF4444' }
};

const PRICING_LABELS = { free: 'Free', freemium: 'Freemium', paid: 'Paid' };

function escapeHtml(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function getCategoryCount(cat) { return tools.filter(t => t.category === cat).length; }

function toolIconStyle(tool) {
  const c = CATEGORIES[tool.category];
  return c ? `background:${c.color}` : 'background:#6B7280';
}

function renderHeader(activePath) {
  return `  <header class="header">
    <div class="header-inner">
      <a href="/" class="logo">
        <div class="logo-icon"><svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg></div>
        AI Tools Hub
      </a>
      <nav class="nav">
        <a href="/"${activePath === '/' ? ' class="active"' : ''}>Home</a>
        <a href="/categories" ${activePath.includes('categor') ? 'class="active"' : ''}>Categories</a>
        <a href="/compare/chatgpt-vs-claude"${activePath.includes('compare') ? ' class="active"' : ''}>Compare</a>
        <a href="/blog/best-ai-tools-2026"${activePath.includes('blog') ? ' class="active"' : ''}>Blog</a>
        <a href="/submit" class="nav-cta">Submit Tool</a>
      </nav>
    </div>
  </header>`;
}

function renderFooter() {
  return `  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a href="/" class="logo"><div class="logo-icon"><svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg></div> AI Tools Hub</a>
          <p>Discover, compare and choose the best AI tools for your needs. Updated daily with the latest AI innovations.</p>
        </div>
        <div>
          <h4>Explore</h4>
          <ul>
            <li><a href="/">All Tools</a></li>
            <li><a href="/categories">Categories</a></li>
            <li><a href="/compare/chatgpt-vs-claude">Comparisons</a></li>
            <li><a href="/blog/best-ai-tools-2026">Blog</a></li>
          </ul>
        </div>
        <div>
          <h4>Resources</h4>
          <ul>
            <li><a href="/blog/best-ai-tools-2026">Best AI Tools 2026</a></li>
            <li><a href="/blog/best-free-ai-tools">Best Free AI Tools</a></li>
            <li><a href="/blog/ai-tools-for-students">AI for Students</a></li>
            <li><a href="/blog/ai-tools-for-business">AI for Business</a></li>
          </ul>
        </div>
        <div>
          <h4>Company</h4>
          <ul>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/terms">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2026 AI Tools Hub. All rights reserved. Product names and logos are trademarks of their respective owners.</p>
      </div>
    </div>
  </footer>`;
}

function renderToolCard(tool) {
  const initial = tool.name.charAt(0).toUpperCase();
  const tags = tool.tags.slice(0, 3).map(t => `<span class="tool-tag">${t}</span>`).join('');
  const badgeClass = tool.pricing === 'free' ? 'free' : tool.pricing;
  const priceText = tool.priceFrom === 0 ? 'Free' : (tool.pricing === 'freemium' ? 'Free plan' : `From $${tool.priceFrom}/mo`);
  const stars = '&#9733;'.repeat(Math.round(tool.rating)) + ' <span style="color:var(--text-tertiary)">' + (5 - Math.round(tool.rating)) + '</span>';
  return `    <a href="/tools/${tool.slug}" class="tool-card">
      <div class="tool-card-top">
        <div class="tool-icon" style="${toolIconStyle(tool)}">${initial}</div>
        <span class="tool-badge ${badgeClass}">${PRICING_LABELS[tool.pricing]}</span>
      </div>
      <h3>${escapeHtml(tool.name)}</h3>
      <p class="desc">${escapeHtml(tool.description)}</p>
      <div class="tool-card-tags">${tags}</div>
      <div class="tool-card-bottom">
        <div class="tool-rating">${stars} ${tool.rating}</div>
        <div class="tool-visit">Visit &rarr;</div>
      </div>
    </a>`;
}

function renderFeaturedBanner(tool) {
  const initial = tool.name.charAt(0).toUpperCase();
  return `    <div class="featured-banner">
      <div class="tool-icon" style="${toolIconStyle(tool)};width:56px;height:56px;font-size:26px;border-radius:12px">${initial}</div>
      <div style="flex:1">
        <h3>Featured: ${escapeHtml(tool.name)}</h3>
        <p>${escapeHtml(tool.description.substring(0, 120))}...</p>
      </div>
      <a href="/tools/${tool.slug}" class="visit-btn">Learn More</a>
    </div>`;
}

// ---- Generate Homepage ----
function generateHomepage() {
  const featured = tools.filter(t => t.featured);
  const catPills = Object.entries(CATEGORIES).map(([slug, cat]) =>
    `        <a href="/categories/${slug}" class="cat-pill">
          <span class="cat-icon cat-${slug}" style="width:20px;height:20px;border-radius:50%;display:inline-block"></span>
          ${cat.name}
          <span class="cat-count">${getCategoryCount(slug)}</span>
        </a>`
  ).join('\n');

  const featuredHtml = featured.slice(0, 2).map(renderFeaturedBanner).join('\n');
  const allCards = tools.slice(0, 18).map(renderToolCard).join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>AI Tools Hub - Discover, Compare & Choose the Best AI Tools (2026)</title>
  <meta name="description" content="Discover ${tools.length}+ AI tools across 10 categories. Compare features, pricing, and find the perfect AI tool for writing, coding, design, video, and more. Updated daily.">
  <!-- build:${buildVer} -->
  <meta property="og:title" content="AI Tools Hub - ${tools.length}+ Best AI Tools Compared">
  <meta property="og:description" content="Find and compare the best AI tools for 2026. Expert reviews, pricing comparisons, and curated recommendations.">
  <meta property="og:type" content="website">
  <link rel="canonical" href="https://aitoolshub.com/">
  <link rel="stylesheet" href="/css/style.css">
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"WebSite","name":"AI Tools Hub","url":"https://aitoolshub.com","description":"Discover and compare the best AI tools","potentialAction":{"@type":"SearchAction","target":"https://aitoolshub.com/?q={search_term_string}","query-input":"required name=search_term_string"}}
  </script>
  ${ADSENSE_CODE}
</head>
<body>
${renderHeader('/')}
  <section class="hero">
    <div class="container">
      <h1>Find the Perfect AI Tool<br>for Every Task</h1>
      <p>Compare ${tools.length}+ AI tools across 10 categories. Expert reviews, real pricing data, and side-by-side comparisons to help you decide.</p>
      <div class="search-wrap">
        <span class="search-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
        <input type="text" id="searchInput" placeholder="Search AI tools... (e.g. 'best AI writing tool')" autocomplete="off">
        <div class="search-suggestions" id="searchSuggestions"></div>
      </div>
      <div class="hero-stats">
        <div class="hero-stat"><div class="num">${tools.length}+</div><div class="label">AI Tools</div></div>
        <div class="hero-stat"><div class="num">10</div><div class="label">Categories</div></div>
        <div class="hero-stat"><div class="num">Weekly</div><div class="label">Updates</div></div>
      </div>
    </div>
  </section>

  <section class="categories">
    <div class="container">
      <h2>Browse by Category</h2>
      <div class="cat-grid">
${catPills}
      </div>
    </div>
  </section>

  <div class="container">
    <div class="tools-section">
${featuredHtml}
      <div class="tools-header">
        <h2>All AI Tools</h2>
        <div class="filter-bar">
          <button class="filter-btn active" data-filter="all">All</button>
          <button class="filter-btn" data-filter="free">Free</button>
          <button class="filter-btn" data-filter="freemium">Freemium</button>
          <button class="filter-btn" data-filter="paid">Paid</button>
        </div>
      </div>
      <div id="toolGrid" class="tool-grid">
${allCards}
      </div>
    </div>
  </div>

${renderFooter()}
  <script>
    const tools = ${JSON.stringify(tools.map(t => ({ name: t.name, slug: t.slug, description: t.description, category: t.category, pricing: t.pricing, priceFrom: t.priceFrom, rating: t.rating, tags: t.tags })))};
    const searchInput = document.getElementById('searchInput');
    const suggestionsBox = document.getElementById('searchSuggestions');
    const grid = document.getElementById('toolGrid');
    let activeFilter = 'all';
    let sugIndex = -1;

    function renderCards(list) {
      if (!list.length) { grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-secondary);padding:40px">No tools found matching your criteria.</p>'; return; }
      grid.innerHTML = list.map(t => {
        const c = ${JSON.stringify(CATEGORIES)};
        const catColor = c[t.category]?.color || '#6B7280';
        const badge = t.pricing === 'free' ? 'free' : t.pricing;
        const pricingLabels = {free:'Free',freemium:'Freemium',paid:'Paid'};
        return '<a href="/tools/' + t.slug + '" class="tool-card"><div class="tool-card-top"><div class="tool-icon" style="background:' + catColor + '">' + t.name[0] + '</div><span class="tool-badge ' + badge + '">' + (pricingLabels[t.pricing] || t.pricing) + '</span></div><h3>' + t.name + '</h3><p class="desc">' + t.description + '</p><div class="tool-card-tags">' + t.tags.slice(0,3).map(x=>'<span class="tool-tag">'+x+'</span>').join('') + '</div><div class="tool-card-bottom"><div class="tool-rating">&#9733; ' + t.rating + '</div><div class="tool-visit">Visit &rarr;</div></div></a>';
      }).join('');
    }

    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.dataset.filter;
        applyFilters();
      });
    });

    function applyFilters() {
      let list = tools;
      const q = searchInput.value.toLowerCase().trim();
      if (q) list = list.filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.tags.some(x => x.includes(q)) || t.category.includes(q));
      if (activeFilter !== 'all') list = list.filter(t => t.pricing === activeFilter);
      renderCards(list);
    }

    // ---- Search Suggestions ----
    function getMatches(q) {
      if (!q) return [];
      const lower = q.toLowerCase();
      const scored = tools.map(t => {
        let score = 0;
        const nameL = t.name.toLowerCase();
        const descL = t.description.toLowerCase();
        const catL = t.category.toLowerCase();
        if (nameL === lower) score += 100;
        else if (nameL.startsWith(lower)) score += 50;
        else if (nameL.includes(lower)) score += 30;
        if (t.tags.some(x => x.toLowerCase().startsWith(lower))) score += 20;
        if (descL.includes(lower)) score += 10;
        if (catL.includes(lower)) score += 5;
        return { t, score };
      }).filter(x => x.score > 0).sort((a, b) => b.score - a.score).slice(0, 8);
      return scored.map(x => x.t);
    }

    function showSuggestions() {
      const q = searchInput.value.trim();
      const matches = getMatches(q);
      sugIndex = -1;
      if (!matches.length) {
        suggestionsBox.innerHTML = q ? '<div class="search-suggestion-empty">No tools found. Press Enter to search.</div>' : '';
        suggestionsBox.classList.toggle('active', !!q);
        return;
      }
      const c = ${JSON.stringify(CATEGORIES)};
      suggestionsBox.innerHTML = matches.map((t, i) => {
        const color = c[t.category]?.color || '#6B7280';
        const catName = c[t.category]?.name || t.category;
        return '<div class="search-suggestion-item" data-slug="' + t.slug + '" data-index="' + i + '"><div class="sug-icon" style="background:' + color + '">' + t.name[0] + '</div><div class="sug-info"><div class="sug-name">' + t.name + '</div><div class="sug-meta">' + catName + ' &middot; ' + t.description.slice(0, 60) + '...</div></div><div class="sug-arrow">&rarr;</div></div>';
      }).join('');
      suggestionsBox.classList.add('active');
      suggestionsBox.querySelectorAll('.search-suggestion-item').forEach(el => {
        el.addEventListener('click', () => { window.location.href = '/tools/' + el.dataset.slug + '.html'; });
      });
    }

    function updateHighlight() {
      suggestionsBox.querySelectorAll('.search-suggestion-item').forEach((el, i) => {
        el.classList.toggle('active', i === sugIndex);
      });
    }

    searchInput.addEventListener('input', () => { applyFilters(); showSuggestions(); });

    searchInput.addEventListener('keydown', e => {
      const items = suggestionsBox.querySelectorAll('.search-suggestion-item');
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!suggestionsBox.classList.contains('active')) { showSuggestions(); return; }
        sugIndex = Math.min(sugIndex + 1, items.length - 1);
        updateHighlight();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (!suggestionsBox.classList.contains('active')) return;
        sugIndex = Math.max(sugIndex - 1, -1);
        updateHighlight();
      } else if (e.key === 'Enter') {
        if (suggestionsBox.classList.contains('active') && sugIndex >= 0 && items[sugIndex]) {
          e.preventDefault();
          window.location.href = '/tools/' + items[sugIndex].dataset.slug;
        } else if (items.length === 1) {
          e.preventDefault();
          window.location.href = '/tools/' + items[0].dataset.slug;
        } else {
          suggestionsBox.classList.remove('active');
        }
      } else if (e.key === 'Escape') {
        suggestionsBox.classList.remove('active');
      }
    });

    document.addEventListener('click', e => {
      if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
        suggestionsBox.classList.remove('active');
      }
    });

    searchInput.addEventListener('focus', showSuggestions);
  </script>
</body>
</html>`;
  write('index.html', html);
  console.log('  [OK] index.html');
}

// ---- Generate Tool Detail Pages ----
function generateToolPages() {
  tools.forEach(tool => {
    const cat = CATEGORIES[tool.category] || { name: tool.category, color: '#6B7280' };
    const alternatives = (tool.alternatives || []).map(slug => tools.find(t => t.slug === slug)).filter(Boolean);
    // Related tools: same category + shared tags, top 5
    const related = tools.filter(t => t.slug !== tool.slug).map(t => {
      let score = 0;
      if (t.category === tool.category) score += 3;
      (tool.tags || []).forEach(tag => { if ((t.tags || []).includes(tag)) score += 1; });
      return { tool: t, score };
    }).sort((a, b) => b.score - a.score).slice(0, 5).map(x => x.tool);
    const relatedHtml = related.length ? '<div class="detail-section"><h2>Related Tools</h2><div class="alt-list">' + related.map(t => {
      const rCat = CATEGORIES[t.category] || { color: '#6B7280' };
      return '<a href="/tools/' + t.slug + '" class="alt-item"><div class="alt-icon" style="background:' + rCat.color + '">' + t.name[0] + '</div><div class="alt-info"><h4>' + escapeHtml(t.name) + '</h4><p>' + escapeHtml(t.description.substring(0, 80)) + '...</p></div><div class="alt-arrow">&rarr;</div></a>';
    }).join('') + '</div></div>' : '';
    const prosHtml = tool.pros.map(p => `<div class="pro-item"><span>${escapeHtml(p)}</span></div>`).join('');
    const consHtml = tool.cons.map(c => `<div class="con-item"><span>${escapeHtml(c)}</span></div>`).join('');
    const altHtml = alternatives.map(a => {
      const altCat = CATEGORIES[a.category] || { color: '#6B7280' };
      return `<a href="/tools/${a.slug}" class="alt-item"><div class="alt-icon" style="background:${altCat.color}">${a.name[0]}</div><div class="alt-info"><h4>${escapeHtml(a.name)}</h4><p>${escapeHtml(a.description.substring(0, 80))}...</p></div><div class="alt-arrow">&rarr;</div></a>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(tool.name)} Review 2026 - ${escapeHtml(cat.name)} Tool | AI Tools Hub</title>
  <meta name="description" content="${escapeHtml(tool.description)}">
  <meta property="og:title" content="${escapeHtml(tool.name)} Review - AI Tools Hub">
  <meta property="og:description" content="${escapeHtml(tool.description.substring(0, 160))}">
  <link rel="canonical" href="https://aitoolshub.com/tools/${tool.slug}">
  <link rel="stylesheet" href="/css/style.css">
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"SoftwareApplication","name":"${escapeHtml(tool.name)}","applicationCategory":"${cat.name}","description":"${escapeHtml(tool.description.substring(0, 200))}","url":"${tool.url}","offers":[{"@type":"Offer","price":"${tool.priceFrom || 0}","priceCurrency":"USD","priceSpecification":{"@type":"UnitPriceSpecification","billingDuration":{"@type":"QuantitativeValue","value":"P1M"}}}],"aggregateRating":{"@type":"AggregateRating","ratingValue":"${tool.rating}","ratingCount":"100","bestRating":"5","worstRating":"1"}}
  </script>
  ${ADSENSE_CODE}
</head>
<body>
${renderHeader(`/tools/${tool.slug}`)}
  <div class="container">
    <div class="tool-detail">
      <div class="breadcrumb">
        <a href="/">Home</a><span class="sep">/</span>
        <a href="/categories/${tool.category}">${cat.name}</a><span class="sep">/</span>
        <span>${escapeHtml(tool.name)}</span>
      </div>
      <div class="tool-detail-header">
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px">
          <div class="tool-icon" style="${toolIconStyle(tool)};width:64px;height:64px;font-size:28px;border-radius:16px">${tool.name[0]}</div>
          <div>
            <h1>${escapeHtml(tool.name)}</h1>
            <div class="tool-meta">
              <span class="meta-item">&#9733; ${tool.rating}/5</span>
              <span class="meta-item">${cat.name}</span>
              <span class="meta-item tool-badge ${tool.pricing === 'free' ? 'free' : tool.pricing}">${PRICING_LABELS[tool.pricing]}${tool.priceFrom ? ' - $' + tool.priceFrom + '/mo' : ''}</span>
            </div>
          </div>
        </div>
        <p class="subtitle">${escapeHtml(tool.description)}</p>
      </div>

      <div class="tool-detail-grid">
        <div class="tool-detail-main">
          <div class="detail-section">
            <h2>Pros &amp; Cons</h2>
            <div class="pros-cons">
              <div><h3 style="color:#065F46">Pros</h3>${prosHtml}</div>
              <div><h3 style="color:#991B1B">Cons</h3>${consHtml}</div>
            </div>
          </div>

          <div class="detail-section">
            <h2>What is ${escapeHtml(tool.name)}?</h2>
            <p style="font-size:16px;line-height:1.8;color:var(--text-secondary)">${escapeHtml(tool.description)}</p>
            <p style="font-size:16px;line-height:1.8;color:var(--text-secondary);margin-top:12px">${escapeHtml(tool.name)} is a ${cat.name.toLowerCase()} tool that ${tool.pricing === 'free' ? 'is completely free to use' : tool.pricing === 'freemium' ? 'offers a free tier with premium features starting at $' + tool.priceFrom + '/month' : 'is a premium tool starting at $' + tool.priceFrom + '/month'}. It stands out in the ${cat.name.toLowerCase()} category with a user rating of ${tool.rating}/5, making it one of the ${tool.rating >= 4.5 ? 'top-rated' : 'well-regarded'} options available in 2026.</p>
          </div>

          <div class="detail-section">
            <h2>Tags</h2>
            <div class="cat-grid" style="justify-content:flex-start">
              ${tool.tags.map(t => `<span class="cat-pill" style="cursor:default">${t}</span>`).join('\n              ')}
            </div>
          </div>

          <div class="ad-slot">Ad Space - Google AdSense</div>
        </div>

        <div class="tool-detail-sidebar">
          <div class="sidebar-cta">
            <div style="font-size:14px;opacity:.8">Try ${escapeHtml(tool.name)}</div>
            <div class="price">${tool.priceFrom === 0 ? 'Free' : '$' + tool.priceFrom}<span style="font-size:16px;font-weight:400;opacity:.7">/mo</span></div>
            <div class="price-note">${PRICING_LABELS[tool.pricing]} plan available</div>
            <a href="${tool.url}" target="_blank" rel="noopener" class="btn">Visit ${escapeHtml(tool.name)}</a>
            <a href="${tool.url}" target="_blank" rel="noopener" class="btn-outline">${escapeHtml(tool.url).replace('https://','')}</a>
          </div>

          ${alternatives.length ? `<div class="detail-section">
            <h2>Alternatives</h2>
            <div class="alt-list">${altHtml}</div>
          </div>` : ''}
          ${relatedHtml}
          <div class="ad-slot">Ad Space - Sidebar</div>
        </div>
      </div>
    </div>
  </div>
${renderFooter()}
</body>
</html>`;
    write(`tools/${tool.slug}.html`, html);
  });
  console.log(`  [OK] ${tools.length} tool detail pages`);
}

// ---- Generate Category Pages ----
function generateCategoryPages() {
  // Categories index
  const catCards = Object.entries(CATEGORIES).map(([slug, cat]) => {
    const count = getCategoryCount(slug);
    const top3 = tools.filter(t => t.category === slug).slice(0, 3).map(t =>
      `<a href="/tools/${t.slug}" class="alt-item"><div class="alt-icon" style="background:${cat.color}">${t.name[0]}</div><div class="alt-info"><h4>${t.name}</h4><p>${t.description.substring(0, 60)}...</p></div></a>`
    ).join('');
    return `      <div class="detail-section">
        <a href="/categories/${slug}" style="text-decoration:none;color:inherit">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
            <div class="tool-icon" style="background:${cat.color};width:44px;height:44px;font-size:20px;border-radius:10px"><span>${cat.name[0]}</span></div>
            <div>
              <h2 style="font-size:20px;font-weight:700;margin:0">${cat.name}</h2>
              <span style="font-size:13px;color:var(--text-secondary)">${count} tools</span>
            </div>
          </div>
        </a>
        <div class="alt-list">${top3}</div>
      </div>`;
  }).join('');

  const indexHtml = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>All Categories - AI Tools Hub</title><meta name="description" content="Browse all 10 AI tool categories: Chatbots, Image, Video, Coding, Writing, Research, Audio, Design, Productivity, and Marketing.">
<link rel="stylesheet" href="/css/style.css">
${ADSENSE_CODE}
</head>
<body>${renderHeader('categor')}
  <div class="container"><div class="page">
    <h1>All AI Tool Categories</h1>
    <p>Explore ${tools.length}+ AI tools organized into 10 categories. Click any category to see all tools, or use the search to find specific tools.</p>
${catCards}
  </div></div>
${renderFooter()}</body></html>`;
  write('categories.html', indexHtml);
  console.log('  [OK] categories.html');

  // Individual category pages
  Object.entries(CATEGORIES).forEach(([slug, cat]) => {
    const catTools = tools.filter(t => t.category === slug);
    const cardsHtml = catTools.map(renderToolCard).join('\n');
    const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${cat.name} Tools - ${catTools.length}+ Best AI ${cat.name.replace('AI ','')} Tools | AI Tools Hub</title>
<meta name="description" content="Discover the best ${cat.name.toLowerCase()} tools in 2026. Compare ${catTools.length}+ ${cat.name.toLowerCase()} AI tools with reviews, pricing, and ratings.">
<link rel="stylesheet" href="/css/style.css">
${ADSENSE_CODE}
</head>
<body>${renderHeader(`categories/${slug}`)}
  <div class="container"><div class="tools-section">
    <div class="breadcrumb"><a href="/">Home</a><span class="sep">/</span><a href="/categories">Categories</a><span class="sep">/</span><span>${cat.name}</span></div>
    <div class="tools-header"><h1>${cat.name} Tools <span style="color:var(--text-secondary);font-size:18px;font-weight:400">(${catTools.length})</span></h1></div>
    <div class="ad-slot">Ad Space - Top of Category</div>
    <div class="tool-grid">${cardsHtml}</div>
  </div></div>
${renderFooter()}</body></html>`;
    write(`categories/${slug}.html`, html);
  });
  console.log('  [OK] 10 category pages');
}

// ---- Generate Comparison Page ----
function generateComparisonPage() {
  const a = tools.find(t => t.slug === 'chatgpt');
  const b = tools.find(t => t.slug === 'claude');
  const c = tools.find(t => t.slug === 'gemini');

  function scoreRow(label, aVal, bVal, cVal) {
    return `<tr><td style="font-weight:600">${label}</td><td>${aVal}</td><td>${bVal}</td><td>${cVal}</td></tr>`;
  }

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>ChatGPT vs Claude vs Gemini (2026) - Full Comparison | AI Tools Hub</title>
<meta name="description" content="ChatGPT vs Claude vs Gemini: detailed comparison of features, pricing, performance, and best use cases in 2026. Find which AI chatbot is right for you.">
<meta property="og:title" content="ChatGPT vs Claude vs Gemini (2026) - Full Comparison">
<link rel="stylesheet" href="/css/style.css">
${ADSENSE_CODE}
</head>
<body>${renderHeader('compare')}
  <div class="article">
    <h1>ChatGPT vs Claude vs Gemini: The Ultimate AI Chatbot Comparison (2026)</h1>
    <div class="meta">Updated ${todayStr} &middot; 12 min read &middot; Expert Review</div>

    <p>Choosing the right AI chatbot in 2026 can feel overwhelming with three major players dominating the space. We have tested ChatGPT (OpenAI), Claude (Anthropic), and Gemini (Google) across hundreds of tasks to bring you this comprehensive comparison. Whether you are a developer, writer, researcher, or business professional, this guide will help you pick the right tool.</p>

    <div class="compare-cards">
      <div class="compare-card">
        <div class="tool-icon" style="background:#4F46E5;margin:0 auto 12px;width:48px;height:48px;font-size:22px;border-radius:12px">C</div>
        <h3>ChatGPT</h3>
        <div class="cat">OpenAI / GPT-4o</div>
        <div class="score">4.8</div>
        <div class="score-label">Overall Score</div>
      </div>
      <div class="compare-card winner">
        <div class="tool-icon" style="background:#D97706;margin:0 auto 12px;width:48px;height:48px;font-size:22px;border-radius:12px">C</div>
        <h3>Claude</h3>
        <div class="cat">Anthropic / Claude 4</div>
        <div class="score">4.7</div>
        <div class="score-label">Overall Score</div>
      </div>
      <div class="compare-card" style="grid-column:1/-1;max-width:50%;margin:0 auto">
        <div class="tool-icon" style="background:#4285F4;margin:0 auto 12px;width:48px;height:48px;font-size:22px;border-radius:12px">G</div>
        <h3>Gemini</h3>
        <div class="cat">Google / Gemini 2</div>
        <div class="score">4.5</div>
        <div class="score-label">Overall Score</div>
      </div>
    </div>

    <h2>Quick Comparison Table</h2>
    <table class="compare-table">
      <thead><tr><th>Feature</th><th>ChatGPT</th><th>Claude</th><th>Gemini</th></tr></thead>
      <tbody>
        ${scoreRow('Starting Price', 'Free ($20/mo Pro)', 'Free ($20/mo Pro)', 'Free')}
        ${scoreRow('Context Window', '128K tokens', '200K tokens', '1M tokens')}
        ${scoreRow('Web Search', '<span class="check">&#10003;</span> (Pro)', '<span class="check">&#10003;</span> (Pro)', '<span class="check">&#10003;</span> (Free)')}
        ${scoreRow('Image Generation', '<span class="check">&#10003;</span> DALL-E 3', '<span class="cross">&#10007;</span>', '<span class="check">&#10003;</span> Imagen 3')}
        ${scoreRow('File Analysis', '<span class="check">&#10003;</span> PDF, Code, Data', '<span class="check">&#10003;</span> PDF, Code, Data', '<span class="check">&#10003;</span> PDF, Video, Audio')}
        ${scoreRow('Coding Quality', '<span class="check">&#10003;</span> Excellent', '<span class="check">&#10003;</span> Excellent', '<span class="cross">Good</span>')}
        ${scoreRow('Plugin Ecosystem', '<span class="check">&#10003;</span> Extensive', '<span class="cross">Limited</span>', '<span class="check">&#10003;</span> Google Apps')}
        ${scoreRow('API Access', '<span class="check">&#10003;</span>', '<span class="check">&#10003;</span>', '<span class="check">&#10003;</span>')}
        ${scoreRow('Mobile App', '<span class="check">&#10003;</span>', '<span class="check">&#10003;</span>', '<span class="check">&#10003;</span>')}
      </tbody>
    </table>

    <h2>Who Should Use What?</h2>
    <h3>Choose ChatGPT if:</h3>
    <ul>
      <li>You want the most versatile all-around AI assistant</li>
      <li>You need a large plugin ecosystem for specialized tasks</li>
      <li>You work with image generation alongside text tasks</li>
      <li>You want the most widely supported and documented platform</li>
    </ul>

    <h3>Choose Claude if:</h3>
    <ul>
      <li>You work with long documents and need a large context window</li>
      <li>You value nuanced, safety-aligned responses</li>
      <li>You do complex coding or technical analysis</li>
      <li>You need honest assessments including what the AI does not know</li>
    </ul>

    <h3>Choose Gemini if:</h3>
    <ul>
      <li>You want a completely free powerful AI assistant</li>
      <li>You rely heavily on Google Search integration</li>
      <li>You need multimodal analysis (text, image, video, audio)</li>
      <li>You use Google Workspace tools (Docs, Sheets, Gmail)</li>
    </ul>

    <h2>Our Verdict</h2>
    <p><strong>Best Overall:</strong> ChatGPT wins for its unmatched versatility and ecosystem. With GPT-4o, image generation, web search, and thousands of plugins, it handles the widest range of tasks effectively.</p>
    <p><strong>Best for Long Documents &amp; Coding:</strong> Claude is our top pick for anyone working with lengthy documents or complex code. The 200K context window and exceptional coding ability make it indispensable for researchers and developers.</p>
    <p><strong>Best Free Option:</strong> Gemini offers the most generous free tier with real-time web search and multimodal capabilities, making it the best choice for budget-conscious users.</p>

    <div class="ad-slot">Ad Space - Mid-Article</div>

    <h2>More Comparisons</h2>
    <ul>
      <li><a href="/compare/midjourney-vs-dalle">Midjourney vs DALL-E 3: Which AI Image Generator is Best?</a></li>
      <li><a href="/compare/github-copilot-vs-cursor">GitHub Copilot vs Cursor: The Best AI Coding Tool</a></li>
      <li><a href="/compare/runway-vs-pika">Runway vs Pika vs Luma: AI Video Generation Compared</a></li>
    </ul>
  </div>
${renderFooter()}</body></html>`;
  write('compare/chatgpt-vs-claude.html', html);
  console.log('  [OK] compare/chatgpt-vs-claude.html');
}

// ---- Generate Blog Pages ----
function generateBlogPages() {
  // Best AI Tools 2026
  const topTools = [...tools].sort((a, b) => b.rating - a.rating).slice(0, 15);
  const listHtml = topTools.map((t, i) => {
    const cat = CATEGORIES[t.category] || { name: '', color: '#6B7280' };
    return `<li><strong>${i + 1}. <a href="/tools/${t.slug}">${t.name}</a></strong> (${cat.name}) - ${t.description} <strong>Rating: ${t.rating}/5</strong> | ${PRICING_LABELS[t.pricing]}${t.priceFrom ? ' from $' + t.priceFrom + '/mo' : ''}</li>`;
  }).join('\n          ');

  const blogHtml = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>50 Best AI Tools in 2026 (Expert Curated List) | AI Tools Hub</title>
<meta name="description" content="Our expert-curated list of the 50 best AI tools in 2026. Compare top AI tools for writing, coding, design, video, and more with ratings and pricing.">
<meta property="og:title" content="50 Best AI Tools in 2026 - Expert Curated">
<link rel="stylesheet" href="/css/style.css">
${ADSENSE_CODE}
</head>
<body>${renderHeader('blog')}
  <div class="article">
    <h1>50 Best AI Tools in 2026: The Definitive Expert List</h1>
    <div class="meta">Updated ${todayStr} &middot; 15 min read &middot; Expert Curated</div>

    <p>The AI tools landscape has exploded in 2026, with thousands of new tools launching every month. We have spent hundreds of hours testing and reviewing ${tools.length}+ AI tools across 10 categories to bring you this definitive list of the best options. Whether you need an AI writing assistant, image generator, coding companion, or video creator, this guide covers it all.</p>

    <h2>How We Selected These Tools</h2>
    <p>Each tool was evaluated across five key dimensions:</p>
    <ul>
      <li><strong>Performance Quality</strong> (30%) - How well does it perform its core task?</li>
      <li><strong>Value for Money</strong> (25%) - Is the pricing fair for what you get?</li>
      <li><strong>Ease of Use</strong> (20%) - How intuitive is the interface?</li>
      <li><strong>Features</strong> (15%) - Does it offer a comprehensive feature set?</li>
      <li><strong>Support &amp; Updates</strong> (10%) - How responsive is the team? How often is it updated?</li>
    </ul>

    <h2>The Top 15 AI Tools (2026 Rankings)</h2>
    <ol>
${listHtml}
    </ol>

    <h2>Choosing the Right AI Tool</h2>
    <p>The best AI tool depends entirely on your specific needs. Here is a quick guide:</p>
    <ul>
      <li><strong>For general conversations and research:</strong> Start with ChatGPT or Claude</li>
      <li><strong>For generating images:</strong> Midjourney for artistic quality, DALL-E 3 for ease of use</li>
      <li><strong>For coding assistance:</strong> Cursor for AI-native editing, GitHub Copilot for IDE integration</li>
      <li><strong>For video creation:</strong> Runway for professional quality, Pika for quick results</li>
      <li><strong>For writing and content:</strong> Claude for long-form, Jasper for marketing teams</li>
      <li><strong>For voice and audio:</strong> ElevenLabs for realistic voices, Suno for music</li>
    </ul>

    <h2>Free AI Tools Worth Trying</h2>
    <p>Not ready to pay? These free AI tools offer impressive capabilities without spending a dime:</p>
    <ul>
      <li><a href="/tools/gemini">Google Gemini</a> - Powerful free AI with search integration</li>
      <li><a href="/tools/codeium">Codeium</a> - Free AI coding assistant</li>
      <li><a href="/tools/stable-diffusion">Stable Diffusion</a> - Free open-source image generation</li>
      <li><a href="/tools/deepl">DeepL</a> - The best free AI translation tool</li>
      <li><a href="/tools/perplexity">Perplexity</a> - AI search with citations (free tier)</li>
    </ul>

    <div class="ad-slot">Ad Space - Mid-Article</div>

    <h2>Frequently Asked Questions</h2>
    <h3>What is the best overall AI tool in 2026?</h3>
    <p>ChatGPT remains the most versatile AI tool overall, offering excellent performance across writing, coding, analysis, and creative tasks. However, Claude excels with long documents and coding, while Gemini offers the best free experience.</p>

    <h3>Which AI tool is best for beginners?</h3>
    <p>Google Gemini and ChatGPT both offer intuitive interfaces that are easy for beginners. For specific tasks, Canva AI (design) and Otter.ai (meeting notes) are also very beginner-friendly.</p>

    <h3>Are AI tools worth paying for?</h3>
    <p>For most users, the free tiers of major AI tools are sufficient for basic tasks. However, if you use AI daily for work, the paid plans ($20/month) unlock significantly more powerful models, higher usage limits, and additional features that easily justify the cost.</p>
  </div>
${renderFooter()}</body></html>`;
  write('blog/best-ai-tools-2026.html', blogHtml);
  console.log('  [OK] blog/best-ai-tools-2026.html');

  // Best Free AI Tools
  const freeTools = tools.filter(t => t.pricing === 'free' || t.pricing === 'freemium');
  const freeBlog = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Best Free AI Tools 2026 - Top 20 No-Cost AI Tools | AI Tools Hub</title>
<meta name="description" content="Discover the 20 best free AI tools in 2026. No credit card required. Compare free AI tools for writing, coding, image generation, and more.">
<link rel="stylesheet" href="/css/style.css">
${ADSENSE_CODE}
</head>
<body>${renderHeader('blog')}
  <div class="article">
    <h1>20 Best Free AI Tools in 2026 (No Credit Card Required)</h1>
    <div class="meta">Updated ${todayStr} &middot; 10 min read</div>
    <p>You do not need to spend money to access powerful AI tools. In 2026, the best AI companies offer generous free tiers that provide genuine value. We tested ${freeTools.length}+ free and freemium AI tools to find the ones that deliver the most without paying a cent.</p>
    <h2>The 20 Best Free AI Tools</h2>
    <ol>${freeTools.map((t, i) => `<li><strong>${i + 1}. <a href="/tools/${t.slug}">${t.name}</a></strong> - ${t.description} <strong>Plan: ${PRICING_LABELS[t.pricing]}</strong></li>`).join('\n    ')}
    </ol>
    <h2>Tips for Maximizing Free AI Tools</h2>
    <ul>
      <li>Use multiple tools together - combine free tiers for maximum coverage</li>
      <li>Set up accounts on all platforms to get the maximum free credits</li>
      <li>Use API free tiers for programmatic access</li>
      <li>Consider open-source tools like Stable Diffusion that have no usage limits</li>
    </ul>
  </div>
${renderFooter()}</body></html>`;
  write('blog/best-free-ai-tools.html', freeBlog);
  console.log('  [OK] blog/best-free-ai-tools.html');

  // AI Tools for Students
  const studentBlog = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>15 Best AI Tools for Students 2026 - Study Smarter | AI Tools Hub</title>
<meta name="description" content="The 15 best AI tools for students in 2026. Free and affordable AI tools for writing, research, math, language learning, and exam preparation.">
<link rel="stylesheet" href="/css/style.css">
${ADSENSE_CODE}
</head>
<body>${renderHeader('blog')}
  <div class="article">
    <h1>15 Best AI Tools for Students in 2026: Study Smarter, Not Harder</h1>
    <div class="meta">Updated ${todayStr} &middot; 10 min read</div>
    <p>AI tools are transforming education, helping students learn faster, write better, and research more efficiently. Here are the 15 best AI tools every student should know about in 2026, most of which offer free plans.</p>
    <h2>Best AI Tools for Writing &amp; Research</h2>
    <ol>
      <li><a href="/tools/chatgpt">ChatGPT</a> - Essay brainstorming, grammar checking, and writing feedback</li>
      <li><a href="/tools/claude">Claude</a> - Long document analysis and research summarization</li>
      <li><a href="/tools/perplexity">Perplexity</a> - Research with real-time citations and sources</li>
      <li><a href="/tools/grammarly">Grammarly</a> - Grammar, style, and tone checking for essays</li>
      <li><a href="/tools/deepl">DeepL</a> - Best AI translator for language students</li>
    </ol>
    <h2>Best AI Tools for Coding &amp; STEM</h2>
    <ol start="6">
      <li><a href="/tools/github-copilot">GitHub Copilot</a> - Free for students via GitHub Education</li>
      <li><a href="/tools/cursor">Cursor</a> - AI-first code editor with free tier</li>
      <li><a href="/tools/codeium">Codeium</a> - Completely free AI coding assistant</li>
    </ol>
    <h2>Best AI Tools for Productivity</h2>
    <ol start="9">
      <li><a href="/tools/notion-ai">Notion AI</a> - AI note-taking, summarization, and organization</li>
      <li><a href="/tools/otter-ai">Otter.ai</a> - Record and transcribe lectures automatically</li>
      <li><a href="/tools/taskade">Taskade</a> - AI project planning and mind mapping</li>
    </ol>
    <h2>Best AI Tools for Creative Projects</h2>
    <ol start="12">
      <li><a href="/tools/canva-ai">Canva AI</a> - Free AI design tool for presentations and posters</li>
      <li><a href="/tools/leonardo-ai">Leonardo AI</a> - Free AI image generation with daily tokens</li>
      <li><a href="/tools/elevenlabs">ElevenLabs</a> - AI voice for video presentations</li>
      <li><a href="/tools/pika">Pika</a> - Free AI video generation for creative projects</li>
    </ol>
    <div class="ad-slot">Ad Space - Mid-Article</div>
  </div>
${renderFooter()}</body></html>`;
  write('blog/ai-tools-for-students.html', studentBlog);
  console.log('  [OK] blog/ai-tools-for-students.html');
}

// ---- Generate Blog Index Page ----
function generateBlogIndex() {
  const blogDir = path.join(__dirname, 'dist', 'blog');
  if (!fs.existsSync(blogDir)) return;

  // Try to read manifest first (generated by generate-articles.js)
  let articles = [];
  const manifestPath = path.join(blogDir, 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    try {
      articles = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    } catch(e) {
      articles = [];
    }
  }

  // Fallback: read HTML files and extract titles
  if (articles.length === 0) {
    const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.html') && f !== 'manifest.json');
    articles = files.map(f => {
      const content = fs.readFileSync(path.join(blogDir, f), 'utf-8');
      const titleMatch = content.match(/<title>(.*?)<\/title>/);
      const title = titleMatch ? titleMatch[1].replace(' | AI Tools Hub', '').replace(' | AI Tools Hub', '') : f.replace('.html', '');
      return { title, url: '/blog/' + f, description: '' };
    });
  }

  if (articles.length === 0) return;

  // Sort by title
  articles.sort((a, b) => a.title.localeCompare(b.title));

  const listHtml = articles.map(a =>
    `          <li class="blog-list-item"><a href="${a.url}">${escapeHtml(a.title)}</a>${a.description ? '<p class="blog-list-desc">' + escapeHtml(a.description.substring(0, 120)) + '...</p>' : ''}</li>`
  ).join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Tools Blog - Guides, Reviews & Comparisons | AI Tools Hub</title>
  <meta name="description" content="Read expert AI tool reviews, comparisons, and guides. ${articles.length} articles to help you choose the best AI tools in 2026.">
  <meta property="og:title" content="AI Tools Blog - ${articles.length} Articles | AI Tools Hub">
  <meta property="og:description" content="Expert AI tool reviews, comparisons, and guides for 2026.">
  <link rel="canonical" href="https://aitoolshub.cn/blog/">
  <link rel="stylesheet" href="/css/style.css">
  ${ADSENSE_CODE}
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"Blog","name":"AI Tools Hub Blog","description":"Expert AI tool reviews and guides","url":"https://aitoolshub.cn/blog/"}
  </script>
</head>
<body>
${renderHeader('/blog')}
  <div class="container">
    <div class="page" style="max-width:900px;margin:40px auto;">
      <h1>AI Tools Blog</h1>
      <p class="article-meta">${articles.length} articles · Expert reviews, comparisons, and buying guides</p>
      <div class="blog-intro" style="background:var(--bg-secondary);padding:24px;border-radius:12px;margin:24px 0;">
        <p>Welcome to the AI Tools Hub blog. We publish in-depth reviews, head-to-head comparisons, and practical guides to help you navigate the rapidly evolving AI tools landscape. All articles are researched and written by our editorial team.</p>
      </div>
      <ul class="blog-list" style="list-style:none;padding:0;">
${listHtml}
      </ul>
    </div>
  </div>
${renderFooter()}
</body>
</html>`;

  write('blog/index.html', html);
  console.log('  [OK] blog/index.html (' + articles.length + ' articles)');
}

// ---- Generate Static Pages ----
function generateStaticPages() {
  const pages = [
    { name: 'about', title: 'About AI Tools Hub', content: `<h1>About AI Tools Hub</h1><p>AI Tools Hub is the most comprehensive directory for discovering, comparing, and choosing AI tools. Founded in 2026, our mission is to help individuals and businesses navigate the rapidly growing AI tools landscape.</p><h2>Our Mission</h2><p>With thousands of AI tools launching every month, finding the right one can be overwhelming. We test, review, and compare AI tools so you do not have to. Our expert team evaluates each tool across multiple dimensions including performance, value, ease of use, and support.</p><h2>How We Work</h2><p>Every tool listed on AI Tools Hub has been manually reviewed by our editorial team. We do not accept payment for reviews or ratings. Our revenue comes from advertising and affiliate partnerships, which never influence our editorial content.</p><h2>Our Team</h2><p>AI Tools Hub is built by a team of AI researchers, software engineers, and content creators who are passionate about making AI accessible to everyone.</p><h2>Contact Us</h2><p>Have questions or want to submit your AI tool? Visit our <a href="/contact">contact page</a>.</p>` },
    { name: 'contact', title: 'Contact Us', content: `<h1>Contact AI Tools Hub</h1><p>We would love to hear from you. Whether you have a question, feedback, or want to submit your AI tool for listing, reach out using the form below.</p><h2>Submit Your AI Tool</h2><p>Have an AI tool you want listed on AI Tools Hub? Please visit our <a href="/submit">submission page</a> for details on how to get your tool reviewed and listed.</p><h2>General Inquiries</h2><p>Email us at <strong>hello@aitoolshub.com</strong></p><h2>Advertising</h2><p>Interested in advertising on AI Tools Hub? We offer sponsored listings, banner ads, and featured placements. Contact us at <strong>ads@aitoolshub.com</strong> for rates and availability.</p>` },
    { name: 'submit', title: 'Submit Your AI Tool', content: `<h1>Submit Your AI Tool</h1><p>Want your AI tool listed on AI Tools Hub? We accept submissions for tools across all categories. Here is how:</p><h2>Submission Guidelines</h2><ul><li>Your tool must be publicly accessible and functional</li><li>Provide a clear description and accurate pricing information</li><li>Include a direct link to your tool's website</li><li>Tools with free tiers or trials are prioritized</li></ul><h2>How to Submit</h2><p>Email us at <strong>submit@aitoolshub.com</strong> with the following information:</p><ul><li>Tool name and URL</li><li>Category (Chatbot, Image, Video, Coding, Writing, Research, Audio, Design, Productivity, Marketing)</li><li>Description (50-200 words)</li><li>Pricing model (Free / Freemium / Paid)</li><li>Any screenshots or demo links</li></ul><h2>Review Process</h2><p>Our editorial team reviews all submissions within 5-7 business days. Approved tools will be listed with a full review page including pros, cons, and a rating. There is no charge for standard listings.</p>` },
    { name: 'privacy', title: 'Privacy Policy', content: `<h1>Privacy Policy</h1><p><strong>Last updated:</strong> May 29, 2026</p><h2>Information We Collect</h2><p>We collect information to improve your experience on AI Tools Hub, including:</p><ul><li><strong>Usage Data:</strong> We use Google Analytics to collect anonymized data about how visitors use our site, including pages visited, time spent, and device information.</li><li><strong>Cookies:</strong> We use cookies for analytics and advertising purposes. Google AdSense may use cookies to serve personalized ads.</li></ul><h2>How We Use Your Information</h2><p>We use collected information to: improve our website content and user experience, analyze traffic patterns, and display relevant advertisements.</p><h2>Third-Party Services</h2><p>AI Tools Hub uses the following third-party services:<ul><li><strong>Google AdSense:</strong> For displaying advertisements. Google may use cookies to serve ads based on user visits.</li><li><strong>Google Analytics:</strong> For website analytics and traffic analysis.</li></ul></p><h2>Your Rights</h2><p>You have the right to opt out of personalized advertising by visiting <a href="https://adssettings.google.com" target="_blank" rel="noopener">Google Ads Settings</a>. You can also disable cookies in your browser settings.</p><h2>Contact</h2><p>If you have questions about this privacy policy, contact us at <strong>privacy@aitoolshub.com</strong>.</p>` },
    { name: 'terms', title: 'Terms of Service', content: `<h1>Terms of Service</h1><p><strong>Last updated:</strong> May 29, 2026</p><h2>Acceptance of Terms</h2><p>By accessing and using AI Tools Hub, you agree to be bound by these Terms of Service.</p><h2>Content Disclaimer</h2><p>The information on AI Tools Hub is provided for general informational purposes only. While we strive for accuracy, we make no warranties about the completeness or reliability of any tool reviews, comparisons, or recommendations. Tool features, pricing, and availability may change without notice.</p><h2>Affiliate Links</h2><p>Some links on AI Tools Hub are affiliate links. This means we may earn a commission if you click on a link and make a purchase. This does not affect our editorial integrity or the ratings we assign to tools.</p><h2>Intellectual Property</h2><p>All content on AI Tools Hub, including text, design, and code, is the property of AI Tools Hub and is protected by copyright law. Product names and logos are trademarks of their respective owners.</p><h2>Limitation of Liability</h2><p>AI Tools Hub shall not be liable for any damages arising from the use of information on this website, including but not limited to direct, indirect, incidental, or consequential damages.</p><h2>Changes to Terms</h2><p>We reserve the right to modify these terms at any time. Continued use of the site after changes constitutes acceptance of the modified terms.</p><h2>Contact</h2><p>For questions about these terms, contact us at <strong>legal@aitoolshub.com</strong>.</p>` }
  ];

  pages.forEach(page => {
    const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${page.title} | AI Tools Hub</title><meta name="description" content="${page.desc}">
<link rel="stylesheet" href="/css/style.css">
${ADSENSE_CODE}
</head>
<body>${renderHeader(page.name)}
  <div class="container"><div class="page">${page.content}</div></div>
${renderFooter()}</body></html>`;
    write(`${page.name}.html`, html);
  });
  console.log('  [OK] 5 static pages (about, contact, submit, privacy, terms)');
}

// ---- Helpers ----
function write(filePath, content) {
  const fullPath = path.join(__dirname, 'dist', filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf-8');
}

// ---- Main ----
console.log('Building AI Tools Hub...');
fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
fs.mkdirSync(path.join(__dirname, 'dist', 'css'), { recursive: true });
fs.copyFileSync(path.join(__dirname, 'src', 'css', 'style.css'), path.join(__dirname, 'dist', 'css', 'style.css'));
console.log('  [OK] css/style.css');

generateHomepage();
generateToolPages();
generateCategoryPages();
generateComparisonPage();
  generateBlogPages();
  // generateBlogIndex(); // 改为运行 generate-blog-index.js
  generateStaticPages();

// ---- Sitemap & Robots ----
function generateSitemapAndRobots() {
  const BASE = 'https://aitoolshub.cn';
  const today = new Date().toISOString().split('T')[0];
  const urls = [];

  // Homepage
  urls.push({ loc: '/', priority: '1.0', changefreq: 'daily' });

  // Category pages
  urls.push({ loc: '/categories', priority: '0.9', changefreq: 'weekly' });
  Object.keys(CATEGORIES).forEach(cat => {
    urls.push({ loc: '/categories/' + cat, priority: '0.8', changefreq: 'weekly' });
  });

  // Tool pages
  tools.forEach(t => {
    urls.push({ loc: '/tools/' + t.slug, priority: '0.7', changefreq: 'weekly' });
  });

  // Blog pages (check if blog dir has files)
  const blogDir = path.join(__dirname, 'dist', 'blog');
  if (fs.existsSync(blogDir)) {
    fs.readdirSync(blogDir).filter(f => f.endsWith('.html')).forEach(f => {
      urls.push({ loc: '/blog/' + f.replace('.html', ''), priority: '0.8', changefreq: 'weekly' });
    });
  }

  // Compare pages
  const compareDir = path.join(__dirname, 'dist', 'compare');
  if (fs.existsSync(compareDir)) {
    fs.readdirSync(compareDir).filter(f => f.endsWith('.html')).forEach(f => {
      urls.push({ loc: '/compare/' + f.replace('.html', ''), priority: '0.8', changefreq: 'monthly' });
    });
  }

  // Static pages
  ['about', 'contact', 'submit', 'privacy', 'terms'].forEach(p => {
    urls.push({ loc: '/' + p, priority: '0.3', changefreq: 'monthly' });
  });

  // Generate sitemap.xml
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  urls.forEach(u => {
    sitemap += '  <url>\n    <loc>' + BASE + u.loc + '</loc>\n    <lastmod>' + today + '</lastmod>\n    <changefreq>' + u.changefreq + '</changefreq>\n    <priority>' + u.priority + '</priority>\n  </url>\n';
  });
  sitemap += '</urlset>';
  write('sitemap.xml', sitemap);
  console.log('  [OK] sitemap.xml (' + urls.length + ' URLs)');

  // Generate robots.txt
  const robots = 'User-agent: *\nAllow: /\n\nSitemap: ' + BASE + '/sitemap.xml\n';
  write('robots.txt', robots);
  console.log('  [OK] robots.txt');

  // Generate ads.txt for Google AdSense
  const adsTxt = 'google.com, pub-3362391181724689, DIRECT, f08c47fec0942fa0\n';
  write('ads.txt', adsTxt);
  console.log('  [OK] ads.txt (Google AdSense)');
}

// Copy JS
const jsDir = path.join(__dirname, 'dist', 'js');
fs.mkdirSync(jsDir, { recursive: true });

generateSitemapAndRobots();

console.log('\nBuild complete! ' + tools.length + ' tools, 10 categories, 5 static pages.');
console.log('Run: npx serve dist -p 3000');
