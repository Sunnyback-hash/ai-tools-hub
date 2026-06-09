# Cloudflare 自动部署配置指南

## 第一步：获取 Cloudflare Account ID

1. 登录 https://dash.cloudflare.com
2. 在右侧栏找到 **Account ID**（在主页右侧，或点左下角账号名 → 右侧显示）
3. 复制这串 ID，类似：`a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p`

## 第二步：创建 API Token

1. 打开：https://dash.cloudflare.com/profile/api-tokens
2. 点 **Create Token**
3. 选择模板：**Edit Cloudflare Workers** （或 **Cloudflare Pages**）
4. Account Resources → 选择你的账号
5. Zone Resources → 选择 `aitoolshub.cn` 域名（或 All Zones）
6. TTL → 选 **No expiration**（永不过期）
7. 点 **Continue to summary** → **Create Token**
8. **立即复制保存** Token（只显示一次！）

Token 格式类似：`xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## 第三步：配置到项目

在项目根目录创建 `.env` 文件（不要提交到 Git）：

```
CLOUDFLARE_API_TOKEN=你的Token
CLOUDFLARE_ACCOUNT_ID=你的Account_ID
```

## 第四步：测试部署

```bash
# 进入项目目录
cd C:\Users\25441\WorkBuddy\2026-05-29-20-49-58\ai-tools-hub

# 设置环境变量（Windows CMD）
set CLOUDFLARE_API_TOKEN=你的Token
set CLOUDFLARE_ACCOUNT_ID=你的Account_ID

# 测试部署
npm run deploy
```

## 第五步：设置定时自动运行（可选）

### Windows 任务计划程序
1. Win + R → 输入 `taskschd.msc`
2. 右侧 **创建基本任务**
3. 触发器：每周一次（建议周日 凌晨 3:00）
4. 操作：启动程序
   - 程序：`C:\Users\25441\.workbuddy\binaries\node\versions\22.12.0\node.exe`
   - 参数：`C:\Users\25441\WorkBuddy\2026-05-29-20-49-58\ai-tools-hub\scripts\auto-update-deploy.js`
   - 起始位置：`C:\Users\25441\WorkBuddy\2026-05-29-20-49-58\ai-tools-hub`

### 或用 .bat 脚本 + 任务计划
创建 `deploy-daily.bat`：
```bat
@echo off
set CLOUDFLARE_API_TOKEN=你的Token
set CLOUDFLARE_ACCOUNT_ID=你的Account_ID
cd /d C:\Users\25441\WorkBuddy\2026-05-29-20-49-58\ai-tools-hub
call npm run auto
```

## 一键部署命令

配置好后，每次只需运行：
```bash
npm run auto    # 全自动：更新内容 + 构建 + 部署
npm run deploy  # 仅部署（dist/ 已存在时）
```

## 故障排查

### `wrangler` 找不到
```bash
npm install wrangler --save-dev
```

### 部署失败：project not found
确认 Cloudflare Pages 项目名是 `aitools`（在 Cloudflare Dashboard → Pages 查看）

### API Token 权限不足
重新创建 Token，确保勾选：
- Account - Cloudflare Pages: Edit
- Zone - Zone: Read
