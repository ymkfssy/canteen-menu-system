-- 菜单项表
CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    tag TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 主题设置表
CREATE TABLE IF NOT EXISTS theme_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    theme_name TEXT NOT NULL UNIQUE,
    header_gradient TEXT NOT NULL,
    border_color TEXT NOT NULL,
    title_color TEXT NOT NULL,
    price_color TEXT NOT NULL,
    is_active BOOLEAN DEFAULT 0
);

-- 背景图片表
CREATE TABLE IF NOT EXISTS background_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_data TEXT,
    is_active BOOLEAN DEFAULT 0
);

-- 插入默认主题
INSERT OR IGNORE INTO theme_settings (theme_name, header_gradient, border_color, title_color, price_color, is_active) VALUES
('spring', 'linear-gradient(to right, #ff6b6b, #ff8e53)', '#ff9a9e', '#ff6b6b', '#ff6b6b', 1),
('summer', 'linear-gradient(to right, #4facfe, #00f2fe)', '#4facfe', '#4facfe', '#4facfe', 0),
('autumn', 'linear-gradient(to right, #ff9a62, #ffcb74)', '#ff9a62', '#ff9a62', '#ff9a62', 0),
('winter', 'linear-gradient(to right, #a8c0ff, #8da2ff)', '#a8c0ff', '#a8c0ff', '#a8c0ff', 0);

-- 插入默认菜单数据
INSERT OR IGNORE INTO menu_items (category, name, price, tag, sort_order) VALUES
('凉菜', '凉拌黄瓜', 8, '', 1),
('凉菜', '麻辣口水鸡', 15, '招牌', 2),
('热菜', '红烧狮子头', 18, '推荐', 1),
('热菜', '宫保鸡丁', 16, '', 2),
('热菜', '鱼香肉丝', 16, '', 3),
('热菜', '麻婆豆腐', 12, '', 4),
('热菜', '酸辣土豆丝', 10, '推荐', 5),
('热菜', '清炒时蔬', 10, '', 6),
('主食', '米饭', 2, '', 1),
('主食', '馒头', 1, '', 2),
('主食', '葱油饼', 5, '', 3),
('主食', '水饺(10个)', 12, '', 4),
('主食', '牛肉面', 15, '热销', 5),
('主食', '炒饭', 10, '', 6),
('汤品', '西红柿蛋汤', 5, '', 1),
('汤品', '紫菜蛋花汤', 5, '', 2),
('水果', '时令水果拼盘', 8, '', 1);