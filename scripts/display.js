// 前台显示脚本
document.addEventListener('DOMContentLoaded', function() {
    // 初始化显示
    initDisplay();
    
    // 每30秒更新一次数据（模拟实时更新）
    setInterval(updateDisplay, 30000);
});

// 初始化显示
function initDisplay() {
    // 设置当前日期
    const currentDate = new Date();
    const dateString = currentDate.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
    document.getElementById('currentDate').textContent = dateString;
    
    // 从localStorage获取菜单数据
    updateDisplay();
}

// 更新显示内容
function updateDisplay() {
    // 获取菜单数据
    const menuData = getMenuData();
    
    // 更新各分类菜品
    updateCategory('coldDishes', menuData.coldDishes);
    updateCategory('hotDishes', menuData.hotDishes);
    updateCategory('staples', menuData.staples);
    updateCategory('soups', menuData.soups);
    updateCategory('fruits', menuData.fruits);
    
    // 更新主题
    updateTheme(menuData.theme);
    
    // 更新最后更新时间
    document.getElementById('lastUpdateTime').textContent = menuData.lastUpdate || '--';
}

// 更新分类菜品显示
function updateCategory(categoryId, items) {
    const container = document.getElementById(categoryId);
    container.innerHTML = '';
    
    items.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        menuItem.innerHTML = `
            <span class="item-name">${item.name}</span>
            <span class="item-price">¥${item.price}</span>
        `;
        container.appendChild(menuItem);
    });
}

// 更新主题
function updateTheme(theme) {
    const displayScreen = document.getElementById('displayScreen');
    // 移除所有主题类
    displayScreen.classList.remove('spring-theme', 'summer-theme', 'autumn-theme', 'winter-theme');
    // 添加当前主题类
    displayScreen.classList.add(`${theme}-theme`);
}

// 从localStorage获取菜单数据
function getMenuData() {
    // 默认菜单数据
    const defaultData = {
        theme: 'spring',
        lastUpdate: new Date().toLocaleString('zh-CN'),
        coldDishes: [
            { name: '凉拌黄瓜', price: '8.00' },
            { name: '拍黄瓜', price: '8.00' }
        ],
        hotDishes: [
            { name: '红烧肉', price: '28.00' },
            { name: '宫保鸡丁', price: '22.00' },
            { name: '麻婆豆腐', price: '18.00' },
            { name: '清蒸鲈鱼', price: '35.00' },
            { name: '西红柿炒蛋', price: '15.00' },
            { name: '地三鲜', price: '16.00' }
        ],
        staples: [
            { name: '米饭', price: '2.00' },
            { name: '馒头', price: '1.00' },
            { name: '面条', price: '10.00' },
            { name: '水饺', price: '15.00' },
            { name: '包子', price: '2.50' },
            { name: '煎饼', price: '5.00' }
        ],
        soups: [
            { name: '西红柿蛋汤', price: '6.00' },
            { name: '紫菜汤', price: '5.00' }
        ],
        fruits: [
            { name: '苹果', price: '5.00' },
            { name: '香蕉', price: '4.00' }
        ]
    };
    
    // 尝试从localStorage获取数据
    try {
        const storedData = localStorage.getItem('canteenMenuData');
        if (storedData) {
            return JSON.parse(storedData);
        }
    } catch (e) {
        console.error('读取菜单数据失败:', e);
    }
    
    // 返回默认数据
    return defaultData;
}