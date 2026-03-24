# 旅行记账本 - Travel Ledger

一个四人旅行共享记账工具，支持多币种和部分人 AA 分摊。

## 功能特点

- ✅ 创建/加入房间，6 位代码分享
- ✅ 实时同步，四人同时记账
- ✅ 多币种支持：人民币 (CNY)、美元 (USD)、韩元 (KRW)
- ✅ 分币种计算，单独显示每种币种的 AA 账单
- ✅ 部分人 AA，可选择参与者
- ✅ 手机友好界面

## 快速开始

### 1. 配置 Supabase

1. 访问 [supabase.com](https://supabase.com) 创建免费账户
2. 创建新项目
3. 进入 **SQL Editor**，运行 `supabase/schema.sql` 中的 SQL 创建表
4. 进入 **Project Settings** → **API**，复制以下两个值：
   - Project URL
   - anon/public key

### 2. 配置环境变量

编辑 `.env` 文件：

```env
VITE_SUPABASE_URL=你的项目 URL
VITE_SUPABASE_ANON_KEY=你的 anon key
```

### 3. 安装依赖

```bash
npm install
```

### 4. 运行开发服务器

```bash
npm run dev
```

### 5. 部署到 Vercel

```bash
# 安装 Vercel CLI
npm install -g vercel

# 部署
vercel
```

或者：
1. 将代码推送到 GitHub
2. 访问 [vercel.com](https://vercel.com)
3. 导入项目，自动部署

## 使用说明

1. **创建账本**：输入账本名称（如"大理旅行"）和你的名字，可选设置 PIN 码
2. **分享链接**：创建后生成 6 位房间代码（如 `A7K9M2`），分享给朋友
3. **加入账本**：朋友输入房间代码和自己的名字即可加入
4. **记账**：点击"记一笔"，输入金额、用途，选择币种和参与分摊的人
5. **查看账单**：点击"查看 AA 账单"，查看每种币种的转账方案

## 技术栈

- React + Vite + TypeScript
- TailwindCSS
- Zustand (状态管理)
- Supabase (后端 + 数据库 + 实时同步)
- Vercel (部署)

## 许可证

MIT
