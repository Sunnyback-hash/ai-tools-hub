/**
 * add-tool.js - AI 工具条目自动生成器
 * 支持三种模式：
 *   1. 交互式录入: node scripts/add-tool.js interactive
 *   2. 快速添加:   node scripts/add-tool.js --name "Tool Name" --url https://example.com
 *   3. CSV 批量导入: node scripts/add-tool.js csv --file data/import.csv
 *
 * 所有模式都会自动补全: slug, pros, cons, tags, alternatives, category
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const toolsPath = path.join(__dirname, '..', 'data', 'tools.json');
const tools = JSON.parse(fs.readFileSync(toolsPath, 'utf-8'));

const CATEGORIES = {
  'ai-chatbot': 'AI Chatbots',
  'ai-image': 'AI Image Generation',
  'ai-video': 'AI Video',
  'ai-coding': 'AI Coding',
  'ai-writing': 'AI Writing',
  'ai-research': 'AI Research',
  'ai-audio': 'AI Audio',
  'ai-design': 'AI Design',
  'ai-productivity': 'AI Productivity',
  'ai-marketing': 'AI Marketing'
};

const CATEGORY_KEYWORDS = {
  'ai-chatbot': ['chatbot', 'chat', 'assistant', 'gpt', 'claude', 'dialogue', 'conversational', 'copilot'],
  'ai-image': ['image', 'art', 'illustration', 'drawing', 'photo', 'avatar', 'picture', 'visual', 'logo'],
  'ai-video': ['video', 'animation', 'motion', 'filmmak', 'vfx', 'clip', 'avatar', 'presentation'],
  'ai-coding': ['code', 'programming', 'developer', 'debug', 'deploy', 'api', 'ide', 'terminal', 'github'],
  'ai-writing': ['writing', 'copy', 'content', 'blog', 'article', 'text', 'grammar', 'seo', 'translation'],
  'ai-research': ['research', 'search', 'analyze', 'data', 'science', 'insight', 'paper', 'academic', 'pdf'],
  'ai-audio': ['audio', 'music', 'voice', 'speech', 'sound', 'tts', 'podcast', 'transcri', 'sing'],
  'ai-design': ['design', 'ui', 'ux', 'layout', 'mockup', 'wireframe', 'prototype', 'brand', 'figma'],
  'ai-productivity': ['productivity', 'workflow', 'automat', 'task', 'schedule', 'meeting', 'note', 'calendar', 'email'],
  'ai-marketing': ['marketing', 'ad', 'social media', 'analytics', 'funnel', 'campaign', 'seo tool', 'crm']
};

const PROS_TEMPLATES = {
  'ai-chatbot': ['Fast and responsive', 'Good at understanding context', 'Multi-platform availability', 'Regular model updates', 'Customizable personality'],
  'ai-image': ['High-quality output', 'Fast generation', 'Style variety', 'Batch processing', 'API access available'],
  'ai-video': ['Professional results', 'Easy to use', 'Multiple templates', 'Quick rendering', 'Export flexibility'],
  'ai-coding': ['Accurate suggestions', 'Multi-language support', 'IDE integration', 'Context awareness', 'Fast response time'],
  'ai-writing': ['Natural language output', 'Tone customization', 'SEO-friendly', 'Bulk generation', 'Multiple formats'],
  'ai-research': ['Comprehensive results', 'Citation support', 'Multi-source analysis', 'Time efficient', 'Export options'],
  'ai-audio': ['Natural voice quality', 'Multiple languages', 'Customizable speed', 'Emotion support', 'Batch processing'],
  'ai-design': ['Professional templates', 'Easy customization', 'Brand consistency', 'Responsive output', 'Collaboration features'],
  'ai-productivity': ['Time-saving automation', 'Cross-platform sync', 'Team collaboration', 'Smart reminders', 'Integration ecosystem'],
  'ai-marketing': ['ROI tracking', 'Multi-channel support', 'A/B testing', 'Audience targeting', 'Analytics dashboard']
};

const CONS_TEMPLATES = {
  'ai-chatbot': ['May produce hallucinations', 'Limited to training data', 'Privacy concerns with sensitive data', 'Response inconsistency'],
  'ai-image': ['Prompt engineering needed', 'Limited resolution options', 'Style limitations', 'Free tier restrictions'],
  'ai-video': ['Long rendering times', 'Watermark on free plan', 'Storage requirements', 'Limited editing options'],
  'ai-coding': ['Needs manual review', 'Context window limits', 'Subscription cost', 'False positives possible'],
  'ai-writing': ['May lack originality', 'Generic phrasing possible', 'Requires fact-checking', 'Premium features locked'],
  'ai-research': ['Source bias possible', 'English-centric', 'Requires verification', 'Depth limitations'],
  'ai-audio': ['Robotic artifacts', 'Limited emotional range', 'Long audio processing', 'Accent limitations'],
  'ai-design': ['Template rigidity', 'Export format limits', 'Learning curve', 'Asset management'],
  'ai-productivity': ['Setup complexity', 'Integration friction', 'Data lock-in', 'Feature overload'],
  'ai-marketing': ['Data privacy concerns', 'Cost at scale', 'Learning curve', 'Platform dependency']
};

function slugify(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function inferCategory(name, description, url) {
  const text = (name + ' ' + description + ' ' + url).toLowerCase();
  const scores = {};
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    scores[cat] = keywords.reduce((sum, kw) => sum + (text.includes(kw) ? 1 : 0), 0);
  }
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return best[1] > 0 ? best[0] : 'ai-productivity';
}

function generateEntry(input) {
  const slug = input.slug || slugify(input.name);
  const category = input.category || inferCategory(input.name, input.description || '', input.url || '');

  // 从同类工具找替代品
  const alternatives = tools
    .filter(t => t.category === category && t.slug !== slug)
    .slice(0, 3)
    .map(t => t.slug);

  // 生成 pros/cons
  const allPros = PROS_TEMPLATES[category] || PROS_TEMPLATES['ai-productivity'];
  const allCons = CONS_TEMPLATES[category] || CONS_TEMPLATES['ai-productivity'];
  const pros = input.pros || shuffleArray([...allPros]).slice(0, 4);
  const cons = input.cons || shuffleArray([...allCons]).slice(0, 3);

  return {
    name: input.name,
    slug: slug,
    url: input.url || '',
    description: input.description || `${input.name} - AI-powered ${CATEGORIES[category] || category} tool.`,
    category: category,
    pricing: input.pricing || 'unknown',
    priceFrom: input.priceFrom || 0,
    pros: pros,
    cons: cons,
    rating: input.rating || 4.0,
    tags: input.tags || generateTags(input.name, category),
    featured: input.featured || false,
    alternatives: alternatives
  };
}

function generateTags(name, category) {
  const catName = CATEGORIES[category] || category;
  const keywords = CATEGORY_KEYWORDS[category] || [];
  const relevant = keywords.filter(kw => name.toLowerCase().includes(kw));
  const base = relevant.length > 0 ? relevant : [keywords[0]];
  return [...base, catName.toLowerCase().replace('ai ', '')];
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function validateEntry(entry) {
  const errors = [];
  if (!entry.name) errors.push('缺少 name');
  if (!entry.url) errors.push('缺少 url');
  if (!entry.description) errors.push('缺少 description');

  // 检查重复
  const dupSlug = tools.find(t => t.slug === entry.slug);
  if (dupSlug) errors.push(`slug "${entry.slug}" 已存在 (${dupSlug.name})`);

  const dupName = tools.find(t => t.name.toLowerCase() === entry.name.toLowerCase());
  if (dupName) errors.push(`名称 "${entry.name}" 已存在`);

  const dupUrl = tools.find(t => t.url.toLowerCase() === entry.url.toLowerCase());
  if (dupUrl) errors.push(`URL "${entry.url}" 已存在`);

  return errors;
}

function addToolToDatabase(entry) {
  const errors = validateEntry(entry);
  if (errors.length > 0) {
    console.log('❌ 验证失败:');
    errors.forEach(e => console.log(`   - ${e}`));
    return false;
  }

  tools.push(entry);
  fs.writeFileSync(toolsPath, JSON.stringify(tools, null, 2));
  console.log(`✅ 已添加: ${entry.name} (${entry.category})`);
  return true;
}

// ============ 模式 1: 交互式录入 ============

async function interactiveMode() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const ask = (question) => new Promise(resolve => rl.question(question, resolve));

  console.log('\n🤖 AI 工具交互式录入器');
  console.log('='.repeat(40));
  console.log('输入工具基本信息，自动补全其余字段\n');

  const name = await ask('工具名称: ');
  const url = await ask('官网 URL: ');
  const description = await ask('简短描述 (英文): ');
  const categoryInput = await ask(`分类 (留空自动推断): `);
  const pricing = await ask('定价 (free/freemium/paid): ');
  const priceFrom = parseFloat(await ask('起始价格 ($/月, 0): ')) || 0;
  const rating = parseFloat(await ask('评分 (1-5): ')) || 4.0;

  const category = categoryInput ? categoryInput : inferCategory(name, description, url);

  rl.close();

  const entry = generateEntry({
    name, url, description, category, pricing, priceFrom, rating
  });

  console.log('\n📋 预览:');
  console.log(JSON.stringify(entry, null, 2));

  addToolToDatabase(entry);
  console.log(`\n📊 当前共 ${tools.length} 个工具`);
}

// ============ 模式 2: 命令行快速添加 ============

function quickAdd(args) {
  const name = args['--name'];
  const url = args['--url'];
  const desc = args['--desc'] || '';
  const cat = args['--category'] || '';
  const pricing = args['--pricing'] || 'unknown';
  const price = parseFloat(args['--price']) || 0;

  if (!name || !url) {
    console.log('❌ 至少需要 --name 和 --url 参数');
    console.log('用法: node scripts/add-tool.js --name "Tool Name" --url https://example.com [--desc "描述"] [--category ai-coding] [--pricing freemium] [--price 20]');
    process.exit(1);
  }

  const entry = generateEntry({
    name, url, description: desc, category: cat || null, pricing, priceFrom: price
  });

  addToolToDatabase(entry);
  console.log(`\n📊 当前共 ${tools.length} 个工具`);
}

// ============ 模式 3: CSV 批量导入 ============

function csvImport(args) {
  const filePath = args['--file'] || path.join(__dirname, '..', 'data', 'import.csv');

  if (!fs.existsSync(filePath)) {
    console.log(`❌ CSV 文件不存在: ${filePath}`);
    console.log('');
    console.log('CSV 格式示例 (保存为 data/import.csv):');
    console.log('name,url,description,category,pricing,priceFrom,rating');
    console.log('MyTool,https://mytool.com,A great AI tool,ai-coding,freemium,0,4.2');
    console.log('AnotherTool,https://anothertool.com,Another cool tool,ai-image,paid,10,4.5');
    console.log('');
    console.log('可选字段: tags (逗号分隔)');
    return;
  }

  const csv = fs.readFileSync(filePath, 'utf-8');
  const lines = csv.trim().split('\n');

  if (lines.length < 2) {
    console.log('❌ CSV 文件为空或只有标题行');
    return;
  }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

  let added = 0, skipped = 0, errors = 0;

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < 2) continue;

    const row = {};
    headers.forEach((h, idx) => { row[h] = values[idx] || ''; });

    const entry = generateEntry({
      name: row.name,
      url: row.url,
      description: row.description || '',
      category: row.category || null,
      pricing: row.pricing || 'unknown',
      priceFrom: parseFloat(row.pricefrom || row.price || 0),
      rating: parseFloat(row.rating || 4.0),
      tags: row.tags ? row.tags.split(';').map(t => t.trim()) : null
    });

    const validationErrors = validateEntry(entry);
    if (validationErrors.length > 0) {
      console.log(`⏭️ 跳过 "${row.name}": ${validationErrors.join(', ')}`);
      skipped++;
      continue;
    }

    tools.push(entry);
    console.log(`✅ 添加: ${entry.name} (${entry.category})`);
    added++;
  }

  if (added > 0) {
    fs.writeFileSync(toolsPath, JSON.stringify(tools, null, 2));
  }

  console.log('');
  console.log('='.repeat(40));
  console.log(`📊 导入完成: 添加 ${added} 个, 跳过 ${skipped} 个, 失败 ${errors} 个`);
  console.log(`📊 数据库现有 ${tools.length} 个工具`);
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

// ============ 导入 new-tools.json ============

function importNewTools() {
  const newToolsPath = path.join(__dirname, '..', 'data', 'new-tools.json');
  if (!fs.existsSync(newToolsPath)) {
    console.log('❌ 未发现 data/new-tools.json，请先运行: node scripts/discover-tools.js');
    return;
  }

  const newTools = JSON.parse(fs.readFileSync(newToolsPath, 'utf-8'));
  console.log(`📦 发现 ${newTools.length} 个待导入工具\n`);

  let added = 0, skipped = 0;

  newTools.forEach(tool => {
    const entry = generateEntry({
      ...tool,
      slug: tool.slug || slugify(tool.name)
    });

    delete entry.discovered;
    delete entry.needsReview;

    const validationErrors = validateEntry(entry);
    if (validationErrors.length > 0) {
      console.log(`⏭️ 跳过 "${entry.name}": ${validationErrors.join(', ')}`);
      skipped++;
      return;
    }

    tools.push(entry);
    console.log(`✅ 添加: ${entry.name} → ${CATEGORIES[entry.category] || entry.category}`);
    added++;
  });

  if (added > 0) {
    fs.writeFileSync(toolsPath, JSON.stringify(tools, null, 2));
    // 备份已导入
    fs.renameSync(newToolsPath, newToolsPath + '.imported');
    console.log(`\n✅ new-tools.json 已重命名为 new-tools.json.imported`);
  }

  console.log('');
  console.log('='.repeat(40));
  console.log(`📊 导入完成: 添加 ${added} 个, 跳过 ${skipped} 个`);
  console.log(`📊 数据库现有 ${tools.length} 个工具`);
}

// ============ 主入口 ============

const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'interactive':
    interactiveMode();
    break;
  case 'csv':
    csvImport({ '--file': args[2] || null });
    break;
  case 'import':
    importNewTools();
    break;
  default:
    // 解析 --key value 参数
    if (args.includes('--name')) {
      const parsed = {};
      for (let i = 0; i < args.length; i++) {
        if (args[i].startsWith('--') && i + 1 < args.length) {
          parsed[args[i]] = args[i + 1];
          i++;
        }
      }
      quickAdd(parsed);
    } else {
      console.log('');
      console.log('🤖 AI 工具条目自动生成器');
      console.log('='.repeat(40));
      console.log('');
      console.log('用法:');
      console.log('');
      console.log('  1. 交互式录入:');
      console.log('     node scripts/add-tool.js interactive');
      console.log('');
      console.log('  2. 命令行快速添加:');
      console.log('     node scripts/add-tool.js --name "Tool Name" --url https://example.com');
      console.log('     node scripts/add-tool.js --name "X" --url https://x.com --desc "描述" --category ai-coding --pricing freemium --price 20');
      console.log('');
      console.log('  3. CSV 批量导入:');
      console.log('     node scripts/add-tool.js csv --file data/import.csv');
      console.log('');
      console.log('  4. 导入发现的新工具:');
      console.log('     node scripts/add-tool.js import');
      console.log('');
      console.log('💡 自动补全: slug, pros, cons, tags, alternatives, category 推断');
    }
}
