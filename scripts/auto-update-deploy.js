#!/usr/bin/env node
/**
 * auto-update-deploy.js
 * 全自动：发现新工具 → 验证 → 导入 → 生成文章 → 构建 → 部署
 * 用法：node scripts/auto-update-deploy.js
 * 需要：.env 文件（包含 CLOUDFLARE_API_TOKEN 和 CLOUDFLARE_ACCOUNT_ID）
 */

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 从 .env 文件读取环境变量
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    lines.forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          process.env[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
    console.log('✅ 已从 .env 文件加载环境变量');
  }
}

loadEnv();

const DIST_DIR = path.join(__dirname, '..', 'dist');
const LOG_FILE = path.join(__dirname, '..', 'auto-update.log');

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

function run(cmd, args = [], opts = {}) {
  log(`▶ 执行: ${cmd} ${args.join(' ')}`);
  const result = spawnSync(cmd, args, {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    shell: true,
    ...opts,
  });
  if (result.status !== 0 && !opts.allowFail) {
    throw new Error(`命令失败: ${cmd} ${args.join(' ')} (exit code: ${result.status})`);
  }
  return result;
}

function getEnv(name) {
  const val = process.env[name];
  if (!val) {
    console.error(`❌ 缺少环境变量: ${name}`);
    console.error(`请设置: export ${name}=your_${name.toLowerCase()}`);
    process.exit(1);
  }
  return val;
}

async function main() {
  log('===== 开始自动更新 + 部署 =====');

  // 1. 验证数据
  log('[1/6] 验证数据...');
  run('node', ['scripts/validate.js']);

  // 2. 发现新工具
  log('[2/6] 发现新工具...');
  run('node', ['scripts/discover-tools.js'], { allowFail: true });

  // 3. 导入新工具
  log('[3/6] 导入新工具...');
  run('node', ['scripts/add-tool.js', 'import'], { allowFail: true });

  // 4. 生成/更新文章
  log('[4/6] 生成 SEO 文章...');
  run('node', ['scripts/generate-articles.js', '--count', '5']);

  // 5. 构建站点
  log('[5/6] 构建站点...');
  run('node', ['build.js']);

  // 6. 生成博客索引
  log('[6/6] 生成博客索引...');
  run('node', ['scripts/generate-blog-index.js']);

  // 7. 部署到 Cloudflare Pages
  log('[7/7] 部署到 Cloudflare Pages...');
  const apiToken = getEnv('CLOUDFLARE_API_TOKEN');
  const accountId = getEnv('CLOUDFLARE_ACCOUNT_ID');

  // 设置环境变量供 wrangler 使用
  process.env.CLOUDFLARE_API_TOKEN = apiToken;
  process.env.CLOUDFLARE_ACCOUNT_ID = accountId;

  // 使用 wrangler pages deploy
  const projectName = 'aitoolshub';
  log(`部署到项目: ${projectName}`);

  try {
    // Wrangler 不支持 --token 参数，需要通过环境变量传入
    log(`使用 Wrangler 部署到项目: ${projectName}`);
    run('npx', ['--yes', 'wrangler', 'pages', 'deploy', 'dist', '--project-name', projectName, '--branch', 'main']);
    log('✅ 部署成功！');
  } catch (e) {
    log(`❌ Wrangler 部署失败: ${e.message}`);
    log('尝试使用 API 直接上传...');
    try {
      run('node', ['scripts/deploy-direct-upload.js']);
      log('✅ API 上传成功！');
    } catch (e2) {
      log(`❌ API 上传也失败: ${e2.message}`);
      throw e2;
    }
  }

  log('===== 自动更新 + 部署 完成 =====');
}

// 备用部署方案：使用 Cloudflare Pages API 直接上传
async function deployViaApi(apiToken, accountId, projectName) {
  const { execSync } = require('child_process');
  const archiver = require('archiver');

  // 创建 zip 包
  const zipPath = path.join(__dirname, '..', 'dist.zip');
  log(`创建部署包: ${zipPath}`);

  // 使用 wrangler 的 API 方式
  // Cloudflare Pages Direct Upload API
  const deployUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}/deployments`;

  log(`API URL: ${deployUrl}`);
  log('请手动通过 Cloudflare Dashboard 上传 dist/ 目录');
  log('或使用: npx wrangler pages deploy dist --project-name aitools');

  // 最简单可靠的方式：指导用户设置环境变量后运行
  console.log('\n📋 请先设置环境变量，然后重新运行：');
  console.log('  set CLOUDFLARE_API_TOKEN=your_token');
  console.log('  set CLOUDFLARE_ACCOUNT_ID=your_account_id');
  console.log('  node scripts/auto-update-deploy.js\n');
}

main().catch(e => {
  log(`❌ 失败: ${e.message}`);
  console.error(e);
  process.exit(1);
});
