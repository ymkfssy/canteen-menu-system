-- 创建菜单表
CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建主题表
CREATE TABLE IF NOT EXISTS themes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT FALSE,
    config TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建管理员表
CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 插入默认主题
INSERT OR IGNORE INTO themes (name, is_active, config) VALUES 
('spring', 1, '{"primary": "#a8e6cf", "secondary": "#dcedc1", "text": "#2d5016"}'),
('summer', 0, '{"primary": "#4fc3f7", "secondary": "#29b6f6", "text": "#01579b"}'),
('autumn', 0, '{"primary": "#ffb74d", "secondary": "#ff9800", "text": "#5d4037"}'),
('winter', 0, '{"primary": "#bbdefb", "secondary": "#90caf9", "text": "#0d47a1"}');

-- 插入默认管理员 (密码: admin)
INSERT OR IGNORE INTO admin (username, password_hash) VALUES 
('admin', '$2a$10$rOzZJ4c8n6Y2Y2Q2Y2Q2YuY2Q2Y2Q2Y2Q2Y2Q2Y2Q2Y2Q2Y2Q2Y2');

-- 插入默认菜单项
INSERT OR IGNORE INTO menu_items (category, name, price, sort_order) VALUES 
('coldDishes', '凉拌黄瓜', 8.00, 1),
('coldDishes', '拍黄瓜', 8.00, 2),
('hotDishes', '红烧肉', 28.00, 1),
('hotDishes', '宫保鸡丁', 22.00, 2),
('hotDishes', '麻婆豆腐', 18.00, 3),
('hotDishes', '清蒸鲈鱼', 35.00, 4),
('hotDishes', '西红柿炒蛋', 15.00, 5),
('hotDishes', '地三鲜', 16.00, 6),
('staples', '米饭', 2.00, 1),
('staples', '馒头', 1.00, 2),
('staples', '面条', 10.00, 3),
('staples', '水饺', 15.00, 4),
('staples', '包子', 2.50, 5),
('staples', '煎饼', 5.00, 6),
('soups', '西红柿蛋汤', 6.00, 1),
('soups', '紫菜汤', 5.00, 2),
('fruits', '苹果', 5.00, 1),
('fruits', '香蕉', 4.00, 2);