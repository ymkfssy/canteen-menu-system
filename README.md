# 🍽️ 食堂菜单展示系统

现代化食堂菜单展示系统，支持多主题切换和后台管理。

## 🚀 部署指南

### 1. Fork 本仓库
```bash
git clone https://github.com/your-username/canteen-menu-system.git
cd canteen-menu-system
```

### 2. 安装依赖
```bash
npm install
```

### 3. 登录 Cloudflare
```bash
npx wrangler login
```

### 4. 创建数据库
```bash
npx wrangler d1 create canteen_menu_db
```

### 5. 初始化数据库
```bash
npx wrangler d1 execute canteen_menu_db --file=database/schema.sql
```

### 6. 部署到 Cloudflare Pages
```bash
npm run deploy
```

### 7. 绑定数据库
在 Cloudflare Dashboard 中：
- 进入项目设置 → Functions → D1 database bindings
- 添加变量名：`DB`，选择刚创建的数据库

## 📁 项目结构

```
canteen-menu-system/
├── public/                    # 前端静态资源
│   ├── index.html             # 菜单展示页面
│   ├── css/
│   │   └── style.css         # 展示页面样式
│   ├── js/
│   │   ├── themes.js         # 主题配置
│   │   └── display.js        # 展示页面逻辑
│   └── admin/               # 后台管理系统
│       ├── index.html         # 后台主页面
│       ├── login.html         # 登录页面
│       ├── css/
│       │   └── admin.css     # 后台样式
│       └── js/
│           └── admin.js       # 后台逻辑
├── functions/                # Cloudflare Pages Functions
│   └── api/
│       └── [[path]].js      # API接口
├── database/                # 数据库文件
│   └── schema.sql           # 数据库结构
├── package.json             # 项目依赖配置
├── wrangler.toml           # Cloudflare配置
├── deploy.ps1              # PowerShell部署脚本
└── README.md               # 项目说明
```

## 🎨 功能特性

- 📺 超宽屏菜单展示
- 🎨 5种主题（春夏秋冬+开门红）
- 🔐 后台管理系统
- 📊 Excel导入导出
- 🖼️ 自定义背景图片
- 💾 预存菜单管理

## 🔑 访问地址

- **菜单展示**：`https://your-domain.pages.dev`
- **后台管理**：`https://your-domain.pages.dev/admin/login.html`

默认账号：`admin` / `admin123`

## 🔧 配置说明

修改管理员密码：
```bash
npx wrangler d1 execute canteen_menu_db --command="UPDATE users SET password='新密码' WHERE username='admin'"
```