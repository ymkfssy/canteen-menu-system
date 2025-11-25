// 后台管理脚本
document.addEventListener('DOMContentLoaded', function() {
    // 检查登录状态
    checkLoginStatus();
    
    // 初始化事件监听器
    initEventListeners();
    
    // 初始化管理界面
    initAdminPanel();
});

// 检查登录状态
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    
    if (isLoggedIn) {
        showAdminPanel();
    } else {
        showLoginForm();
    }
}

// 显示登录表单
function showLoginForm() {
    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('adminContainer').style.display = 'none';
}

// 显示管理面板
function showAdminPanel() {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('adminContainer').style.display = 'block';
}

// 初始化事件监听器
function initEventListeners() {
    // 登录按钮
    document.getElementById('loginBtn').addEventListener('click', handleLogin);
    
    // 退出登录按钮
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // 导航链接
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            switchTab(this.getAttribute('data-tab'));
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
            addMenuItem(this.getAttribute('data-category'));
        });
    });
    
    // 主题选择
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', function() {
            selectTheme(this.getAttribute('data-theme'));
        });
    });
}

// 初始化管理面板
function initAdminPanel() {
    // 加载菜单数据
    loadMenuData();
    
    // 初始化主题预览
    initThemePreview();
    
    // 默认显示菜单管理标签
    switchTab('menu');
}

// 切换标签页
function switchTab(tabName) {
    // 更新导航激活状态
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`.nav-link[data-tab="${tabName}"]`).classList.add('active');
    
    // 更新内容区域显示
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${tabName}Section`).classList.add('active');
    
    // 特殊处理某些标签页
    if (tabName === 'theme') {
        updateThemePreview();
    } else if (tabName === 'settings') {
        updateSystemInfo();
    }
}

// 处理登录
function handleLogin() {
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('loginError');
    
    // 简单验证
    if (!password) {
        errorElement.textContent = '请输入密码';
        return;
    }
    
    // 获取存储的密码（默认密码为"admin"）
    const storedPassword = localStorage.getItem('adminPassword') || 'admin';
    
    if (password === storedPassword) {
        // 登录成功
        localStorage.setItem('adminLoggedIn', 'true');
        showAdminPanel();
    } else {
        errorElement.textContent = '密码错误';
    }
}

// 处理退出登录
function handleLogout() {
    localStorage.setItem('adminLoggedIn', 'false');
    showLoginForm();
    // 清空密码输入框
    document.getElementById('password').value = '';
}

// 加载菜单数据
function loadMenuData() {
    const menuData = getMenuData();
    
    // 更新各分类编辑器
    updateCategoryEditor('coldDishes', menuData.coldDishes);
    updateCategoryEditor('hotDishes', menuData.hotDishes);
    updateCategoryEditor('staples', menuData.staples);
    updateCategoryEditor('soups', menuData.soups);
    updateCategoryEditor('fruits', menuData.fruits);
    
    // 更新当前主题选择
    selectTheme(menuData.theme);
}

// 更新分类编辑器
function updateCategoryEditor(categoryId, items) {
    const container = document.getElementById(`${categoryId}Editor`);
    container.innerHTML = '';
    
    items.forEach((item, index) => {
        const itemEditor = document.createElement('div');
        itemEditor.className = 'menu-item-editor';
        itemEditor.innerHTML = `
            <input type="text" class="item-name" value="${item.name}" data-category="${categoryId}" data-index="${index}">
            <input type="text" class="item-price" value="${item.price}" data-category="${categoryId}" data-index="${index}">
            <button class="delete-item-btn" data-category="${categoryId}" data-index="${index}">删除</button>
        `;
        container.appendChild(itemEditor);
    });
    
    // 添加删除按钮事件监听
    container.querySelectorAll('.delete-item-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            const index = parseInt(this.getAttribute('data-index'));
            deleteMenuItem(category, index);
        });
    });
}

// 添加菜单项
function addMenuItem(category) {
    const menuData = getMenuData();
    
    // 检查是否已达到最大数量
    const maxCounts = {
        coldDishes: 2,
        hotDishes: 6,
        staples: 6,
        soups: 2,
        fruits: 2
    };
    
    if (menuData[category].length >= maxCounts[category]) {
        alert(`已达到${category === 'coldDishes' ? '凉菜' : 
                        category === 'hotDishes' ? '热菜' : 
                        category === 'staples' ? '主食' : 
                        category === 'soups' ? '汤品' : '水果'}的最大数量限制`);
        return;
    }
    
    // 添加新项
    menuData[category].push({ name: '新菜品', price: '0.00' });
    
    // 保存数据并更新界面
    saveMenuData(menuData);
    updateCategoryEditor(category, menuData[category]);
}

// 删除菜单项
function deleteMenuItem(category, index) {
    if (!confirm('确定要删除这个菜品吗？')) {
        return;
    }
    
    const menuData = getMenuData();
    menuData[category].splice(index, 1);
    
    // 保存数据并更新界面
    saveMenuData(menuData);
    updateCategoryEditor(category, menuData[category]);
}

// 保存菜单
function saveMenu() {
    const menuData = getMenuData();
    
    // 收集所有输入字段的值
    document.querySelectorAll('.menu-item-editor').forEach(editor => {
        const nameInput = editor.querySelector('.item-name');
        const priceInput = editor.querySelector('.item-price');
        
        const category = nameInput.getAttribute('data-category');
        const index = parseInt(nameInput.getAttribute('data-index'));
        
        menuData[category][index].name = nameInput.value;
        menuData[category][index].price = priceInput.value;
    });
    
    // 更新最后修改时间
    menuData.lastUpdate = new Date().toLocaleString('zh-CN');
    
    // 保存数据
    saveMenuData(menuData);
    
    alert('菜单已保存！');
}

// 重置菜单
function resetMenu() {
    if (!confirm('确定要重置菜单吗？这将恢复为默认菜单。')) {
        return;
    }
    
    // 清除存储的菜单数据
    localStorage.removeItem('canteenMenuData');
    
    // 重新加载菜单
    loadMenuData();
    
    alert('菜单已重置！');
}

// 选择主题
function selectTheme(theme) {
    // 更新主题选项激活状态
    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.remove('active');
    });
    document.querySelector(`.theme-option[data-theme="${theme}"]`).classList.add('active');
    
    // 更新主题预览
    updateThemePreview();
}

// 初始化主题预览
function initThemePreview() {
    // 创建预览内容
    const previewScreen = document.getElementById('themePreview');
    previewScreen.innerHTML = `
        <div class="preview-header">
            <div class="preview-date">${new Date().toLocaleDateString('zh-CN')}</div>
            <div class="preview-canteen">员工食堂</div>
        </div>
        <div class="preview-menu">
            <div class="preview-category">
                <div class="preview-category-title">热菜</div>
                <div class="preview-items">
                    <div class="preview-item">红烧肉 ¥28.00</div>
                    <div class="preview-item">宫保鸡丁 ¥22.00</div>
                </div>
            </div>
        </div>
    `;
}

// 更新主题预览
function updateThemePreview() {
    const selectedTheme = document.querySelector('.theme-option.active').getAttribute('data-theme');
    const previewScreen = document.getElementById('themePreview');
    
    // 移除所有主题类
    previewScreen.classList.remove('spring-theme', 'summer-theme', 'autumn-theme', 'winter-theme');
    // 添加当前主题类
    previewScreen.classList.add(`${selectedTheme}-theme`);
}

// 保存主题
function saveTheme() {
    const selectedTheme = document.querySelector('.theme-option.active').getAttribute('data-theme');
    const menuData = getMenuData();
    
    menuData.theme = selectedTheme;
    menuData.lastUpdate = new Date().toLocaleString('zh-CN');
    
    saveMenuData(menuData);
    
    alert('主题已应用！');
}

// 处理文件选择
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

// 上传Excel
function uploadExcel() {
    // 这里应该实现解析Excel文件并更新菜单数据的逻辑
    // 由于浏览器限制，这里仅模拟上传过程
    
    alert('Excel文件上传成功！菜单数据已更新。');
    
    // 模拟上传后的数据更新
    const menuData = getMenuData();
    menuData.lastUpdate = new Date().toLocaleString('zh-CN');
    saveMenuData(menuData);
    
    // 重新加载菜单
    loadMenuData();
    
    // 重置上传区域
    resetUploadArea();
}

// 下载模板
function downloadTemplate() {
    // 这里应该实现生成并下载Excel模板的逻辑
    alert('模板文件下载开始...');
    // 在实际实现中，这里应该生成一个Excel文件并触发下载
}

// 重置上传区域
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

// 修改密码
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
    
    // 获取存储的密码
    const storedPassword = localStorage.getItem('adminPassword') || 'admin';
    
    if (currentPassword !== storedPassword) {
        alert('当前密码错误');
        return;
    }
    
    // 保存新密码
    localStorage.setItem('adminPassword', newPassword);
    
    alert('密码修改成功！');
    
    // 清空密码字段
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
}

// 更新系统信息
function updateSystemInfo() {
    const menuData = getMenuData();
    
    document.getElementById('systemLastUpdate').textContent = menuData.lastUpdate || '--';
    document.getElementById('systemCurrentTheme').textContent = 
        menuData.theme === 'spring' ? '春季' :
        menuData.theme === 'summer' ? '夏季' :
        menuData.theme === 'autumn' ? '秋季' : '冬季';
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

// 保存菜单数据到localStorage
function saveMenuData(menuData) {
    try {
        localStorage.setItem('canteenMenuData', JSON.stringify(menuData));
    } catch (e) {
        console.error('保存菜单数据失败:', e);
        alert('保存失败，请重试');
    }
}