/**
 * deploy-direct-upload.js
 * 使用 Cloudflare Pages Direct Upload API 部署 dist/ 目录
 * 用法：node scripts/deploy-direct-upload.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || 'ec7d1442130fbef88fec92c5a38d2452';
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const PROJECT_NAME = 'aitoolshub';
const DIST_DIR = path.join(__dirname, '..', 'dist');

function apiRequest(method, urlPath, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.cloudflare.com',
      path: urlPath,
      method: method,
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    };
    if (body) options.headers['Content-Length'] = Buffer.byteLength(body);

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, data: { raw: data } }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  console.log('🚀 开始部署到 Cloudflare Pages...');
  console.log(`   项目: ${PROJECT_NAME}`);
  console.log(`   目录: ${DIST_DIR}`);

  // 1. 创建 deployment（获取 upload URL）
  console.log('\n[1/3] 创建 deployment...');
  const deployRes = await apiRequest(
    'POST',
    `/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}/deployments`,
    JSON.stringify({})
  );

  if (!deployRes.data.success) {
    console.error('❌ 创建 deployment 失败:', JSON.stringify(deployRes.data.errors || deployRes.data));
    process.exit(1);
  }

  const deploymentId = deployRes.data.result.id;
  const uploadUrl = deployRes.data.result.latest_staging?.upload_url ||
                    deployRes.data.result.upload_url;
  console.log(`   Deployment ID: ${deploymentId}`);
  console.log(`   Upload URL 获取成功`);

  // 2. 上传文件（使用 upload_url 或直接批量上传 API）
  // Cloudflare Direct Upload 使用特殊的上传接口
  // 实际上 wrangler 也是调这个接口
  // 我们使用 wrangler 的 node API 来避免直接实现 multipart upload
  console.log('\n[2/3] 使用 wrangler 上传文件...');

  // 检查 wrangler 是否可用
  const { execSync } = require('child_process');
  try {
    // 使用 npx wrangler pages deploy（已安装）
    const result = execSync(
      `npx --yes wrangler pages deploy "${DIST_DIR}" --project-name ${PROJECT_NAME} --branch main`,
      {
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit',
        env: {
          ...process.env,
          CLOUDFLARE_API_TOKEN: API_TOKEN,
          CLOUDFLARE_ACCOUNT_ID: ACCOUNT_ID,
        },
        shell: true,
      }
    );
    console.log('\n[3/3] ✅ 部署成功！');
    console.log(`   访问: https://aitoolshub.cn`);
  } catch (e) {
    console.error('\n❌ 部署失败:', e.message);
    console.log('\n备用方案：请手动在 Cloudflare Dashboard 上传 dist/ 目录');
    process.exit(1);
  }
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
