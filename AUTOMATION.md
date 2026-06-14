# AI Tools Hub 自动化部署文档

## 📋 概述

AI Tools Hub 网站配置了双重自动化部署方案：
1. **WorkBuddy 自动化任务**（本地）
2. **GitHub Actions**（云端备份）

## 🤖 方案 1: WorkBuddy 自动化任务

### 任务配置
- **任务名称**: AI Tools Hub 每日自动更新部署
- **任务 ID**: automation-1780960725773
- **运行频率**: 每天 12:00（北京时间）
- **状态**: ✅ ACTIVE

### 执行步骤
1. 发现新 AI 工具（discover-tools-v2.js）
2. 导入新工具（import-tools.js）
3. 生成 SEO 文章（generate-articles.js）
4. 生成博客索引（generate-blog-index.js）
5. 构建站点（build.js）
6. 强制文件哈希变化
7. 部署到 Cloudflare Pages
8. 验证部署

### Cloudflare 凭证
- **API Token**: 参见 WorkBuddy 自动化任务配置或 GitHub Secrets
- **Account ID**: 参见 WorkBuddy 自动化任务配置或 GitHub Secrets

### 日志文件
- 位置：`ai-tools-hub/auto-update.log`
- 查看：`cat ai-tools-hub/auto-update.log`

### 手动触发
在 WorkBuddy 中：
1. 打开自动化管理
2. 找到 "AI Tools Hub 每日自动更新部署"
3. 点击 "立即运行"

## ☁️ 方案 2: GitHub Actions

### Workflow 配置
- **文件**: `.github/workflows/auto-update.yml`
- **运行频率**: 每天 UTC 04:00（北京时间 12:00）
- **触发方式**: 定时 + 手动触发

### 所需 Secrets
在 GitHub 仓库 Settings → Secrets and variables → Actions 中添加：

1. **CLOUDFLARE_API_TOKEN**
   - 值：参见 Cloudflare Dashboard → API Tokens

2. **CLOUDFLARE_ACCOUNT_ID**
   - 值：参见 Cloudflare Dashboard → 账户 ID

3. **DEEPSEEK_API_KEY**（可选，用于生成文章）
   - 值：您的 DeepSeek API Key

### 手动触发
1. 访问：https://github.com/Sunnyback-hash/ai-tools-hub/actions
2. 选择 "Daily Auto Update AI Tools"
3. 点击 "Run workflow"

### 查看运行历史
- URL: https://github.com/Sunnyback-hash/ai-tools-hub/actions

## 🔍 验证部署

### 方法 1: 检查网站
```bash
# 检查 sitemap.xml
curl -s https://aitoolshub.cn/sitemap.xml | grep -o '<loc>' | wc -l

# 检查首页
curl -s https://aitoolshub.cn/ | grep -o '<!-- build:' | head -1
```

### 方法 2: 查看构建时间
在浏览器中：
1. 访问 https://aitoolshub.cn/
2. 右键 → "查看页面源代码"
3. 搜索 `<!-- build:`，查看最后一次构建时间

### 方法 3: Cloudflare Dashboard
1. 登录 Cloudflare Dashboard
2. 进入 Pages → aitoolshub → Deployments
3. 查看部署时间和状态

## 🚨 故障排查

### 问题 1: 自动化任务未运行
**可能原因**:
- WorkBuddy 未运行
- 自动化任务被暂停

**解决方案**:
1. 检查 WorkBuddy 是否在运行
2. 在 WorkBuddy 自动化管理中检查任务状态
3. 手动运行一次任务

### 问题 2: 部署失败
**可能原因**:
- Cloudflare API Token 过期
- 网络连接问题

**解决方案**:
1. 检查 Cloudflare API Token 是否有效
2. 查看错误日志
3. 手动运行部署命令

### 问题 3: GitHub Actions 未触发
**可能原因**:
- Secrets 未配置
- Workflow 文件有语法错误

**解决方案**:
1. 检查 GitHub Secrets 是否配置正确
2. 查看 Actions 运行日志
3. 手动触发 workflow

## 📝 维护检查清单

### 每周检查
- [ ] 网站是否正常访问
- [ ] sitemap.xml 中的 URL 数量是否增加
- [ ] 是否有新的博客文章
- [ ] 自动化任务是否正常运行

### 每月检查
- [ ] Cloudflare API Token 是否过期
- [ ] GitHub Secrets 是否有效
- [ ] 查看 auto-update.log 日志
- [ ] 检查 Google AdSense 收益

## 🔗 相关链接

- **网站**: https://aitoolshub.cn
- **GitHub 仓库**: https://github.com/Sunnyback-hash/ai-tools-hub
- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **Google AdSense**: https://www.google.com/adsense

## 📞 技术支持

如遇问题，请：
1. 查看日志文件
2. 检查网络连接
3. 验证 API Token 和 Secrets
4. 手动运行部署流程

---

**最后更新**: 2026-06-15
**维护者**: sunnyback-hash
