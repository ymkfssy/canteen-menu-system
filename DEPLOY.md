# 🚀 Cloudflare Pages 部署指南

本指南提供两种部署方式：
- **方式一**：GitHub 自动部署（推荐）- 代码更新自动同步
- **方式二**：Wrangler CLI 直接部署 - 无需 Git

---

## 🎯 方式一：GitHub 自动部署（推荐）

### 优势
- ✅ 代码更新后自动部署
- ✅ 完整的版本历史和回滚能力
- ✅ 适合团队协作
- ✅ 一次配置，永久自动化

### 前置条件

1. GitHub 账号（免费）
2. Git 已安装（[下载](https://git-scm.com/)）
3. Cloudflare 账号（免费）

### 部署步骤

#### 步骤 1: 创建 GitHub 仓库

1. 访问 [GitHub](https://github.com)，登录账号
2. 点击右上角 `+` → `New repository`
3. 填写仓库信息：
   - Repository name: `canteen-menu-system`
   - Description: 食堂菜单展示系统
   - 选择 `Public` 或 `Private`
4. 不要勾选 "Initialize with README"（因为本地已有代码）
5. 点击 `Create repository`

#### 步骤 2: 推送代码到 GitHub

在项目目录打开终端，执行：

```bash
# 初始化 Git 仓库（如果还没有）
git init

# 添加所有文件
git add .

# 提交代码
git commit -m "Initial commit: 食堂菜单系统"

# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/canteen-menu-system.git

# 推送代码
git branch -M main
git push -u origin main
```

#### 步骤 3: 创建 D1 数据库

```bash
# 安装依赖
npm install

# 登录 Cloudflare
npx wrangler login

# 创建数据库
npx wrangler d1 create canteen_menu_db
```

**复制返回的 `database_id`** 备用。

#### 步骤 4: 连接 Cloudflare Pages

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Workers & Pages**
3. 点击 **Create application**
4. 选择 **Pages** 标签页
5. 点击 **Connect to Git**
6. 授权 Cloudflare 访问 GitHub
7. 选择你的仓库 `canteen-menu-system`
8. 配置构建设置：
   - **Project name**: `canteen-menu`（或其他名称）
   - **Production branch**: `main`
   - **Build command**: 留空
   - **Build output directory**: `public`
9. 点击 **Save and Deploy**

#### 步骤 5: 配置 D1 数据库绑定

部署完成后：

1. 在项目页面，进入 **Settings** → **Functions**
2. 找到 **D1 database bindings**
3. 点击 **Add binding**
   - **Variable name**: `DB`
   - **D1 database**: 选择 `canteen_menu_db`
4. 点击 **Save**

#### 步骤 6: 初始化数据库

```bash
# 初始化数据库表结构
npx wrangler d1 execute canteen_menu_db --file=database/schema.sql
```

#### 步骤 7: 触发重新部署

保存绑定后，Cloudflare 会自动重新部署。或者你可以：

```bash
# 修改任意文件触发部署
git commit --allow-empty -m "Trigger redeploy"
git push
```

### ✅ 完成！

访问显示的网址，例如：`https://canteen-menu.pages.dev`

---

## 🎯 方式二：Wrangler CLI 直接部署

## 📋 前置准备

### 1. 安装 Node.js
- 访问 [https://nodejs.org/](https://nodejs.org/)
- 下载并安装 LTS 版本（建议 v18 或更高）
- 验证安装：
  ```bash
  node --version
  npm --version
  ```

### 2. 注册 Cloudflare 账号
- 访问 [https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)
- 使用邮箱注册（免费账号即可）

## 🔧 部署步骤

### 步骤 1: 安装 Wrangler CLI

在项目目录下打开终端（PowerShell 或 CMD），执行：

```bash
npm install
```

这会安装项目所需的依赖，包括 Wrangler。

### 步骤 2: 登录 Cloudflare

```bash
npx wrangler login
```

- 会自动打开浏览器登录页面
- 登录你的 Cloudflare 账号
- 授权 Wrangler 访问权限
- 看到 "Successfully logged in" 表示成功

### 步骤 3: 创建 D1 数据库

```bash
npx wrangler d1 create canteen_menu_db
```

**重要：** 复制返回的 `database_id`，类似这样：

```
✅ Successfully created DB 'canteen_menu_db'!

[[d1_databases]]
binding = "DB"
database_name = "canteen_menu_db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # 复制这个ID
```

### 步骤 4: 更新配置文件

编辑 `wrangler.toml` 文件，将 `database_id` 替换为上一步获得的 ID：

```toml
[[d1_databases]]
binding = "DB"
database_name = "canteen_menu_db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # 替换这里
```

### 步骤 5: 初始化数据库

```bash
npx wrangler d1 execute canteen_menu_db --file=database/schema.sql
```

看到 "Executed X commands in Xms" 表示成功。

### 步骤 6: 部署到 Cloudflare Pages

```bash
npm run deploy
```

或者直接使用：

```bash
npx wrangler pages deploy public --project-name=canteen-menu
```

**首次部署会提示：**
- 输入项目名称（建议使用 `canteen-menu`）
- 选择生产环境（选择 `production`）

### 步骤 7: 绑定 D1 数据库到 Pages

部署成功后，需要在 Cloudflare Dashboard 中绑定数据库：

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages**
3. 找到你的项目（canteen-menu）
4. 点击 **Settings** → **Functions** → **D1 database bindings**
5. 点击 **Add binding**：
   - Variable name: `DB`
   - D1 database: 选择 `canteen_menu_db`
6. 点击 **Save**

### 步骤 8: 重新部署（使数据库绑定生效）

```bash
npm run deploy
```

## ✅ 验证部署

部署成功后，会显示访问地址，类似：

```
✨ Success! Deployed to https://canteen-menu.pages.dev
```

### 访问页面

- **菜单展示页**: `https://canteen-menu.pages.dev/`
- **后台登录页**: `https://canteen-menu.pages.dev/admin/login.html`
- **后台管理页**: `https://canteen-menu.pages.dev/admin/index.html`

### 默认登录信息

- 用户名: `admin`
- 密码: `admin123`

**⚠️ 重要：部署后立即修改密码！**

## 🔄 后续更新

每次修改代码后，只需运行：

```bash
npm run deploy
```

## 🛠️ 常用命令

```bash
# 本地开发调试
npm run dev

# 部署到生产环境
npm run deploy

# 查询数据库（查看用户）
npx wrangler d1 execute canteen_menu_db --command="SELECT * FROM users"

# 修改管理员密码
npx wrangler d1 execute canteen_menu_db --command="UPDATE users SET password='新密码' WHERE username='admin'"

# 查看当前菜单
npx wrangler d1 execute canteen_menu_db --command="SELECT * FROM current_menu"
```

## 🐛 常见问题

### 1. 登录失败 "wrangler: command not found"

**解决方法：**
```bash
# 使用 npx 运行
npx wrangler login

# 或全局安装
npm install -g wrangler
```

### 2. 部署后显示 500 错误

**原因：** 数据库绑定未配置

**解决方法：** 
- 确认已在 Dashboard 中绑定 D1 数据库（步骤7）
- 重新部署一次

### 3. 后台登录失败

**可能原因：**
- 数据库未初始化
- 数据库绑定错误

**解决方法：**
```bash
# 重新初始化数据库
npx wrangler d1 execute canteen_menu_db --file=database/schema.sql

# 验证用户是否存在
npx wrangler d1 execute canteen_menu_db --command="SELECT * FROM users"
```

### 4. 本地开发无法访问

**解决方法：**
```bash
# 确保使用正确的命令
npm run dev

# 或直接使用
npx wrangler pages dev public --d1 DB=canteen_menu_db
```

然后访问 `http://localhost:8788`

### 5. 菜单不显示

**检查步骤：**
1. 确认数据库已绑定
2. 登录后台添加菜单
3. 检查浏览器控制台是否有错误

## 📱 自定义域名（可选）

如果你有自己的域名：

1. 在 Cloudflare Dashboard 中进入你的 Pages 项目
2. 点击 **Custom domains**
3. 点击 **Set up a custom domain**
4. 输入域名并按提示配置 DNS

## 🔒 安全建议

部署后必做：

1. **修改管理员密码**
   ```bash
   npx wrangler d1 execute canteen_menu_db --command="UPDATE users SET password='强密码' WHERE username='admin'"
   ```

2. **定期备份数据库**
   ```bash
   npx wrangler d1 export canteen_menu_db --output=backup.sql
   ```

3. **限制后台访问**（可选）
   - 在 Cloudflare 中配置访问规则
   - 添加 IP 白名单

## 📞 获取帮助

- Cloudflare 文档: [https://developers.cloudflare.com/pages/](https://developers.cloudflare.com/pages/)
- Wrangler 文档: [https://developers.cloudflare.com/workers/wrangler/](https://developers.cloudflare.com/workers/wrangler/)
- D1 文档: [https://developers.cloudflare.com/d1/](https://developers.cloudflare.com/d1/)

---

**恭喜！🎉 你的食堂菜单系统已成功部署到 Cloudflare Pages！**
