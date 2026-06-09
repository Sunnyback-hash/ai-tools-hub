/**
 * generate-articles.js - SEO 文章自动生成器
 * 基于现有工具数据库自动生成多种类型的高质量 SEO 文章
 *
 * 文章类型:
 *   1. 对比评测: "ToolA vs ToolB vs ToolC — Full Comparison (2026)"
 *   2. 分类 Best-of: "15 Best AI Writing Tools in 2026 (Ranked)"
 *   3. 场景指南:   "Best AI Tools for Students / Developers / Marketers"
 *   4. 免费工具合集: "20 Best Free AI Tools You Should Try in 2026"
 *   5. 替代品评测: "Top 10 Midjourney Alternatives in 2026"
 *
 * 用法:
 *   node scripts/generate-articles.js              # 自动生成所有类型
 *   node scripts/generate-articles.js --type compare # 只生成对比文章
 *   node scripts/generate-articles.js --type best-of # 只生成 Best-of 文章
 *   node scripts/generate-articles.js --type guide   # 只生成场景指南
 *   node scripts/generate-articles.js --type free    # 只生成免费工具合集
 *   node scripts/generate-articles.js --type alternatives # 只生成替代品文章
 *   node scripts/generate-articles.js --count 5      # 每种类型最多生成 N 篇
 */

const fs = require('fs');
const path = require('path');

const toolsPath = path.join(__dirname, '..', 'data', 'tools.json');
const tools = JSON.parse(fs.readFileSync(toolsPath, 'utf-8'));

const CATEGORIES = {
  'ai-chatbot': { name: 'AI Chatbots', singular: 'AI Chatbot' },
  'ai-image': { name: 'AI Image Tools', singular: 'AI Image Tool' },
  'ai-video': { name: 'AI Video Tools', singular: 'AI Video Tool' },
  'ai-coding': { name: 'AI Coding Tools', singular: 'AI Coding Tool' },
  'ai-writing': { name: 'AI Writing Tools', singular: 'AI Writing Tool' },
  'ai-research': { name: 'AI Research Tools', singular: 'AI Research Tool' },
  'ai-audio': { name: 'AI Audio Tools', singular: 'AI Audio Tool' },
  'ai-design': { name: 'AI Design Tools', singular: 'AI Design Tool' },
  'ai-productivity': { name: 'AI Productivity Tools', singular: 'AI Productivity Tool' },
  'ai-marketing': { name: 'AI Marketing Tools', singular: 'AI Marketing Tool' }
};

const SCENARIOS = {
  'students': { title: 'Students', description: 'academic, writing, research, and study assistance', targetTools: ['ai-chatbot', 'ai-writing', 'ai-research', 'ai-productivity'] },
  'developers': { title: 'Developers', description: 'coding, debugging, deployment, and development workflow', targetTools: ['ai-coding', 'ai-chatbot', 'ai-productivity'] },
  'marketers': { title: 'Marketers', description: 'content creation, social media, SEO, and advertising', targetTools: ['ai-writing', 'ai-marketing', 'ai-image', 'ai-video'] },
  'designers': { title: 'Designers', description: 'graphic design, UI/UX, prototyping, and creative workflow', targetTools: ['ai-design', 'ai-image', 'ai-video'] },
  'content-creators': { title: 'Content Creators', description: 'video production, social media content, and audience growth', targetTools: ['ai-video', 'ai-image', 'ai-audio', 'ai-writing'] },
  'small-business': { title: 'Small Business Owners', description: 'marketing, customer service, productivity, and growth automation', targetTools: ['ai-marketing', 'ai-productivity', 'ai-chatbot', 'ai-writing'] }
};

let articleCount = 0;
const blogManifest = [];

// ============ 工具函数 ============

function slugify(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function getToolsByCategory(cat) {
  return tools.filter(t => t.category === cat).sort((a, b) => b.rating - a.rating);
}

function getToolsByPricing(pricing) {
  return tools.filter(t => t.pricing === pricing).sort((a, b) => b.rating - a.rating);
}

function getAlternatives(toolSlug) {
  const tool = tools.find(t => t.slug === toolSlug);
  if (!tool) return [];
  return tools.filter(t => t.category === tool.category && t.slug !== tool.slug).sort((a, b) => b.rating - a.rating);
}

function generateMetaDescription(text) {
  return text.substring(0, 155) + (text.length > 155 ? '...' : '');
}

function generateArticleHtml(meta) {
  const date = new Date().toISOString().split('T')[0];
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": meta.title,
    "description": meta.metaDescription,
    "datePublished": date,
    "dateModified": date,
    "author": { "@type": "Organization", "name": "AI Tools Hub" },
    "publisher": { "@type": "Organization", "name": "AI Tools Hub" }
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${meta.title} | AI Tools Hub</title>
  <meta name="description" content="${meta.metaDescription}">
  <meta name="keywords" content="${meta.keywords.join(', ')}">
  <link rel="canonical" href="https://aitoolshub.com/${meta.urlPath}">
  <meta property="og:title" content="${meta.title}">
  <meta property="og:description" content="${meta.metaDescription}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="https://aitoolshub.com/${meta.urlPath}">
  <meta property="og:site_name" content="AI Tools Hub">
  <link rel="stylesheet" href="/css/style.css">
  <script type="application/ld+json">${jsonLd}</script>
</head>
<body>
  <header class="header">
    <div class="header-inner">
      <a href="/" class="logo">
        <div class="logo-icon"><svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg></div>
        AI Tools Hub
      </a>
      <nav class="nav">
        <a href="/">Home</a>
        <a href="/categories.html">Categories</a>
        <a href="/compare/chatgpt-vs-claude.html">Compare</a>
        <a href="/blog/best-ai-tools-2026.html">Blog</a>
        <a href="/submit.html" class="nav-cta">Submit Tool</a>
      </nav>
    </div>
  </header>

  <main class="article-page">
    <article class="article-content">
      ${meta.content}
    </article>

    <!-- Ad Space: Article Bottom -->
    <div class="ad-container" style="max-width:728px;margin:2rem auto;text-align:center;">
      <p style="color:#9CA3AF;font-size:12px;">Advertisement</p>
    </div>
  </main>

  <footer class="footer">
    <div class="footer-inner">
      <p>&copy; 2026 AI Tools Hub. All rights reserved.</p>
      <div class="footer-links">
        <a href="/privacy.html">Privacy Policy</a>
        <a href="/terms.html">Terms of Service</a>
        <a href="/about.html">About</a>
        <a href="/contact.html">Contact</a>
      </div>
    </div>
  </footer>
</body>
</html>`;
}

function saveArticle(meta) {
  const distDir = path.join(__dirname, '..', 'dist', 'blog');
  fs.mkdirSync(distDir, { recursive: true });
  const filePath = path.join(distDir, meta.urlPath);
  fs.writeFileSync(filePath, generateArticleHtml(meta));
  articleCount++;
  blogManifest.push({ title: meta.title, url: '/blog/' + meta.urlPath, description: meta.metaDescription });
  console.log(`  📝 ${meta.title}`);
}

// ============ 文章类型 1: 对比评测 ============

function generateCompareArticles(maxCount) {
  console.log('\n📝 生成对比评测文章...');

  const articles = [];
  const categories = Object.keys(CATEGORIES);

  for (const cat of categories) {
    const catTools = getToolsByCategory(cat);
    if (catTools.length < 2) continue;

    // 取评分最高的 3-4 个做对比
    const topTools = catTools.slice(0, Math.min(4, catTools.length));

    const toolNames = topTools.map(t => t.name);
    const title = `${toolNames.join(' vs ')} — Complete ${CATEGORIES[cat].singular} Comparison (2026)`;
    const slug = topTools.map(t => t.slug).join('-vs-');
    const urlPath = `compare-${slug}.html`;

    // 对比表格
    let comparisonTable = `<table class="comparison-table">
<thead><tr><th>Feature</th>${topTools.map(t => `<th>${t.name}</th>`).join('')}</tr></thead><tbody>`;

    const rows = [
      { label: 'Rating', values: topTools.map(t => `${'<span style="color:#F59E0B">&#9733;</span>'.repeat(Math.round(t.rating))} ${t.rating}/5`) },
      { label: 'Pricing', values: topTools.map(t => t.pricing.charAt(0).toUpperCase() + t.pricing.slice(1) + (t.priceFrom > 0 ? ` ($${t.priceFrom}/mo)` : '')) },
      { label: 'Best For', values: topTools.map(t => t.tags[0] || CATEGORIES[cat].singular) },
    ];

    // Pros 对比行
    rows.push({
      label: 'Pros',
      values: topTools.map(t => '<ul style="margin:0;padding-left:1rem;font-size:0.9em;">' + t.pros.slice(0, 3).map(p => `<li>${p}</li>`).join('') + '</ul>')
    });

    // Cons 对比行
    rows.push({
      label: 'Cons',
      values: topTools.map(t => '<ul style="margin:0;padding-left:1rem;font-size:0.9em;">' + t.cons.slice(0, 3).map(c => `<li>${c}</li>`).join('') + '</ul>')
    });

    rows.forEach(row => {
      comparisonTable += `<tr><td><strong>${row.label}</strong></td>${row.values.map(v => `<td>${v}</td>`).join('')}</tr>`;
    });
    comparisonTable += '</tbody></table>';

    // 每个工具详细段落
    const toolDetails = topTools.map(t => `
<h2 id="${t.slug}">${t.name}</h2>
<p>${t.description}</p>
<p><strong>Key Features:</strong></p>
<ul>
${t.pros.map(p => `<li>${p}</li>`).join('')}
</ul>
<p><strong>Pricing:</strong> ${t.pricing === 'free' ? 'Completely free' : t.pricing === 'freemium' ? `Free plan available, paid plans from $${t.priceFrom}/month` : `Starting at $${t.priceFrom}/month`}</p>
<p><a href="${t.url}" class="cta-link" target="_blank" rel="noopener">Visit ${t.name} &rarr;</a></p>
`).join('\n');

    // 总结段落
    const verdict = topTools.map((t, i) => {
      const label = ['Best Overall', 'Runner-up', 'Budget Pick', 'Honorable Mention'][i] || 'Alternative';
      return `<p><strong>${label}:</strong> ${t.name} — ${t.pros[0]}. ${t.cons[0] ? `Drawback: ${t.cons[0]}` : ''}</p>`;
    }).join('\n');

    const content = `
      <!-- Ad Space: Article Top -->
      <div class="ad-container" style="max-width:728px;margin:0 auto 2rem;text-align:center;">
        <p style="color:#9CA3AF;font-size:12px;">Advertisement</p>
      </div>

      <h1>${title}</h1>
      <p class="article-meta">Updated: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} | Reading time: 8 min</p>

      <p class="article-intro">Looking for the best ${CATEGORIES[cat].singular.toLowerCase()} in 2026? We compared ${toolNames.join(', ')} across features, pricing, quality, and usability to help you make the right choice.</p>

      <h2>Quick Comparison</h2>
      ${comparisonTable}

      <h2>Detailed Breakdown</h2>
      ${toolDetails}

      <h2>Our Verdict</h2>
      ${verdict}

      <h2>Which One Should You Choose?</h2>
      <p>Choose <strong>${topTools[0].name}</strong> if you want the best overall experience with strong features and reliability. Pick <strong>${topTools[1].name}</strong> if you're looking for ${topTools[1].pros[0].toLowerCase()}. Go with <strong>${topTools[2] ? topTools[2].name : topTools[1].name}</strong> if ${topTools[2] ? `budget is your primary concern` : `you want an alternative option`}.</p>

      <p class="article-footer">Found this comparison helpful? <a href="/">Explore more AI tools</a> or <a href="/submit.html">suggest a tool to add</a>.</p>
    `;

    articles.push({
      title,
      urlPath,
      metaDescription: generateMetaDescription(`Compare ${toolNames.join(' vs ')} in 2026. Detailed feature comparison, pricing, pros & cons to help you choose the best ${CATEGORIES[cat].singular.toLowerCase()}.`),
      keywords: [topTools.map(t => t.name.toLowerCase()).join(' vs '), 'comparison', '2026', 'review', CATEGORIES[cat].singular.toLowerCase(), 'alternatives'],
      content
    });

    if (articles.length >= maxCount) break;
  }

  articles.forEach(a => saveArticle(a));
}

// ============ 文章类型 2: 分类 Best-of ============

function generateBestOfArticles(maxCount) {
  console.log('\n📝 生成分类 Best-of 文章...');

  const articles = [];

  for (const [cat, info] of Object.entries(CATEGORIES)) {
    const catTools = getToolsByCategory(cat);
    if (catTools.length < 3) continue;

    const title = `${catTools.length} Best ${info.name} in 2026 (Ranked & Reviewed)`;
    const urlPath = `best-${cat}-tools-2026.html`;

    const toolCards = catTools.map((t, i) => `
<div class="tool-review-card">
  <h3><span class="rank">#${i + 1}</span> <a href="/tools/${t.slug}.html">${t.name}</a></h3>
  <p>${t.description}</p>
  <div class="review-meta">
    <span class="rating">Rating: ${'<span style="color:#F59E0B">&#9733;</span>'.repeat(Math.round(t.rating))} ${t.rating}/5</span>
    <span class="pricing">${t.pricing === 'free' ? 'Free' : t.pricing === 'freemium' ? `Freemium ($${t.priceFrom}+/mo)` : `Paid ($${t.priceFrom}+/mo)`}</span>
  </div>
  <p><strong>Why we picked it:</strong> ${t.pros[0]}. ${t.pros[1] ? `${t.pros[1]}.` : ''}</p>
  <ul>
    ${t.pros.map(p => `<li>${p}</li>`).join('')}
  </ul>
  ${t.cons.length ? `<p><strong>Drawbacks:</strong> ${t.cons[0]}</p>` : ''}
  <a href="${t.url}" class="cta-link" target="_blank" rel="noopener">Try ${t.name} &rarr;</a>
</div>
`).join('\n');

    const content = `
      <div class="ad-container" style="max-width:728px;margin:0 auto 2rem;text-align:center;">
        <p style="color:#9CA3AF;font-size:12px;">Advertisement</p>
      </div>

      <h1>${title}</h1>
      <p class="article-meta">Updated: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} | Reading time: 12 min</p>

      <p class="article-intro">We tested and ranked the best ${info.name.toLowerCase()} available in 2026. Whether you're a beginner or a professional, our comprehensive guide helps you find the perfect tool for your needs.</p>

      <h2>Quick Summary</h2>
      <table class="summary-table">
        <thead><tr><th>Rank</th><th>Tool</th><th>Rating</th><th>Pricing</th><th>Best For</th></tr></thead>
        <tbody>
        ${catTools.map((t, i) => `<tr><td>#${i + 1}</td><td><a href="/tools/${t.slug}.html">${t.name}</a></td><td>${t.rating}/5</td><td>${t.pricing}</td><td>${t.tags[0] || 'General'}</td></tr>`).join('')}
        </tbody>
      </table>

      <h2>Detailed Reviews</h2>
      ${toolCards}

      <h2>How We Selected These Tools</h2>
      <p>We evaluated each ${info.singular.toLowerCase()} based on five criteria: output quality, ease of use, pricing value, feature completeness, and user feedback. Our rankings are updated monthly to reflect the rapidly evolving AI landscape.</p>

      <h2>Final Thoughts</h2>
      <p>The ${info.name.toLowerCase()} market is more competitive than ever in 2026. <strong>${catTools[0].name}</strong> leads our list for good reason, but the best choice depends on your specific needs and budget. We recommend trying the free tiers first before committing to a paid plan.</p>

      <p class="article-footer">Want more recommendations? <a href="/">Browse all AI tools</a> or check out our <a href="/compare/chatgpt-vs-claude.html">head-to-head comparisons</a>.</p>
    `;

    articles.push({
      title,
      urlPath,
      metaDescription: generateMetaDescription(`Discover the ${catTools.length} best ${info.name.toLowerCase()} in 2026. Expert reviews, ratings, and comparisons. Free and paid options ranked.`),
      keywords: ['best', info.singular.toLowerCase(), '2026', 'review', 'top', 'ranked', ...catTools.slice(0, 5).map(t => t.name.toLowerCase())],
      content
    });

    if (articles.length >= maxCount) break;
  }

  articles.forEach(a => saveArticle(a));
}

// ============ 文章类型 3: 场景指南 ============

function generateGuideArticles(maxCount) {
  console.log('\n📝 生成场景指南文章...');

  const articles = [];

  for (const [scenarioKey, scenario] of Object.entries(SCENARIOS)) {
    const scenarioTools = tools.filter(t => scenario.targetTools.includes(t.category))
      .sort((a, b) => b.rating - a.rating);

    if (scenarioTools.length < 5) continue;

    const title = `Best AI Tools for ${scenario.title} in 2026 (${scenarioTools.length} Tools for ${scenario.description})`;
    const urlPath = `ai-tools-for-${scenarioKey}-2026.html`;

    // 按使用场景分组
    const grouped = {};
    scenarioTools.forEach(t => {
      const catName = CATEGORIES[t.category]?.name || t.category;
      if (!grouped[catName]) grouped[catName] = [];
      grouped[catName].push(t);
    });

    const sections = Object.entries(grouped).map(([catName, catTools]) => `
<h2>Best ${catName} for ${scenario.title}</h2>
${catTools.map((t, i) => `
<div class="guide-tool">
  <h3>${i + 1}. <a href="/tools/${t.slug}.html">${t.name}</a></h3>
  <p>${t.description}</p>
  <p><strong>Rating:</strong> ${t.rating}/5 | <strong>Pricing:</strong> ${t.pricing}${t.priceFrom > 0 ? ` ($${t.priceFrom}/mo)` : ''}</p>
  <a href="${t.url}" class="cta-link" target="_blank" rel="noopener">Try ${t.name} &rarr;</a>
</div>
`).join('\n')}
`).join('\n');

    const content = `
      <div class="ad-container" style="max-width:728px;margin:0 auto 2rem;text-align:center;">
        <p style="color:#9CA3AF;font-size:12px;">Advertisement</p>
      </div>

      <h1>${title}</h1>
      <p class="article-meta">Updated: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} | Reading time: 10 min</p>

      <p class="article-intro">Being a ${scenario.title.replace(/s$/, '').toLowerCase()} in 2026 means having access to powerful AI tools that can dramatically boost your productivity. We've curated ${scenarioTools.length} essential AI tools specifically for ${scenario.description}.</p>

      <h2>Why ${scenario.title} Need AI Tools</h2>
      <p>AI tools help ${scenario.title.replace(/s$/, '').toLowerCase()}s save time, reduce costs, and improve quality across their workflow. From automating repetitive tasks to enhancing creative output, the right AI tools can be a game-changer for your career or business.</p>

      ${sections}

      <h2>Getting Started: Our Recommendations</h2>
      <p>If you're new to AI tools, we recommend starting with these three:
      <ol>
        <li><strong>${scenarioTools[0].name}</strong> — ${scenarioTools[0].pros[0]}</li>
        <li><strong>${scenarioTools[1].name}</strong> — ${scenarioTools[1].pros[0]}</li>
        <li><strong>${scenarioTools[2].name}</strong> — ${scenarioTools[2].pros[0]}</li>
      </ol></p>

      <p>All three offer free tiers, so you can try them risk-free before upgrading.</p>

      <p class="article-footer">Explore more tools for ${scenario.title}: <a href="/categories.html">Browse by category</a></p>
    `;

    articles.push({
      title,
      urlPath,
      metaDescription: generateMetaDescription(`Complete guide to the best AI tools for ${scenario.title} in 2026. ${scenarioTools.length} curated tools for ${scenario.description}.`),
      keywords: ['ai tools', scenario.title.toLowerCase(), '2026', 'guide', 'best', ...scenario.targetTools],
      content
    });

    if (articles.length >= maxCount) break;
  }

  articles.forEach(a => saveArticle(a));
}

// ============ 文章类型 4: 免费工具合集 ============

function generateFreeToolsArticle() {
  console.log('\n📝 生成免费工具合集文章...');

  const freeTools = tools.filter(t => t.pricing === 'free' || t.pricing === 'freemium')
    .sort((a, b) => b.rating - a.rating);

  if (freeTools.length < 5) {
    console.log('  ⚠️ 免费工具不足 5 个，跳过');
    return;
  }

  const title = `${freeTools.length} Best Free AI Tools You Should Try in 2026`;
  const urlPath = 'best-free-ai-tools-2026.html';

  const toolList = freeTools.map((t, i) => `
<h3>${i + 1}. <a href="/tools/${t.slug}.html">${t.name}</a> ${'<span style="color:#F59E0B">&#9733;</span>'.repeat(Math.round(t.rating))}</h3>
<p>${t.description}</p>
<p><em>Category: ${CATEGORIES[t.category]?.name || t.category} | ${t.pricing === 'free' ? '100% Free' : 'Free tier available'}</em></p>
<ul>
${t.pros.slice(0, 3).map(p => `<li>${p}</li>`).join('')}
</ul>
`).join('\n');

  const content = `
    <div class="ad-container" style="max-width:728px;margin:0 auto 2rem;text-align:center;">
      <p style="color:#9CA3AF;font-size:12px;">Advertisement</p>
    </div>

    <h1>${title}</h1>
    <p class="article-meta">Updated: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} | Reading time: 15 min</p>

    <p class="article-intro">You don't need to spend a fortune to access powerful AI tools. We've compiled ${freeTools.length} of the best free and freemium AI tools available in 2026 that deliver real value at zero cost.</p>

    <h2>Complete List: Best Free AI Tools</h2>
    ${toolList}

    <h2>Tips for Getting the Most from Free AI Tools</h2>
    <ul>
      <li><strong>Combine multiple tools:</strong> No single free tool does everything. Build your own AI toolkit by combining complementary tools.</li>
      <li><strong>Use daily limits wisely:</strong> Most freemium tools reset their free tier daily or monthly. Set reminders to make the most of each reset.</li>
      <li><strong>Upgrade strategically:</strong> Only pay for tools you use daily. The free tier of 5 tools is better than paying for 1 premium tool you barely use.</li>
      <li><strong>Watch for special offers:</strong> Many AI tools offer temporary premium access during launches or holidays.</li>
    </ul>

    <p class="article-footer">Found a great free AI tool we missed? <a href="/submit.html">Submit it here</a> and we'll add it to our list.</p>
  `;

  saveArticle({
    title,
    urlPath,
    metaDescription: generateMetaDescription(`${freeTools.length} best free AI tools in 2026. No credit card required. Expert-tested free and freemium AI tools for every category.`),
    keywords: ['free ai tools', '2026', 'no cost', 'freemium', 'best', ...freeTools.slice(0, 10).map(t => t.name.toLowerCase())],
    content
  });
}

// ============ 文章类型 5: 替代品评测 ============

function generateAlternativeArticles(maxCount) {
  console.log('\n📝 生成替代品文章...');

  const articles = [];
  // 选择评分高且有足够替代品的工具
  const candidates = tools
    .filter(t => t.featured || t.rating >= 4.5)
    .sort((a, b) => b.rating - a.rating);

  for (const tool of candidates) {
    const alternatives = getAlternatives(tool.slug);
    if (alternatives.length < 3) continue;

    const title = `Top ${alternatives.length} ${tool.name} Alternatives in 2026 (Free & Paid)`;
    const urlPath = `${tool.slug}-alternatives-2026.html`;

    const altList = alternatives.map((alt, i) => `
<h3>${i + 1}. <a href="/tools/${alt.slug}.html">${alt.name}</a> ${'<span style="color:#F59E0B">&#9733;</span>'.repeat(Math.round(alt.rating))}</h3>
<p>${alt.description}</p>
<p><strong>Pricing:</strong> ${alt.pricing === 'free' ? 'Free' : alt.pricing === 'freemium' ? `Freemium ($${alt.priceFrom}+/mo)` : `Paid ($${alt.priceFrom}+/mo)`}</p>
<p><strong>Why choose this over ${tool.name}:</strong> ${alt.pros[0]}</p>
`).join('\n');

    const content = `
      <div class="ad-container" style="max-width:728px;margin:0 auto 2rem;text-align:center;">
        <p style="color:#9CA3AF;font-size:12px;">Advertisement</p>
      </div>

      <h1>${title}</h1>
      <p class="article-meta">Updated: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} | Reading time: 9 min</p>

      <p class="article-intro">${tool.name} is a great tool, but it's not the only option. Whether you're looking for a cheaper alternative, different features, or a different approach, here are the ${alternatives.length} best ${tool.name} alternatives in 2026.</p>

      <h2>Quick Comparison</h2>
      <table class="summary-table">
        <thead><tr><th>Tool</th><th>Rating</th><th>Pricing</th><th>Best For</th></tr></thead>
        <tbody>
          <tr><td><a href="/tools/${tool.slug}.html">${tool.name}</a> (Original)</td><td>${tool.rating}/5</td><td>${tool.pricing}</td><td>${tool.tags[0]}</td></tr>
          ${alternatives.map(alt => `<tr><td><a href="/tools/${alt.slug}.html">${alt.name}</a></td><td>${alt.rating}/5</td><td>${alt.pricing}</td><td>${alt.tags[0]}</td></tr>`).join('')}
        </tbody>
      </table>

      <h2>Detailed Alternatives</h2>
      ${altList}

      <h2>How to Choose</h2>
      <p>If you love ${tool.name} but want alternatives, consider what matters most to you:
      <ul>
        <li><strong>Budget:</strong> ${alternatives.find(a => a.pricing === 'free')?.name || alternatives[0].name} is the best free option</li>
        <li><strong>Features:</strong> ${alternatives[0].name} offers the most similar feature set</li>
        <li><strong>Quality:</strong> ${alternatives.sort((a, b) => b.rating - a.rating)[0].name} has the highest rating</li>
      </ul></p>

      <p class="article-footer">Compare more tools: <a href="/categories.html">Browse by category</a></p>
    `;

    articles.push({
      title,
      urlPath,
      metaDescription: generateMetaDescription(`Top ${alternatives.length} ${tool.name} alternatives in 2026. Compare features, pricing, and quality. Free and paid options reviewed.`),
      keywords: [tool.name.toLowerCase(), 'alternatives', 'similar', 'vs', 'replacement', '2026', ...alternatives.map(a => a.name.toLowerCase())],
      content
    });

    if (articles.length >= maxCount) break;
  }

  articles.forEach(a => saveArticle(a));
}

// ============ 主入口 ============

function main() {
  // Load existing manifest to preserve articles from previous runs
  let manifestPath = path.join(__dirname, '..', 'dist', 'blog', 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      existing.forEach(a => {
        if (!blogManifest.some(b => b.url === a.url)) {
          blogManifest.push(a);
        }
      });
      console.log(`  📋 Loaded ${existing.length} existing articles from manifest`);
    } catch(e) {}
  }

  const args = process.argv.slice(2);
  const typeArg = args.find(a => a.startsWith('--type'))?.split('=')[1] || null;
  const countArg = parseInt(args.find(a => a.startsWith('--count'))?.split('=')[1]) || 10;

  console.log('🤖 AI Tools Hub — SEO Article Generator');
  console.log('='.repeat(50));
  console.log(`📦 基于数据库中 ${tools.length} 个工具生成文章`);
  console.log(`📊 每种类型最多生成 ${countArg} 篇`);
  console.log('');

  if (!typeArg || typeArg === 'compare') generateCompareArticles(countArg);
  if (!typeArg || typeArg === 'best-of') generateBestOfArticles(countArg);
  if (!typeArg || typeArg === 'guide') generateGuideArticles(countArg);
  if (!typeArg || typeArg === 'free') generateFreeToolsArticle();
  if (!typeArg || typeArg === 'alternatives') generateAlternativeArticles(countArg);

  console.log('');
  console.log('='.repeat(50));
  console.log(`✅ 共生成 ${articleCount} 篇 SEO 文章`);
  console.log(`📂 保存到: dist/blog/`);
  console.log('');
  console.log('💡 提示: 运行 node build.js 会重新生成全站，博客文章也会更新');

  // Write blog manifest for build.js blog index generation
  manifestPath = path.join(__dirname, '..', 'dist', 'blog', 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(blogManifest, null, 2));
  console.log(`  📋 Blog manifest saved: ${blogManifest.length} articles`);
}

main();
