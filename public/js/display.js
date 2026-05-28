const API_BASE = '/api';
let currentTheme = 'prosperity';
let currentBackgroundImage = '';

// 应用主题样式
function applyTheme(themeName) {
    const theme = THEMES[themeName];
    if (!theme) return;

    let titleStyles = '';
    if (theme.isProsperityTheme) {
        // 开门红主题 - 使用春天主题的标题样式确保清晰
        titleStyles = `
        .title {
            color: #fff;
            text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
            background: none !important;
            background-image: none !important;
            -webkit-background-clip: none !important;
            -webkit-text-fill-color: #fff !important;
        }
        .datetime {
            background: rgba(255, 215, 0, 0.2);
            border: 1px solid rgba(255, 215, 0, 0.3);
            box-shadow: 0 0 10px rgba(255, 215, 0, 0.2);
            color: #fff;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
        }
        `;
    } else {
        // 普通主题样式
        titleStyles = `
        .title {
            color: #fff;
            text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
            background: none !important;
            background-image: none !important;
            -webkit-background-clip: none !important;
            -webkit-text-fill-color: #fff !important;
        }
        `;
    }

    // 背景样式：优先使用背景图片，如果没有则使用主题背景
    const backgroundStyle = currentBackgroundImage 
        ? `background-image: url(${currentBackgroundImage}); background-size: cover; background-position: center; background-repeat: no-repeat;`
        : `background: ${theme.colors.primary};`;

    // 生成默认分类样式
    let categoryStyles = `
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
    
    // 为自定义分类生成样式（使用循环颜色）
    // 注意：这里需要异步获取，但为了保持applyTheme函数的同步性，我们降级到localStorage
    let customCategories = [];
    try {
        const stored = localStorage.getItem('custom_categories');
        customCategories = stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('获取自定义分类失败:', error);
    }
    const colorPalette = [
        { header: '#81C784', item: 'rgba(129, 199, 132, 0.12)' },
        { header: '#FF8A65', item: 'rgba(255, 138, 101, 0.12)' },
        { header: '#FFD54F', item: 'rgba(255, 213, 79, 0.12)' },
        { header: '#4DD0E1', item: 'rgba(77, 208, 225, 0.12)' },
        { header: '#F06292', item: 'rgba(240, 98, 146, 0.12)' }
    ];
    
    customCategories.forEach((cat, index) => {
        const colorIndex = index % colorPalette.length;
        const color = colorPalette[colorIndex];
        categoryStyles += `
        .custom-${cat.key} .section-header {
            border-bottom-color: ${color.header};
        }
        .custom-${cat.key} .dish-item {
            background: ${color.item};
        }
        `;
    });

    const styles = `
        body {
            ${backgroundStyle}
        }
        .header {
            background: ${theme.colors.header};
        }
        ${categoryStyles}
        ${titleStyles}
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
async function renderMenu(menuData) {
    const container = document.getElementById('menuContainer');
    container.innerHTML = '';

    // 获取自定义分类
    const customCategories = await getCustomCategories();
    
    // 默认分类配置
    const defaultSections = [
        { key: 'coldDishes', title: '凉菜', class: 'cold-dishes' },
        { key: 'hotDishes', title: '热菜', class: 'hot-dishes' },
        { key: 'stapleFood', title: '主食', class: 'staple-food' },
        { key: 'soup', title: '汤品', class: 'soup' },
        { key: 'fruit', title: '水果', class: 'fruit' }
    ];
    
    // 添加自定义分类配置
    const customSections = customCategories.map(cat => ({
        key: cat.key,
        title: cat.name,
        class: `custom-${cat.key}`
    }));
    
    // 合并所有分类
    const sections = [...defaultSections, ...customSections];

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
        dishesDiv.setAttribute('data-count', items.length);

        items.forEach(item => {
            const dishItem = document.createElement('div');
            dishItem.className = 'dish-item';
            
            // 创建名称和标签的容器
            const dishNameContainer = document.createElement('div');
            dishNameContainer.style.display = 'flex';
            dishNameContainer.style.alignItems = 'center';
            dishNameContainer.style.flex = '1';
            
            const dishName = document.createElement('span');
            dishName.className = 'dish-name';
            dishName.textContent = item.name;
            
            // 添加个性化标志
            const badges = item.badges || [];
            const badgesContainer = document.createElement('div');
            badgesContainer.className = 'dish-badges';
            
            if (badges.includes('hot')) {
                const hotBadge = document.createElement('span');
                hotBadge.className = 'dish-badge hot-badge';
                hotBadge.textContent = '畅销';
                badgesContainer.appendChild(hotBadge);
            }
            
            if (badges.includes('recommend')) {
                const recommendBadge = document.createElement('span');
                recommendBadge.className = 'dish-badge recommend-badge';
                recommendBadge.textContent = '推荐';
                badgesContainer.appendChild(recommendBadge);
            }
            
            // 将名称和标签组合在一起
            dishNameContainer.appendChild(dishName);
            dishNameContainer.appendChild(badgesContainer);
            
            const dishPrice = document.createElement('div');
            dishPrice.className = 'dish-price';
            dishPrice.textContent = `¥${item.price}`;
            
            dishItem.appendChild(dishNameContainer);
            dishItem.appendChild(dishPrice);
            dishesDiv.appendChild(dishItem);
        });

        sectionDiv.appendChild(dishesDiv);
        container.appendChild(sectionDiv);
    });
}

// 获取自定义分类（优先从API获取，降级到localStorage）
async function getCustomCategories() {
    try {
        // 先尝试从API获取
        const response = await fetch(`${API_BASE}/categories`);
        if (response.ok) {
            const apiCategories = await response.json();
            
            // 同时获取localStorage中的分类（用于本地测试）
            const localCategories = JSON.parse(localStorage.getItem('custom_categories') || '[]');
            
            // 合并API和本地分类，去重
            const allCategories = [...apiCategories, ...localCategories];
            const uniqueCategories = allCategories.filter((cat, index, arr) => 
                arr.findIndex(c => c.key === cat.key) === index
            );
            
            return uniqueCategories;
        }
    } catch (error) {
        console.log('从API获取分类失败，使用本地数据:', error);
    }
    
    // 降级到localStorage
    try {
        const stored = localStorage.getItem('custom_categories');
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('获取自定义分类失败:', error);
        return [];
    }
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
        }
        
        // 应用背景图片
        if (data.backgroundImage) {
            currentBackgroundImage = data.backgroundImage;
        }
        
        applyTheme(currentTheme);
        
        // 渲染菜单
        if (data.menu) {
            await renderMenu(data.menu);
        }
    } catch (error) {
        console.error('加载菜单出错:', error);
        // 使用默认菜单
        await loadDefaultMenu();
    }
}

// 加载默认菜单（离线模式）
async function loadDefaultMenu() {
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
    await renderMenu(defaultMenu);
}

// 防止缓存的版本号
const APP_VERSION = new Date().getTime();

// 轮询刷新配置
const POLL_INTERVAL = 30000; // 30秒检查一次
let lastKnownVersion = null;
let pollTimer = null;
let isPageVisible = true;

// 检查菜单更新
async function checkMenuUpdates() {
    try {
        // 如果页面不可见，跳过检查
        if (!isPageVisible) return;
        
        const response = await fetch(`${API_BASE}/menu/updates`);
        if (!response.ok) throw new Error('检查更新失败');
        
        const data = await response.json();
        
        // 首次加载时记录版本
        if (lastKnownVersion === null) {
            lastKnownVersion = data.version;
            localStorage.setItem('lastKnownVersion', data.version);
            localStorage.setItem('lastUpdateCheck', Date.now());
            return;
        }
        
        // 检查版本是否有变化
        if (data.version > lastKnownVersion) {
            console.log('检测到菜单更新，版本：', data.version);
            
            // 立即更新本地版本号，防止重复触发
            lastKnownVersion = data.version;
            localStorage.setItem('lastKnownVersion', data.version);
            
            // 停止轮询，防止在等待刷新期间重复检查
            stopPolling();
            
            showUpdateNotification(data.latestUpdate);
            
            // 延迟3秒后自动刷新
            setTimeout(() => {
                window.location.reload();
            }, 3000);
        }
        
    } catch (error) {
        console.error('检查菜单更新失败:', error);
    }
}

// 显示更新通知
function showUpdateNotification(updateInfo) {
    if (!updateInfo) return;
    
    // 创建通知元素
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        z-index: 9999;
        font-size: 14px;
        max-width: 300px;
        animation: slideIn 0.3s ease-out;
    `;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <div style="font-size: 20px;">🔄</div>
            <div>
                <div style="font-weight: bold; margin-bottom: 5px;">菜单已更新</div>
                <div style="font-size: 12px; opacity: 0.9;">${updateInfo.description}</div>
                <div style="font-size: 11px; opacity: 0.7; margin-top: 5px;">3秒后自动刷新...</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // 添加CSS动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
}

// 启动轮询
function startPolling() {
    if (pollTimer) clearInterval(pollTimer);
    
    // 立即检查一次
    checkMenuUpdates();
    
    // 启动定时检查
    pollTimer = setInterval(checkMenuUpdates, POLL_INTERVAL);
}

// 停止轮询
function stopPolling() {
    if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
    }
}

// 页面可见性检测
document.addEventListener('visibilitychange', () => {
    isPageVisible = !document.hidden;
    
    if (isPageVisible) {
        // 页面重新可见时，立即检查一次
        startPolling();
    } else {
        // 页面隐藏时，停止轮询节省资源
        stopPolling();
    }
});

// 页面获得焦点时也立即检查
window.addEventListener('focus', () => {
    checkMenuUpdates();
});

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // 添加版本号到链接防止缓存
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    links.forEach(link => {
        if (link.href.indexOf('?') === -1) {
            link.href += '?v=' + APP_VERSION;
        }
    });
    
    // 从localStorage恢复版本信息
    lastKnownVersion = parseInt(localStorage.getItem('lastKnownVersion') || '0');
    
    await loadMenu();
    
    // 启动轮询检查更新
    startPolling();
});
