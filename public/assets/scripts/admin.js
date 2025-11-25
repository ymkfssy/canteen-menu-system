// 后台管理脚本 - 增强错误处理和调试信息
document.addEventListener('DOMContentLoaded', function() {
    console.log('后台管理页面加载完成');
    // 检查登录状态
    checkLoginStatus();
    
    // 初始化事件监听器
    initEventListeners();
});

function checkLoginStatus() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
    console.log('登录状态检查:', isLoggedIn);
    
    if (isLoggedIn) {
        showAdminPanel();
    } else {
        showLoginForm();
    }
}

function showLoginForm() {
    console.log('显示登录表单');
    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('adminContainer').style.display = 'none';
}

function showAdminPanel() {
    console.log('显示管理面板');
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('adminContainer').style.display = 'block';
    initAdminPanel();
}

function initEventListeners() {
    console.log('初始化事件监听器');
    
    // 登录按钮
    document.getElementById('loginBtn').addEventListener('click', handleLogin);
    
    // 退出登录按钮
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // 导航链接
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const tab = this.getAttribute('data-tab');
            console.log('切换标签:', tab);
            switchTab(tab);
        });
    });
    
    // 保存菜单按钮
    document.getElementById('saveMenuBtn').addEventListener('click', saveMenu);
    
    // 重置菜单按钮
    document.getElementById('resetMenuBtn').addEventListener('click', resetMenu);
    
    // 应用主题按钮
    document.getElementById('saveThemeBtn').addEventListener('click', saveTheme);
    
    // 选择文件按钮
    document.getElementById('selectFileBtn').addEventListener('click', function() {
        document.getElementById('excelFile').click();
    });
    
    // 文件选择变化
    document.getElementById('excelFile').addEventListener('change', handleFileSelect);
    
    // 上传按钮
    document.getElementById('uploadBtn').addEventListener('click', uploadExcel);
    
    // 下载模板
    document.getElementById('downloadTemplate').addEventListener('click', downloadTemplate);
    
    // 修改密码
    document.getElementById('changePasswordBtn').addEventListener('click', changePassword);
    
    // 添加菜品按钮
    document.querySelectorAll('.add-item-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            console.log('添加菜品:', category);
            addMenuItem(category);
        });
    });
    
    // 主题选择
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            console.log('选择主题:', theme);
            selectTheme(theme);
        });
    });
}

async function initAdminPanel() {
    console.log('初始化管理面板');
    try {
        await loadMenuData();
        await loadThemeData();
        updatePreviewDate();
        switchTab('menu');
        console.log('后台管理面板初始化成功');
    } catch (error) {
        console.error('初始化管理面板失败:', error);
        alert('初始化失败: ' + error.message);
    }
}

async function handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('loginError');
    
    console.log('登录尝试:', { username, hasPassword: !!password });
    
    if (!username || !password) {
        errorElement.textContent = '请输入用户名和密码';
        return;
    }
    
    try {
        const result = await window.canteenAPI.login(username, password);
        console.log('登录响应:', result);
        
        if (result.success) {
            sessionStorage.setItem('adminLoggedIn', 'true');
            showAdminPanel();
        } else {
            errorElement.textContent = result.error || '登录失败';
        }
    } catch (error) {
        console.error('登录错误:', error);
        errorElement.textContent = '登录失败: ' + error.message;
    }
}

function handleLogout() {
    console.log('用户退出登录');
    sessionStorage.setItem('adminLoggedIn', 'false');
    showLoginForm();
    document.getElementById('username').value = 'admin';
    document.getElementById('password').value = '';
}

async function loadMenuData() {
    console.log('开始加载菜单数据');
    try {
        const menuData = await window.canteenAPI.getMenu();
        console.log('菜单数据加载成功:', menuData);
        
        updateCategoryEditor('coldDishes', menuData.coldDishes);
        updateCategoryEditor('hotDishes', menuData.hotDishes);
        updateCategoryEditor('staples', menuData.staples);
        updateCategoryEditor('soups', menuData.soups);
        updateCategoryEditor('fruits', menuData.fruits);
        
        // 更新菜品计数
        updateItemCounts(menuData);
        console.log('菜单数据加载成功');
    } catch (error) {
        console.error('加载菜单数据失败:', error);
        alert('加载菜单数据失败: ' + error.message);
        // 使用模拟数据
        useMockMenuData();
    }
}

async function loadThemeData() {
    console.log('开始加载主题数据');
    try {
        const themeData = await window.canteenAPI.getThemes();
        console.log('主题数据加载成功:', themeData);
        
        selectTheme(themeData.activeTheme);
        updateSystemInfo(themeData.activeTheme);
        console.log('主题数据加载成功');
    } catch (error) {
        console.error('加载主题数据失败:', error);
        alert('加载主题数据失败: ' + error.message);
        // 使用默认主题
        selectTheme('spring');
    }
}

function updateCategoryEditor(categoryId, items) {
    const container = document.getElementById(`${categoryId}Editor`);
    if (!container) {
        console.error('找不到容器:', `${categoryId}Editor`);
        return;
    }
    
    console.log(`更新分类编辑器 ${categoryId}, 有 ${items?.length || 0} 个菜品`);
    container.innerHTML = '';
    
    if (!items || items.length === 0) {
        // 如果没有菜品，添加一个空的输入框
        addEmptyMenuItem(container, categoryId);
        return;
    }
    
    items.forEach((item, index) => {
        const itemEditor = document.createElement('div');
        itemEditor.className = 'menu-item-editor';
        itemEditor.innerHTML = `
            <input type="text" class="item-name" value="${item.name || ''}" data-category="${categoryId}">
            <input type="text" class="item-price" value="${parseFloat(item.price || 0).toFixed(2)}" data-category="${categoryId}">
            <button class="delete-item-btn" data-category="${categoryId}">删除</button>
        `;
        container.appendChild(itemEditor);
    });
    
    // 添加删除按钮事件监听
    container.querySelectorAll('.delete-item-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            console.log('删除菜品:', category);
            deleteMenuItem(this);
        });
    });
}

function addEmptyMenuItem(container, category) {
    const itemEditor = document.createElement('div');
    itemEditor.className = 'menu-item-editor';
    itemEditor.innerHTML = `
        <input type="text" class="item-name" placeholder="菜品名称" data-category="${category}">
        <input type="text" class="item-price" placeholder="价格" data-category="${category}">
        <button class="delete-item-btn" data-category="${category}">删除</button>
    `;
    container.appendChild(itemEditor);
    
    // 添加删除按钮事件
    itemEditor.querySelector('.delete-item-btn').addEventListener('click', function() {
        container.removeChild(itemEditor);
        updateItemCount(category);
    });
}

function addMenuItem(category) {
    const container = document.getElementById(`${category}Editor`);
    const maxCounts = {
        coldDishes: 2,
        hotDishes: 6,
        staples: 6,
        soups: 2,
        fruits: 2
    };
    
    const currentCount = container.querySelectorAll('.menu-item-editor').length;
    if (currentCount >= maxCounts[category]) {
        alert(`已达到${getCategoryName(category)}的最大数量限制 (${maxCounts[category]}个)`);
        return;
    }
    
    addEmptyMenuItem(container, category);
    updateItemCount(category);
}

function getCategoryName(categoryId) {
    const names = {
        coldDishes: '凉菜',
        hotDishes: '热菜',
        staples: '主食',
        soups: '汤品',
        fruits: '水果'
    };
    return names[categoryId] || categoryId;
}

function deleteMenuItem(button) {
    if (!confirm('确定要删除这个菜品吗？')) return;
    
    const container = button.parentElement.parentElement;
    const itemEditor = button.parentElement;
    const category = button.getAttribute('data-category');
    
    container.removeChild(itemEditor);
    updateItemCount(category);
}

function updateItemCounts(menuData) {
    updateItemCount('coldDishes', menuData.coldDishes?.length || 0);
    updateItemCount('hotDishes', menuData.hotDishes?.length || 0);
    updateItemCount('staples', menuData.staples?.length || 0);
    updateItemCount('soups', menuData.soups?.length || 0);
    updateItemCount('fruits', menuData.fruits?.length || 0);
}

function updateItemCount(category, count) {
    if (count === undefined) {
        const container = document.getElementById(`${category}Editor`);
        count = container ? container.querySelectorAll('.menu-item-editor').length : 0;
    }
    
    const countElement = document.getElementById(`${category}Count`);
    if (countElement) {
        countElement.textContent = count;
    }
}

async function saveMenu() {
    console.log('开始保存菜单');
    try {
        // 收集菜单数据
        const menuData = {
            coldDishes: collectCategoryData('coldDishes'),
            hotDishes: collectCategoryData('hotDishes'),
            staples: collectCategoryData('staples'),
            soups: collectCategoryData('soups'),
            fruits: collectCategoryData('fruits')
        };
        
        console.log('要保存的菜单数据:', menuData);
        
        // 验证数据
        if (!validateMenuData(menuData)) {
            return;
        }
        
        const result = await window.canteenAPI.saveMenu(menuData);
        console.log('保存菜单响应:', result);
        alert(result.message || '菜单已保存！');
        
        // 更新菜品计数
        updateItemCounts(menuData);
        console.log('菜单保存成功');
    } catch (error) {
        console.error('保存菜单失败:', error);
        alert('保存菜单失败: ' + error.message);
    }
}

function collectCategoryData(category) {
    const container = document.getElementById(`${category}Editor`);
    const items = [];
    
    if (!container) return items;
    
    container.querySelectorAll('.menu-item-editor').forEach(editor => {
        const nameInput = editor.querySelector('.item-name');
        const priceInput = editor.querySelector('.item-price');
        
        const name = nameInput.value.trim();
        const price = parseFloat(priceInput.value) || 0;
        
        if (name) { // 只添加有名称的菜品
            items.push({
                name: name,
                price: price
            });
        }
    });
    
    return items;
}

function validateMenuData(menuData) {
    const maxCounts = {
        coldDishes: 2,
        hotDishes: 6,
        staples: 6,
        soups: 2,
        fruits: 2
    };
    
    for (const category in maxCounts) {
        if (menuData[category].length > maxCounts[category]) {
            alert(`${getCategoryName(category)}数量超过限制 (最多${maxCounts[category]}个)`);
            return false;
        }
    }
    
    return true;
}

async function resetMenu() {
    if (!confirm('确定要重置菜单吗？这将恢复为默认菜单。')) return;
    
    try {
        // 重新加载菜单数据
        await loadMenuData();
        alert('菜单已重置！');
    } catch (error) {
        console.error('重置菜单失败:', error);
        alert('重置菜单失败: ' + error.message);
    }
}

function selectTheme(theme) {
    console.log('选择主题:', theme);
    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.remove('active');
    });
    
    const selectedOption = document.querySelector(`.theme-option[data-theme="${theme}"]`);
    if (selectedOption) {
        selectedOption.classList.add('active');
    }
    
    // 更新预览
    updateThemePreview(theme);
}

function updateThemePreview(theme) {
    const previewScreen = document.getElementById('themePreview');
    if (!previewScreen) return;
    
    // 移除所有主题类
    previewScreen.classList.remove('spring-theme', 'summer-theme', 'autumn-theme', 'winter-theme');
    // 添加当前主题类
    previewScreen.classList.add(`${theme}-theme`);
}

function updatePreviewDate() {
    const previewDate = document.getElementById('previewDate');
    if (previewDate) {
        const currentDate = new Date();
        const dateString = currentDate.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
        previewDate.textContent = dateString;
    }
}

async function saveTheme() {
    const selectedTheme = document.querySelector('.theme-option.active');
    if (!selectedTheme) {
        alert('请先选择一个主题');
        return;
    }
    
    const theme = selectedTheme.getAttribute('data-theme');
    console.log('保存主题:', theme);
    
    try {
        const result = await window.canteenAPI.setTheme(theme);
        console.log('保存主题响应:', result);
        alert(result.message || '主题已应用！');
        updateSystemInfo(theme);
        console.log('主题应用成功');
    } catch (error) {
        console.error('应用主题失败:', error);
        alert('应用主题失败: ' + error.message);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    const uploadBtn = document.getElementById('uploadBtn');
    
    if (file) {
        // 简单验证文件类型
        if (!file.name.match(/\.(xlsx|xls)$/)) {
            alert('请选择Excel文件 (.xlsx 或 .xls)');
            return;
        }
        
        // 启用上传按钮
        uploadBtn.disabled = false;
        
        // 更新上传框显示
        const uploadBox = document.getElementById('uploadBox');
        uploadBox.innerHTML = `
            <div class="upload-icon">✅</div>
            <p>已选择文件: ${file.name}</p>
            <button class="btn-secondary" id="changeFileBtn">更换文件</button>
        `;
        
        // 添加更换文件按钮事件
        document.getElementById('changeFileBtn').addEventListener('click', function() {
            document.getElementById('excelFile').click();
        });
    }
}

async function uploadExcel() {
    // 这里应该实现解析Excel文件并更新菜单数据的逻辑
    // 由于浏览器限制，这里仅模拟上传过程
    
    alert('Excel文件上传功能将在后续版本中实现');
    
    // 模拟上传后的数据更新
    try {
        await loadMenuData();
    } catch (error) {
        console.error('更新菜单数据失败:', error);
    }
    
    // 重置上传区域
    resetUploadArea();
}

function downloadTemplate() {
    // 这里应该实现生成并下载Excel模板的逻辑
    alert('模板文件下载功能将在后续版本中实现');
}

function resetUploadArea() {
    const uploadBox = document.getElementById('uploadBox');
    uploadBox.innerHTML = `
        <div class="upload-icon">📤</div>
        <p>拖放Excel文件到这里，或点击选择文件</p>
        <button class="btn-secondary" id="selectFileBtn">选择文件</button>
    `;
    
    // 重新绑定选择文件按钮事件
    document.getElementById('selectFileBtn').addEventListener('click', function() {
        document.getElementById('excelFile').click();
    });
    
    // 禁用上传按钮
    document.getElementById('uploadBtn').disabled = true;
    
    // 清空文件输入
    document.getElementById('excelFile').value = '';
}

function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // 验证输入
    if (!currentPassword || !newPassword || !confirmPassword) {
        alert('请填写所有密码字段');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        alert('新密码与确认密码不一致');
        return;
    }
    
    // 这里应该实现修改密码的API调用
    alert('密码修改功能将在后续版本中实现');
    
    // 清空密码字段
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
}

function updateSystemInfo(theme) {
    document.getElementById('systemLastUpdate').textContent = new Date().toLocaleString('zh-CN');
    
    const themeNames = {
        spring: '春季',
        summer: '夏季',
        autumn: '秋季',
        winter: '冬季'
    };
    
    document.getElementById('systemCurrentTheme').textContent = themeNames[theme] || theme;
}

function switchTab(tabName) {
    console.log('切换标签页:', tabName);
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`.nav-link[data-tab="${tabName}"]`).classList.add('active');
    
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${tabName}Section`).classList.add('active');
    
    // 特殊处理某些标签页
    if (tabName === 'theme') {
        updatePreviewDate();
    }
}

// 使用模拟菜单数据
function useMockMenuData() {
    console.log('使用模拟菜单数据');
    const mockData = {
        coldDishes: [
            { name: '凉拌黄瓜', price: 8.00 },
            { name: '拍黄瓜', price: 8.00 }
        ],
        hotDishes: [
            { name: '红烧肉', price: 28.00 },
            { name: '宫保鸡丁', price: 22.00 },
            { name: '麻婆豆腐', price: 18.00 },
            { name: '清蒸鲈鱼', price: 35.00 },
            { name: '西红柿炒蛋', price: 15.00 },
            { name: '地三鲜', price: 16.00 }
        ],
        staples: [
            { name: '米饭', price: 2.00 },
            { name: '馒头', price: 1.00 },
            { name: '面条', price: 10.00 },
            { name: '水饺', price: 15.00 },
            { name: '包子', price: 2.50 },
            { name: '煎饼', price: 5.00 }
        ],
        soups: [
            { name: '西红柿蛋汤', price: 6.00 },
            { name: '紫菜汤', price: 5.00 }
        ],
        fruits: [
            { name: '苹果', price: 5.00 },
            { name: '香蕉', price: 4.00 }
        ]
    };
    
    updateCategoryEditor('coldDishes', mockData.coldDishes);
    updateCategoryEditor('hotDishes', mockData.hotDishes);
    updateCategoryEditor('staples', mockData.staples);
    updateCategoryEditor('soups', mockData.soups);
    updateCategoryEditor('fruits', mockData.fruits);
    
    updateItemCounts(mockData);
}
