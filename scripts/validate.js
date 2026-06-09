/**
 * validate.js - 数据校验脚本
 * 校验 tools.json 数据完整性，发现问题并提供修复建议
 *
 * 用法: node scripts/validate.js
 */

const fs = require('fs');
const path = require('path');

const toolsPath = path.join(__dirname, '..', 'data', 'tools.json');
const tools = JSON.parse(fs.readFileSync(toolsPath, 'utf-8'));

const CATEGORIES = [
  'ai-chatbot', 'ai-image', 'ai-video', 'ai-coding',
  'ai-writing', 'ai-research', 'ai-audio', 'ai-design',
  'ai-productivity', 'ai-marketing'
];

const REQUIRED_FIELDS = ['name', 'slug', 'url', 'description', 'category', 'pricing', 'pros', 'cons', 'rating', 'tags', 'alternatives'];

let errors = 0;
let warnings = 0;
let suggestions = 0;

function error(msg) { console.log(`  ❌ ERROR: ${msg}`); errors++; }
function warn(msg) { console.log(`  ⚠️ WARN: ${msg}`); warnings++; }
function info(msg) { console.log(`  💡 ${msg}`); suggestions++; }

console.log('🔍 AI Tools Hub — Data Validator');
console.log('='.repeat(50));
console.log(`📦 检查 ${tools.length} 个工具\n`);

// 1. JSON 格式检查
console.log('📋 [1/8] JSON 结构检查...');
if (!Array.isArray(tools)) error('tools.json 不是数组');
console.log('');

// 2. 必填字段检查
console.log('📋 [2/8] 必填字段检查...');
tools.forEach((t, i) => {
  REQUIRED_FIELDS.forEach(field => {
    if (!t[field] && t[field] !== 0) {
      error(`工具 #${i + 1} "${t.name || 'UNKNOWN'}" 缺少字段: ${field}`);
    }
  });
  if (t.pros && t.pros.length === 0) warn(`工具 "${t.name}" pros 为空`);
  if (t.cons && t.cons.length === 0) warn(`工具 "${t.name}" cons 为空`);
  if (t.tags && t.tags.length === 0) warn(`工具 "${t.name}" tags 为空`);
});
console.log('');

// 3. 重复检查
console.log('📋 [3/8] 重复检查...');
const seenSlugs = {};
const seenUrls = {};
const seenNames = {};
tools.forEach((t, i) => {
  if (seenSlugs[t.slug]) {
    error(`Slug 重复: "${t.slug}" — 工具 #${seenSlugs[t.slug]} 和 #${i + 1}`);
  }
  seenSlugs[t.slug] = i + 1;

  const urlKey = (t.url || '').toLowerCase().replace(/\/+$/, '');
  if (seenUrls[urlKey]) {
    warn(`URL 重复: "${t.url}" — "${tools[seenUrls[urlKey] - 1].name}" 和 "${t.name}"`);
  }
  seenUrls[urlKey] = i + 1;

  const nameKey = t.name.toLowerCase();
  if (seenNames[nameKey]) {
    error(`名称重复: "${t.name}" — 工具 #${seenNames[nameKey]} 和 #${i + 1}`);
  }
  seenNames[nameKey] = i + 1;
});
console.log('');

// 4. Slug 格式检查
console.log('📋 [4/8] Slug 格式检查...');
tools.forEach((t, i) => {
  if (!/^[a-z0-9-]+$/.test(t.slug)) {
    error(`工具 "${t.name}" 的 slug "${t.slug}" 格式不正确 (只允许小写字母、数字、连字符)`);
  }
  if (t.slug !== t.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')) {
    info(`工具 "${t.name}" 的 slug 可以优化: 建议改为 "${t.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}"`);
  }
});
console.log('');

// 5. URL 检查
console.log('📋 [5/8] URL 检查...');
tools.forEach((t, i) => {
  if (!t.url.startsWith('http://') && !t.url.startsWith('https://')) {
    error(`工具 "${t.name}" 的 URL 格式不正确: "${t.url}"`);
  }
  if (t.url.includes(' ')) {
    warn(`工具 "${t.name}" 的 URL 包含空格`);
  }
  if (t.url.endsWith('/')) {
    info(`工具 "${t.name}" 的 URL 以 / 结尾，建议去除`);
  }
});
console.log('');

// 6. 分类检查
console.log('📋 [6/8] 分类检查...');
const catStats = {};
tools.forEach(t => {
  catStats[t.category] = (catStats[t.category] || 0) + 1;
  if (!CATEGORIES.includes(t.category)) {
    error(`工具 "${t.name}" 使用了未知分类: "${t.category}"`);
  }
});
console.log('   分类分布:');
Object.entries(catStats).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
  const icon = CATEGORIES.includes(cat) ? '✅' : '❌';
  console.log(`   ${icon} ${cat}: ${count} 个工具`);
});
console.log('');

// 7. 定价检查
console.log('📋 [7/8] 定价检查...');
tools.forEach(t => {
  if (!['free', 'freemium', 'paid', 'unknown'].includes(t.pricing)) {
    error(`工具 "${t.name}" 的 pricing 值无效: "${t.pricing}" (应为 free/freemium/paid/unknown)`);
  }
  if (t.pricing === 'free' && t.priceFrom > 0) {
    warn(`工具 "${t.name}" 标记为 free 但 priceFrom 为 ${t.priceFrom}`);
  }
  if (t.pricing === 'paid' && t.priceFrom === 0) {
    warn(`工具 "${t.name}" 标记为 paid 但 priceFrom 为 0`);
  }
});
console.log('');

// 8. 关联完整性检查
console.log('📋 [8/8] 关联完整性检查...');
tools.forEach(t => {
  if (t.alternatives && t.alternatives.length > 0) {
    t.alternatives.forEach(altSlug => {
      const altTool = tools.find(x => x.slug === altSlug);
      if (!altTool) {
        warn(`工具 "${t.name}" 的替代品 "${altSlug}" 不存在于数据库中`);
      } else if (altTool.category !== t.category) {
        info(`工具 "${t.name}" 的替代品 "${altSlug}" 不在同一分类 (${t.category} vs ${altTool.category})`);
      }
    });
  }
  // 评分范围
  if (typeof t.rating !== 'number' || t.rating < 0 || t.rating > 5) {
    error(`工具 "${t.name}" 的 rating 值无效: ${t.rating} (应为 0-5 的数字)`);
  }
  if (t.rating > 0 && t.rating < 3) {
    info(`工具 "${t.name}" 评分 ${t.rating} 偏低，请确认是否准确`);
  }
});
console.log('');

// 总结
console.log('='.repeat(50));
const hasErrors = errors > 0;
const hasWarnings = warnings > 0;
console.log(`📊 结果: ${errors} 错误 | ${warnings} 警告 | ${suggestions} 建议`);
console.log('');

if (hasErrors) {
  console.log('🔴 存在数据错误，请修复后再构建');
  process.exit(1);
} else if (hasWarnings) {
  console.log('🟡 存在警告，建议修复但不影响构建');
  process.exit(0);
} else {
  console.log('🟢 数据校验通过，可以安全构建');
  process.exit(0);
}
