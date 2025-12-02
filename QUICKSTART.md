# ⚡ 5分钟快速部署

## Windows 用户（最简单）

### 一键部署
```powershell
.\deploy.ps1
```

按提示操作即可，脚本会自动完成所有配置。

---

## 手动部署（所有平台）

### 1️⃣ 安装依赖
```bash
npm install
```

### 2️⃣ 登录 Cloudflare
```bash
npx wrangler login
```
- 会打开浏览器
- 登录你的 Cloudflare 账号
- 点击授权

### 3️⃣ 创建数据库
```bash
npx wrangler d1 create canteen_menu_db
```
**重要：** 复制返回的 `database_id`

### 4️⃣ 更新配置
编辑 `wrangler.toml`，找到这行：
```toml
database_id = "your-database-id-here"
```
替换为你的实际 ID。

### 5️⃣ 初始化数据库
```bash
npx wrangler d1 execute canteen_menu_db --file=database/schema.sql
```

### 6️⃣ 部署
```bash
npm run deploy
```
首次部署会询问项目名称，建议输入 `canteen-menu`

### 7️⃣ 绑定数据库（关键步骤！）

访问 https://dash.cloudflare.com

1. 进入 **Workers & Pages**
2. 找到你的项目（canteen-menu）
3. 点击 **Settings** → **Functions**
4. 找到 **D1 database bindings**
5. 点击 **Add binding**
   - Variable name: `DB`
   - D1 database: 选择 `canteen_menu_db`
6. 点击 **Save**

### 8️⃣ 重新部署
```bash
npm run deploy
```

---

## ✅ 完成！

访问你的网站：
- **菜单页**: `https://你的项目名.pages.dev/`
- **后台**: `https://你的项目名.pages.dev/admin/login.html`

默认账号：
- 用户名: `admin`
- 密码: `admin123`

**⚠️ 立即修改密码：**
```bash
npx wrangler d1 execute canteen_menu_db --command="UPDATE users SET password='你的新密码' WHERE username='admin'"
```

---

## 🔄 更新代码

修改代码后，只需：
```bash
npm run deploy
```

---

## ❓ 遇到问题？

查看完整文档：[DEPLOY.md](./DEPLOY.md)

常见问题：
- **500 错误**: 检查是否完成了步骤 7（绑定数据库）
- **登录失败**: 确保数据库已初始化（步骤 5）
- **命令找不到**: 使用 `npx wrangler` 而不是 `wrangler`
