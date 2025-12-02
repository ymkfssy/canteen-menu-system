-- Cloudflare D1 数据库schema

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 插入默认管理员用户 (用户名: admin, 密码: admin123)
-- 生产环境请修改密码！
INSERT OR IGNORE INTO users (username, password) VALUES ('admin', 'admin123');

-- 自定义分类表
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    key TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 当前展示菜单表
CREATE TABLE IF NOT EXISTS current_menu (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    menu_data TEXT NOT NULL,
    theme TEXT DEFAULT 'prosperity',
    background_image TEXT DEFAULT '',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 预存菜单表
CREATE TABLE IF NOT EXISTS menu_presets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    menu_data TEXT NOT NULL,
    theme TEXT DEFAULT 'prosperity',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 初始化默认菜单
INSERT OR IGNORE INTO current_menu (id, menu_data, theme) VALUES (
    1,
    '{"coldDishes":[{"name":"拍黄瓜","price":5},{"name":"凉拌木耳","price":6}],"hotDishes":[{"name":"红烧肉","price":18},{"name":"糖醋鱼","price":22},{"name":"宫保鸡丁","price":16},{"name":"蒜蓉西兰花","price":10},{"name":"鱼香茄子","price":12},{"name":"土豆炖牛肉","price":20}],"stapleFood":[{"name":"米饭","price":2},{"name":"面条","price":8},{"name":"饺子","price":12},{"name":"馒头","price":1.5},{"name":"煎饼","price":6},{"name":"炒饭","price":10}],"soup":[{"name":"紫菜蛋花汤","price":3},{"name":"番茄汤","price":3}],"fruit":[{"name":"苹果","price":5},{"name":"香蕉","price":4}]}',
    'prosperity'
);
