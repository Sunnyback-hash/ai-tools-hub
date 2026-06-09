#!/usr/bin/env node
/**
 * pipeline.js - 一键自动化流水线
 * 完整流程: 校验 → 发现新工具 → 导入 → 生成文章 → 构建
 *
 * 用法:
 *   node scripts/pipeline.js              # 执行完整流水线
 *   node scripts/pipeline.js --skip-discover  # 跳过工具发现
 *   node scripts/pipeline.js --skip-articles  # 跳过文章生成
 *   node scripts/pipeline.js --validate-only  # 仅校验
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const scriptsDir = path.join(__dirname);
const rootDir = path.join(__dirname, '..');

const startTime = Date.now();

function step(name, cmd, canSkip = true) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`▶ ${name}`);
  console.log(`${'='.repeat(60)}\n`);

  try {
    execSync(cmd, {
      cwd: rootDir,
      stdio: 'inherit',
      timeout: 120000
    });
    console.log(`\n✅ ${name} 完成`);
    return true;
  } catch (e) {
    if (canSkip) {
      console.log(`\n⚠️ ${name} 失败（非阻塞），继续下一步...`);
      return false;
    }
    console.log(`\n❌ ${name} 失败（阻塞），终止流水线`);
    process.exit(1);
  }
}

function main() {
  const args = process.argv.slice(2);
  const skipDiscover = args.includes('--skip-discover');
  const skipArticles = args.includes('--skip-articles');
  const validateOnly = args.includes('--validate-only');

  console.log('');
  console.log('🚀 AI Tools Hub — 自动化流水线');
  console.log('━'.repeat(40));
  console.log(`⏰ 开始时间: ${new Date().toLocaleTimeString('zh-CN')}`);
  console.log(`📂 工作目录: ${rootDir}`);
  console.log('');

  // Step 1: 数据校验（必须）
  step('Step 1: 数据校验', `node "${path.join(scriptsDir, 'validate.js')}"`, false);

  if (validateOnly) {
    console.log('\n🏁 仅校验模式，流程结束');
    return;
  }

  // Step 2: 工具发现（可选）
  if (!skipDiscover) {
    step('Step 2: 工具发现', `node "${path.join(scriptsDir, 'discover-tools.js')}"`);
  } else {
    console.log('⏭️ 跳过工具发现（--skip-discover）');
  }

  // Step 3: 自动导入新工具（如果有）
  const newToolsPath = path.join(rootDir, 'data', 'new-tools.json');
  if (fs.existsSync(newToolsPath)) {
    step('Step 3: 导入新工具', `node "${path.join(scriptsDir, 'add-tool.js')}" import`);
  } else {
    console.log('⏭️ 无待导入的新工具 (data/new-tools.json 不存在)');
  }

  // Step 4: SEO 文章生成（可选）
  if (!skipArticles) {
    step('Step 4: SEO 文章生成', `node "${path.join(scriptsDir, 'generate-articles.js')}"`);
  } else {
    console.log('⏭️ 跳过文章生成（--skip-articles）');
  }

  // Step 5: 站点构建（必须）
  step('Step 5: 站点构建', `node build.js`, false);

  // 完成
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('\n' + '━'.repeat(40));
  console.log('🎉 流水线完成!');
  console.log(`⏱️ 总耗时: ${elapsed}s`);
  console.log(`📂 输出: ${path.join(rootDir, 'dist/')}`);
  console.log('');

  // 统计输出
  const htmlFiles = fs.readdirSync(path.join(rootDir, 'dist')).filter(f => f.endsWith('.html'));
  const blogFiles = fs.existsSync(path.join(rootDir, 'dist', 'blog'))
    ? fs.readdirSync(path.join(rootDir, 'dist', 'blog')).filter(f => f.endsWith('.html'))
    : [];
  const toolFiles = fs.existsSync(path.join(rootDir, 'dist', 'tools'))
    ? fs.readdirSync(path.join(rootDir, 'dist', 'tools')).filter(f => f.endsWith('.html'))
    : [];

  console.log('📊 输出统计:');
  console.log(`   首页 + 分类 + 合规: ${htmlFiles.length} 个`);
  console.log(`   工具详情页: ${toolFiles.length} 个`);
  console.log(`   博客文章: ${blogFiles.length} 个`);
  console.log(`   总计: ${htmlFiles.length + toolFiles.length + blogFiles.length} 个页面`);
  console.log('');
  console.log('💡 下一步: 部署 dist/ 到 Cloudflare Pages / Vercel / Netlify');
}

main();
