# 食堂菜单系统 - Cloudflare Pages 部署脚本
# 使用方法: .\deploy.ps1

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  食堂菜单系统 - 自动部署脚本" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Node.js
Write-Host "检查 Node.js 环境..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js 版本: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ 未检测到 Node.js，请先安装 Node.js" -ForegroundColor Red
    Write-Host "下载地址: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# 检查是否已安装依赖
Write-Host ""
Write-Host "检查项目依赖..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "首次运行，正在安装依赖..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ 依赖安装失败" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ 依赖安装成功" -ForegroundColor Green
} else {
    Write-Host "✓ 依赖已安装" -ForegroundColor Green
}

# 检查是否已登录
Write-Host ""
Write-Host "检查 Cloudflare 登录状态..." -ForegroundColor Yellow
$loginCheck = npx wrangler whoami 2>&1
if ($loginCheck -match "not authenticated" -or $loginCheck -match "error") {
    Write-Host "需要登录 Cloudflare..." -ForegroundColor Yellow
    Write-Host "即将打开浏览器，请授权登录" -ForegroundColor Cyan
    npx wrangler login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ 登录失败" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✓ 已登录 Cloudflare" -ForegroundColor Green
}

# 检查数据库配置
Write-Host ""
Write-Host "检查数据库配置..." -ForegroundColor Yellow
$wranglerContent = Get-Content "wrangler.toml" -Raw
if ($wranglerContent -match "your-database-id-here") {
    Write-Host ""
    Write-Host "⚠️  检测到数据库未配置" -ForegroundColor Yellow
    Write-Host ""
    $createDB = Read-Host "是否创建新的 D1 数据库？(Y/N)"
    
    if ($createDB -eq "Y" -or $createDB -eq "y") {
        Write-Host "正在创建数据库..." -ForegroundColor Yellow
        $dbOutput = npx wrangler d1 create canteen_menu_db 2>&1 | Out-String
        Write-Host $dbOutput
        
        # 提取 database_id
        if ($dbOutput -match 'database_id = "([^"]+)"') {
            $databaseId = $matches[1]
            Write-Host ""
            Write-Host "✓ 数据库创建成功！" -ForegroundColor Green
            Write-Host "Database ID: $databaseId" -ForegroundColor Cyan
            
            # 更新 wrangler.toml
            Write-Host "正在更新配置文件..." -ForegroundColor Yellow
            $wranglerContent = $wranglerContent -replace 'database_id = "your-database-id-here"', "database_id = `"$databaseId`""
            Set-Content "wrangler.toml" $wranglerContent
            Write-Host "✓ 配置文件已更新" -ForegroundColor Green
            
            # 初始化数据库
            Write-Host ""
            Write-Host "正在初始化数据库..." -ForegroundColor Yellow
            npx wrangler d1 execute canteen_menu_db --file=database/schema.sql
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ 数据库初始化成功" -ForegroundColor Green
            } else {
                Write-Host "✗ 数据库初始化失败" -ForegroundColor Red
                exit 1
            }
        } else {
            Write-Host "✗ 无法提取数据库ID，请手动配置" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "请手动配置 wrangler.toml 中的 database_id 后重新运行" -ForegroundColor Yellow
        exit 0
    }
} else {
    Write-Host "✓ 数据库已配置" -ForegroundColor Green
}

# 部署确认
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "准备部署到 Cloudflare Pages" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
$confirm = Read-Host "确认部署？(Y/N)"

if ($confirm -ne "Y" -and $confirm -ne "y") {
    Write-Host "部署已取消" -ForegroundColor Yellow
    exit 0
}

# 执行部署
Write-Host ""
Write-Host "正在部署..." -ForegroundColor Yellow
Write-Host ""

npm run deploy

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "======================================" -ForegroundColor Green
    Write-Host "  ✓ 部署成功！" -ForegroundColor Green
    Write-Host "======================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "后续步骤：" -ForegroundColor Cyan
    Write-Host "1. 访问 Cloudflare Dashboard: https://dash.cloudflare.com" -ForegroundColor White
    Write-Host "2. 进入 Workers & Pages → 找到你的项目" -ForegroundColor White
    Write-Host "3. Settings → Functions → D1 database bindings" -ForegroundColor White
    Write-Host "4. 添加绑定: Variable name = DB, Database = canteen_menu_db" -ForegroundColor White
    Write-Host "5. 保存后重新部署一次: npm run deploy" -ForegroundColor White
    Write-Host ""
    Write-Host "默认管理员账号：" -ForegroundColor Cyan
    Write-Host "  用户名: admin" -ForegroundColor White
    Write-Host "  密码: admin123" -ForegroundColor White
    Write-Host "  ⚠️  部署后请立即修改密码！" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "✗ 部署失败" -ForegroundColor Red
    Write-Host "请查看上方错误信息" -ForegroundColor Yellow
    exit 1
}
