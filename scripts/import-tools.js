/**
 * import-tools.js - 将 new-tools.json 自动合并到 tools.json
 * 用法: node scripts/import-tools.js
 */

const fs = require('fs');
const path = require('path');

const toolsPath = path.join(__dirname, '..', 'data', 'tools.json');
const newToolsPath = path.join(__dirname, '..', 'data', 'new-tools.json');

// 读取现有工具
const tools = JSON.parse(fs.readFileSync(toolsPath, 'utf-8'));
const existingSlugs = new Set(tools.map(t => t.slug));
const existingNames = new Set(tools.map(t => t.name.toLowerCase()));

// 读取新工具
if (!fs.existsSync(newToolsPath)) {
  console.log('No new tools found (data/new-tools.json does not exist)');
  process.exit(0);
}

const newTools = JSON.parse(fs.readFileSync(newToolsPath, 'utf-8'));
if (!newTools.length) {
  console.log('No new tools to import');
  process.exit(0);
}

// 过滤掉重复
const toImport = newTools.filter(t => {
  const slug = t.slug || t.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
  return !existingSlugs.has(slug) && !existingNames.has(t.name.toLowerCase());
});

if (!toImport.length) {
  console.log('All new tools already exist in tools.json');
  process.exit(0);
}

// 合并
toImport.forEach(t => {
  // 确保必要字段存在
  if (!t.slug) t.slug = t.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
  if (!t.rating) t.rating = 4.0;
  if (!t.pros) t.pros = ['Easy to use', 'Good output quality', 'Active development'];
  if (!t.cons) t.cons = ['Limited free tier', 'Learning curve'];
  if (!t.alternatives) t.alternatives = [];
  if (!t.tags) t.tags = [t.category ? t.category.replace('ai-', '') : 'ai'];
  t.importedAt = new Date().toISOString().split('T')[0];
  delete t.discovered;
  delete t.needsReview;
});

tools.push(...toImport);

// 保存
fs.writeFileSync(toolsPath, JSON.stringify(tools, null, 2), 'utf-8');

console.log(`✅ Imported ${toImport.length} new tools`);
console.log(`📦 Total tools: ${tools.length}`);
toImport.forEach((t, i) => {
  console.log(`  ${i+1}. ${t.name} (${t.category})`);
});

// 清空 new-tools.json 避免重复导入
fs.writeFileSync(newToolsPath, '[]', 'utf-8');
console.log('🧹 Cleared new-tools.json');
