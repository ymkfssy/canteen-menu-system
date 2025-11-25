// 前台显示脚本 - 针对3200×192分辨率优化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化显示
    initDisplay();
    
    // 每30秒更新一次数据
    setInterval(updateDisplay, 30000);
});

// 初始化显示
async function initDisplay() {
    // 设置当前日期
    updateDateDisplay();
    
    // 更新显示内容
    await updateDisplay();
}

// 更新日期显示
function updateDateDisplay() {
    const currentDate = new Date();
    const dateString = currentDate.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
    document.getElementById('currentDate').textContent = dateString;
}

// 更新显示内容
async function updateDisplay() {
    try {
        // 获取菜单数据
        const menuData = await window.canteenAPI.getMenu();
        
        // 获取主题数据
        const themeData = await window.canteenAPI.getThemes();
        
        // 更新各分类菜品
        updateCategory('coldDishes', menuData.coldDishes);
        updateCategory('hotDishes', menuData.hotDishes);
        updateCategory('staples', menuData.staples);
        updateCategory('soups', menuData.soups);
        updateCategory('fruits', menuData.fruits);
        
        // 更新主题
        updateTheme(themeData.activeTheme);
        
        // 更新最后更新时间
        document.getElementById('lastUpdateTime').textContent = 
            new Date().toLocaleString('zh-CN');
            
        console.log('菜单显示更新成功');
    } catch (error) {
        console.error('更新显示失败:', error);
        // 降级处理，显示默认菜单
        showFallbackMenu();
    }
}

// 更新分类菜品显示
function updateCategory(categoryId, items) {
    const container = document.getElementById(categoryId);
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!items || items.length === 0) {
        const emptyItem = document.createElement('div');
        emptyItem.className = 'menu-item empty-message';
        emptyItem.innerHTML = '<span>暂无菜品</span>';
        container.appendChild(emptyItem);
        return;
    }
    
    items.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        menuItem.innerHTML = `
            <span class="item-name">${item.name}</span>
            <span class="item-price">¥${parseFloat(item.price).toFixed(2)}</span>
        `;
        container.appendChild(menuItem);
    });
}

// 更新主题
function updateTheme(theme) {
    const displayScreen = document.getElementById('displayScreen');
    if (!displayScreen) return;
    
    // 移除所有主题类
    displayScreen.classList.remove('spring-theme', 'summer-theme', 'autumn-theme', 'winter-theme');
    // 添加当前主题类
    displayScreen.classList.add(`${theme}-theme`);
}

// 显示降级菜单（当API不可用时）
function showFallbackMenu() {
    const fallbackMenu = {
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
    
    updateCategory('coldDishes', fallbackMenu.coldDishes);
    updateCategory('hotDishes', fallbackMenu.hotDishes);
    updateCategory('staples', fallbackMenu.staples);
    updateCategory('soups', fallbackMenu.soups);
    updateCategory('fruits', fallbackMenu.fruits);
    
    document.getElementById('lastUpdateTime').textContent = '数据加载失败，显示默认菜单';
}
