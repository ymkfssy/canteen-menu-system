const API_BASE = '/api';
let currentTheme = 'winter';

// 应用主题样式
function applyTheme(themeName) {
    const theme = THEMES[themeName];
    if (!theme) return;

    const styles = `
        body {
            background: ${theme.colors.primary};
        }
        .header {
            background: ${theme.colors.header};
        }
        .cold-dishes .section-header {
            border-bottom-color: ${theme.colors.coldDishes.header};
        }
        .cold-dishes .dish-item {
            background: ${theme.colors.coldDishes.item};
        }
        .hot-dishes .section-header {
            border-bottom-color: ${theme.colors.hotDishes.header};
        }
        .hot-dishes .dish-item {
            background: ${theme.colors.hotDishes.item};
        }
        .staple-food .section-header {
            border-bottom-color: ${theme.colors.stapleFood.header};
        }
        .staple-food .dish-item {
            background: ${theme.colors.stapleFood.item};
        }
        .soup .section-header {
            border-bottom-color: ${theme.colors.soup.header};
        }
        .soup .dish-item {
            background: ${theme.colors.soup.item};
        }
        .fruit .section-header {
            border-bottom-color: ${theme.colors.fruit.header};
        }
        .fruit .dish-item {
            background: ${theme.colors.fruit.item};
        }
    `;

    document.getElementById('dynamic-styles').textContent = styles;
}

// 更新日期时间
function updateDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const weekday = weekdays[now.getDay()];
    
    document.getElementById('datetime').textContent = 
        `${year}-${month}-${day} ${weekday} ${hours}:${minutes}:${seconds}`;
}

// 渲染菜单
function renderMenu(menuData) {
    const container = document.getElementById('menuContainer');
    container.innerHTML = '';

    const sections = [
        { key: 'coldDishes', title: '凉菜', class: 'cold-dishes' },
        { key: 'hotDishes', title: '热菜', class: 'hot-dishes' },
        { key: 'stapleFood', title: '主食', class: 'staple-food' },
        { key: 'soup', title: '汤品', class: 'soup' },
        { key: 'fruit', title: '水果', class: 'fruit' }
    ];

    sections.forEach(section => {
        const items = menuData[section.key] || [];
        if (items.length === 0) return;

        const sectionDiv = document.createElement('div');
        sectionDiv.className = `menu-section ${section.class}`;
        
        const header = document.createElement('div');
        header.className = 'section-header';
        header.textContent = section.title;
        sectionDiv.appendChild(header);

        const dishesDiv = document.createElement('div');
        dishesDiv.className = 'dishes';

        items.forEach(item => {
            const dishItem = document.createElement('div');
            dishItem.className = 'dish-item';
            
            const dishName = document.createElement('div');
            dishName.className = 'dish-name';
            dishName.textContent = item.name;
            
            const dishPrice = document.createElement('div');
            dishPrice.className = 'dish-price';
            dishPrice.textContent = `¥${item.price}`;
            
            dishItem.appendChild(dishName);
            dishItem.appendChild(dishPrice);
            dishesDiv.appendChild(dishItem);
        });

        sectionDiv.appendChild(dishesDiv);
        container.appendChild(sectionDiv);
    });
}

// 加载菜单数据
async function loadMenu() {
    try {
        const response = await fetch(`${API_BASE}/menu/current`);
        if (!response.ok) throw new Error('加载菜单失败');
        
        const data = await response.json();
        
        // 应用主题
        if (data.theme) {
            currentTheme = data.theme;
            applyTheme(currentTheme);
        }
        
        // 渲染菜单
        if (data.menu) {
            renderMenu(data.menu);
        }
    } catch (error) {
        console.error('加载菜单出错:', error);
        // 使用默认菜单
        loadDefaultMenu();
    }
}

// 加载默认菜单（离线模式）
function loadDefaultMenu() {
    const defaultMenu = {
        coldDishes: [
            { name: '拍黄瓜', price: 5 },
            { name: '凉拌木耳', price: 6 }
        ],
        hotDishes: [
            { name: '红烧肉', price: 18 },
            { name: '糖醋鱼', price: 22 },
            { name: '宫保鸡丁', price: 16 },
            { name: '蒜蓉西兰花', price: 10 },
            { name: '鱼香茄子', price: 12 },
            { name: '土豆炖牛肉', price: 20 }
        ],
        stapleFood: [
            { name: '米饭', price: 2 },
            { name: '面条', price: 8 },
            { name: '饺子', price: 12 },
            { name: '馒头', price: 1.5 },
            { name: '煎饼', price: 6 },
            { name: '炒饭', price: 10 }
        ],
        soup: [
            { name: '紫菜蛋花汤', price: 3 },
            { name: '番茄汤', price: 3 }
        ],
        fruit: [
            { name: '苹果', price: 5 },
            { name: '香蕉', price: 4 }
        ]
    };

    applyTheme(currentTheme);
    renderMenu(defaultMenu);
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    loadMenu();
    // 每30秒刷新一次菜单
    setInterval(loadMenu, 30000);
});
