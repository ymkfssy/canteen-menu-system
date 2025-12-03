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
    const customCategories = getCustomCategories();
    const colorPalette = [
        { header: '#48dbfb', item: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)' },
        { header: '#f093fb', item: 'linear-gradient(135deg, #ffe0ec 0%, #ffc2d4 100%)' },
        { header: '#a8e063', item: 'linear-gradient(135deg, #f0f9e8 0%, #d4edbd 100%)' },
        { header: '#7ee8fa', item: 'linear-gradient(135deg, #e8f8f5 0%, #d0ece7 100%)' },
        { header: '#ff9a9e', item: 'linear-gradient(135deg, #ffe8ea 0%, #ffd4d7 100%)' }
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
function renderMenu(menuData) {
    const container = document.getElementById('menuContainer');
    container.innerHTML = '';

    // 获取自定义分类
    const customCategories = getCustomCategories();
    
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
    
    // 过滤出有菜品的分类，并计算总菜品数
    const sectionsWithData = sections
        .map(section => ({
            ...section,
            items: menuData[section.key] || [],
            itemCount: (menuData[section.key] || []).length
        }))
        .filter(section => section.itemCount > 0);
    
    // 计算每个分类的基础宽度（根据菜品数量）
    const calculateBaseWidth = (count) => {
        if (count === 1) return 200;
        if (count === 2) return 280;
        if (count === 3) return 380;
        if (count === 4) return 460;
        if (count === 5) return 540;
        if (count === 6) return 620;
        if (count <= 8) return 720;
        return 820;
    };
    
    sectionsWithData.forEach(section => {
        section.baseWidth = calculateBaseWidth(section.itemCount);
    });
    
    // 计算总宽度和可用宽度
    const totalBaseWidth = sectionsWithData.reduce((sum, s) => sum + s.baseWidth, 0);
    const availableWidth = 3200 - 30 - (sectionsWithData.length - 1) * 10; // 减去padding和gap
    
    // 如果总宽度超出，按比例缩小
    let widthRatio = 1;
    if (totalBaseWidth > availableWidth) {
        widthRatio = availableWidth / totalBaseWidth;
        // 确保缩放比例不要太小，最小0.85
        widthRatio = Math.max(widthRatio, 0.85);
    }

    sectionsWithData.forEach(section => {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = `menu-section ${section.class}`;
        
        // 应用宽度比例
        let finalWidth = Math.floor(section.baseWidth * widthRatio);
        // 根据菜品数量确保最小宽度
        const minWidth = section.itemCount >= 6 ? 500 : 
                        section.itemCount >= 4 ? 380 : 
                        section.itemCount >= 2 ? 250 : 180;
        finalWidth = Math.max(finalWidth, minWidth);
        sectionDiv.style.width = `${finalWidth}px`;
        
        const header = document.createElement('div');
        header.className = 'section-header';
        header.textContent = section.title;
        sectionDiv.appendChild(header);

        const dishesDiv = document.createElement('div');
        dishesDiv.className = 'dishes';
        dishesDiv.setAttribute('data-count', section.itemCount);

        section.items.forEach(item => {
            const dishItem = document.createElement('div');
            dishItem.className = 'dish-item';
            
            const dishName = document.createElement('div');
            dishName.className = 'dish-name';
            dishName.textContent = item.name;
            
            const dishPrice = document.createElement('div');
            dishPrice.className = 'dish-price';
            dishPrice.textContent = `¥${item.price}`;
            
            // 添加个性化标志
            const badges = item.badges || [];
            const badgesContainer = document.createElement('div');
            badgesContainer.className = 'dish-badges';
            
            if (badges.includes('hot')) {
                const hotBadge = document.createElement('span');
                hotBadge.className = 'dish-badge hot-badge';
                hotBadge.textContent = '热销';
                badgesContainer.appendChild(hotBadge);
            }
            
            if (badges.includes('recommend')) {
                const recommendBadge = document.createElement('span');
                recommendBadge.className = 'dish-badge recommend-badge';
                recommendBadge.textContent = '推荐';
                badgesContainer.appendChild(recommendBadge);
            }
            
            // 按正确顺序添加元素：名称 -> 标签 -> 价格
            dishItem.appendChild(dishName);
            if (badges.length > 0) {
                dishItem.appendChild(badgesContainer);
            }
            dishItem.appendChild(dishPrice);
            dishesDiv.appendChild(dishItem);
        });

        sectionDiv.appendChild(dishesDiv);
        container.appendChild(sectionDiv);
    });
}

// 获取自定义分类（从localStorage）
function getCustomCategories() {
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
});
