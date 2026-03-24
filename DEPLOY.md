# 部署指南

## 第一步：创建 Supabase 项目

1. 访问 [supabase.com](https://supabase.com)
2. 点击 "Start your project" 或 "New Project"
3. 使用 GitHub 账号登录（如果没有需要先注册 GitHub）
4. 填写项目信息：
   - Name: travel-ledger（任意名称）
   - Database Password: 设置一个强密码（请保存好）
   - Region: 选择离你最近的地区
5. 点击 "Create new project"（免费项目，不需要绑定信用卡）

## 第二步：创建数据库表

1. 项目创建完成后，进入项目控制台
2. 点击左侧菜单 **SQL Editor**
3. 点击 **New Query**
4. 复制 `supabase/schema.sql` 文件的全部内容
5. 粘贴到 SQL Editor 中
6. 点击 **Run** 执行
7. 看到 "Success" 提示表示表创建成功

## 第三步：获取 API 密钥

1. 点击左侧菜单 **Project Settings**（齿轮图标）
2. 点击 **API**
3. 复制以下两个值：
   - **Project URL** (格式：https://xxxxx.supabase.co)
   - **anon/public key** (很长的字符串)

## 第四步：配置环境变量

1. 在项目根目录找到 `.env` 文件
2. 替换以下内容：

```env
VITE_SUPABASE_URL=https://你的项目ID.supabase.co
VITE_SUPABASE_ANON_KEY=你的 anon key
```

## 第五步：部署到 Netlify

### 方法 A：使用 GitHub（推荐）

1. **初始化 Git 并推送**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   # 在 GitHub 创建新仓库，然后：
   git remote add origin https://github.com/你的用户名/仓库名.git
   git push -u origin main
   ```

2. **部署到 Netlify**
   - 访问 [netlify.com](https://netlify.com)
   - 使用 GitHub 账号登录
   - 点击 "Add new site" → "Import an existing project"
   - 选择你刚推送的仓库
   - 在 "Build settings" 中确认：
     - Build command: `npm run build`
     - Publish directory: `dist`
   - 点击 "Deploy site"
   - 等待部署完成（约 1-2 分钟）

3. **配置环境变量**
   - 部署完成后，进入 "Site settings" → "Environment variables"
   - 添加：
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   - 点击 "Deploy" → "Trigger deploy" 重新部署

4. **获取访问链接**
   - 部署完成后，你会得到一个链接：`https://your-project.netlify.app`
   - 分享这个链接给你的朋友即可使用

### 方法 B：使用 Netlify CLI

1. **安装 Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **登录 Netlify**
   ```bash
   netlify login
   ```

3. **部署**
   ```bash
   netlify deploy --prod
   ```

4. **配置环境变量**
   - 在项目根目录创建 `netlify.toml` 文件
   - 在 `[build.environment]` 中添加环境变量

## 第六步：分享使用

部署完成后，你会得到一个网址链接，例如：
```
https://travel-ledger.netlify.app
```

### 使用流程：

1. **创建账本**
   - 打开链接
   - 输入账本名称（如"韩国旅行"）
   - 输入你的名字
   - 可选：设置 PIN 码保护
   - 点击"创建账本"
   - 记下 6 位房间代码（如 `A7K9M2`）

2. **分享给朋友**
   - 将链接和房间代码发给其他三人
   - 如果设置了 PIN 码，也一并告知

3. **朋友加入**
   - 朋友打开链接
   - 点击"加入账本"
   - 输入房间代码
   - 输入自己的名字
   - 输入 PIN 码（如有）
   - 点击"加入账本"

4. **开始记账**
   - 点击"记一笔"
   - 选择币种（CNY/USD/KRW）
   - 输入金额和用途
   - 选择参与分摊的人（默认全选）
   - 点击"保存"

5. **查看 AA 账单**
   - 点击底部"查看 AA 账单"
   - 查看每种币种的转账方案

## 常见问题

**Q: Supabase 免费额度够吗？**
A: 完全够用。免费套餐包括 500MB 数据库、2GB 带宽，对四人旅行记账绰绰有余。

**Q: 数据会保存多久？**
A: 只要你的 Supabase 项目不删除，数据会一直保存。旅行结束后可以导出备份。

**Q: 可以多人同时记账吗？**
A: 可以！Supabase Realtime 支持实时同步，四人同时记账没问题。

**Q: 如果不小心删错了怎么办？**
A: 目前删除后无法恢复，建议谨慎操作。后续可以添加回收站功能。
