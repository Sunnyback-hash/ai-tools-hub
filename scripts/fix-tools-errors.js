#!/usr/bin/env node
/**
 * fix-tools-errors.js
 * 修复 tools.json 中的数据错误
 */

const fs = require('fs');
const path = require('path');

const TOOLS_FILE = path.join(__dirname, '..', 'data', 'tools.json');

console.log('🔧 修复 tools.json 数据错误...\n');

// 读取工具数据
let tools;
try {
  tools = JSON.parse(fs.readFileSync(TOOLS_FILE, 'utf8'));
  console.log(`✅ 已读取 ${tools.length} 个工具\n`);
} catch (e) {
  console.error('❌ 读取失败:', e.message);
  process.exit(1);
}

let fixed = 0;

// 1. 修复 index 101: "Poe by Quora" 的 slug 重复
if (tools[101] && tools[101].name === 'Poe by Quora') {
  console.log('[1/3] 修复 "Poe by Quora" 的 slug...');
  tools[101].slug = 'poe-by-quora';
  console.log(`  ✅ slug: "poe" → "poe-by-quora"\n`);
  fixed++;
} else {
  console.log('[1/3] 未找到 index 101 的 "Poe by Quora"\n`);
}

// 2. 修复 index 95: "Replicate" 的 pricing 值
if (tools[95] && tools[95].name === 'Replicate') {
  console.log('[2/3] 修复 "Replicate" 的 pricing...');
  console.log(`  原值: "${tools[95].pricing}"`);
  tools[95].pricing = 'freemium'; // Replicate 有免费额度
  console.log(`  ✅ pricing: "pay-as-you-go" → "freemium"\n`);
  fixed++;
} else {
  console.log('[2/3] 未找到 index 95 的 "Replicate"\n`);
}

// 3. 修复 index 102: "Together AI" 的 pricing 值
if (tools[102] && tools[102].name === 'Together AI') {
  console.log('[3/3] 修复 "Together AI" 的 pricing...');
  console.log(`  原值: "${tools[102].pricing}"`);
  tools[102].pricing = 'pay-as-you-go'; // 保持原值但需要在 validate.js 中添加支持
  // 实际上应该改为 'freemium' 或 'paid'
  tools[102].pricing = 'freemium'; // Together AI 有免费额度
  console.log(`  ✅ pricing: "pay-as-you-go" → "freemium"\n`);
  fixed++;
} else {
  console.log('[3/3] 未找到 index 102 的 "Together AI"\n`);
}

// 保存修复后的数据
try {
  fs.writeFileSync(TOOLS_FILE, JSON.stringify(tools, null, 2));
  console.log(`✅ 已保存修复后的数据 (${fixed} 处修复)\n`);
} catch (e) {
  console.error('❌ 保存失败:', e.message);
  process.exit(1);
}

// 重新验证
console.log('🔍 重新验证数据...\n');
const { execSync } = require('child_process');
try {
  execSync('node scripts/validate.js', {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });
  console.log('\n✅ 验证通过！');
} catch (e) {
  console.log('\n⚠️ 仍有错误，请手动检查');
}
