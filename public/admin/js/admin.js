const API_BASE = '/api';
let currentMenu = {
    coldDishes: [],
    hotDishes: [],
    stapleFood: [],
    soup: [],
    fruit: []
};
let currentTheme = 'prosperity';
let currentBackgroundImage = '';
let editingCategory = null;
let editingIndex = null;

// 检查登录状态
function checkAuth() {
    const token = localStorage.getItem('admin_token');
    if (!token) {
        window.location.href = '/admin/login.html';
        return false;
    }
    return token;
}

// 退出登录
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('admin_token');
    window.location.href = '/admin/login.html';
});

// Tab切换
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = item.dataset.tab;
        
        // 更新导航状态
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        // 更新内容区域
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        document.getElementById(`${tab}Tab`).classList.add('active');
        
        // 更新标题
        const titles = {
            current: '当前菜单管理',
            presets: '预存菜单管理',
            category: '分类管理',
            theme: '主题设置'
        };
        document.getElementById('pageTitle').textContent = titles[tab];
    });
});

// 渲染菜品编辑器
function renderDishEditor(category, items) {
    const container = document.getElementById(`${category}Editor`);
    container.innerHTML = '';
    
    items.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'dish-item-editor';
        // 构建个性化标志
        const badges = item.badges || [];
        const badgesHtml = badges.map(badge => {
            if (badge === 'hot') return '<span class="dish-badge hot-badge">畅销</span>';
            if (badge === 'recommend') return '<span class="dish-badge recommend-badge">推荐</span>';
            return '';
        }).join('');
        
        div.innerHTML = `
            <div class="dish-info">
                <div class="dish-name-section">
                    <div class="dish-name-text">${item.name}</div>
                    <div class="dish-badges">${badgesHtml}</div>
                </div>
                <div class="dish-price-text">¥${item.price}</div>
            </div>
            <div class="actions">
                <button class="btn-icon btn-edit" data-category="${category}" data-index="${index}">编辑</button>
                <button class="btn-icon btn-delete" data-category="${category}" data-index="${index}">删除</button>
            </div>
        `;
        container.appendChild(div);
    });
    
    // 更新数量显示
    updateCategoryCount(category, items.length);
    
    // 绑定编辑和删除事件
    container.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            const index = parseInt(btn.dataset.index);
            openModal(category, index);
        });
    });
    
    container.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            const index = parseInt(btn.dataset.index);
            currentMenu[category].splice(index, 1);
            renderDishEditor(category, currentMenu[category]);
        });
    });
}

// 更新分类计数显示
function updateCategoryCount(category, count) {
    const countBadge = document.getElementById(`${category}Count`);
    if (countBadge) {
        countBadge.textContent = count;
        // 根据数量改变样式
        countBadge.className = 'count-badge';
        if (count === 0) {
            countBadge.classList.add('count-empty');
        } else if (count <= getCategoryRecommend(category)) {
            countBadge.classList.add('count-normal');
        } else {
            countBadge.classList.add('count-many');
        }
    }
}

// 获取推荐数量
function getCategoryRecommend(category) {
    const btn = document.querySelector(`[data-category="${category}"]`);
    return btn ? parseInt(btn.dataset.recommend) : 6;
}

// 渲染所有编辑器
function renderAllEditors() {
    // 获取所有分类（默认+自定义）
    const allCategories = getAllCategories();
    
    // 确保currentMenu包含所有分类
    allCategories.forEach(cat => {
        if (!currentMenu[cat.key]) {
            currentMenu[cat.key] = [];
        }
    });
    
    // 清空现有编辑区
    const menuEditor = document.querySelector('.menu-editor');
    menuEditor.innerHTML = '';
    
    // 渲染所有分类
    allCategories.forEach(cat => {
        createCategoryEditor(cat.key, cat.name, cat.recommend || 6);
        renderDishEditor(cat.key, currentMenu[cat.key] || []);
    });
}

// 创建分类编辑器
function createCategoryEditor(categoryKey, categoryName, recommend) {
    const menuEditor = document.querySelector('.menu-editor');
    
    const section = document.createElement('div');
    section.className = 'editor-section';
    section.innerHTML = `
        <h3>${categoryName} <span class="count-badge" id="${categoryKey}Count">0</span></h3>
        <div id="${categoryKey}Editor" class="dishes-list"></div>
        <button class="btn-add" data-category="${categoryKey}" data-recommend="${recommend}">+ 添加${categoryName}</button>
    `;
    
    menuEditor.appendChild(section);
    
    // 为新添加的按钮绑定事件
    const addBtn = section.querySelector('.btn-add');
    addBtn.addEventListener('click', () => {
        const category = addBtn.dataset.category;
        const recommendCount = parseInt(addBtn.dataset.recommend);
        const current = currentMenu[category].length;
        
        if (current >= recommendCount) {
            const confirmed = confirm(`当前已有${current}个菜品，推荐数量为${recommendCount}个。\n继续添加可能导致前台显示过于拥挤。\n\n是否继续添加？`);
            if (!confirmed) return;
        }
        
        openModal(category);
    });
}

// 获取所有分类（默认+自定义）
function getAllCategories() {
    const defaultCategories = [
        { key: 'coldDishes', name: '凉菜', recommend: 2 },
        { key: 'hotDishes', name: '热菜', recommend: 6 },
        { key: 'stapleFood', name: '主食', recommend: 6 },
        { key: 'soup', name: '汤品', recommend: 2 },
        { key: 'fruit', name: '水果', recommend: 2 }
    ];
    
    const custom = getCategoriesFromStorage();
    const customWithRecommend = custom.map(cat => ({
        ...cat,
        recommend: 6  // 自定义分类默认推荐6个
    }));
    
    return [...defaultCategories, ...customWithRecommend];
}

// 添加按钮事件
document.querySelectorAll('.btn-add').forEach(btn => {
    btn.addEventListener('click', () => {
        const category = btn.dataset.category;
        const recommend = parseInt(btn.dataset.recommend);
        const current = currentMenu[category].length;
        
        // 超过推荐数量给予提示，但仍允许添加
        if (current >= recommend) {
            const confirmed = confirm(`当前已有${current}个菜品，推荐数量为${recommend}个。\n继续添加可能导致前台显示过于拥挤。\n\n是否继续添加？`);
            if (!confirmed) return;
        }
        
        openModal(category);
    });
});

// 模态框操作
const modal = document.getElementById('modal');
const closeBtn = document.querySelector('.close');
const cancelBtn = document.getElementById('cancelBtn');
const dishForm = document.getElementById('dishForm');

function openModal(category, index = null) {
    editingCategory = category;
    editingIndex = index;
    
    const modalTitle = document.getElementById('modalTitle');
    const dishName = document.getElementById('dishName');
    const dishPrice = document.getElementById('dishPrice');
    const dishIsHot = document.getElementById('dishIsHot');
    const dishIsRecommend = document.getElementById('dishIsRecommend');
    
    // 重置复选框
    dishIsHot.checked = false;
    dishIsRecommend.checked = false;
    
    if (index !== null) {
        modalTitle.textContent = '编辑菜品';
        const item = currentMenu[category][index];
        dishName.value = item.name;
        dishPrice.value = item.price;
        
        // 恢复个性化标志
        if (item.badges) {
            dishIsHot.checked = item.badges.includes('hot');
            dishIsRecommend.checked = item.badges.includes('recommend');
        }
    } else {
        modalTitle.textContent = '添加菜品';
        dishName.value = '';
        dishPrice.value = '';
    }
    
    modal.classList.add('show');
}

function closeModal() {
    modal.classList.remove('show');
    editingCategory = null;
    editingIndex = null;
}

closeBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);

dishForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('dishName').value;
    const price = document.getElementById('dishPrice').value; // 支持文字价格
    const isHot = document.getElementById('dishIsHot').checked;
    const isRecommend = document.getElementById('dishIsRecommend').checked;
    
    const dish = { 
        name, 
        price,
        badges: []
    };
    
    if (isHot) dish.badges.push('hot');
    if (isRecommend) dish.badges.push('recommend');
    
    if (editingIndex !== null) {
        currentMenu[editingCategory][editingIndex] = dish;
    } else {
        currentMenu[editingCategory].push(dish);
    }
    
    renderDishEditor(editingCategory, currentMenu[editingCategory]);
    closeModal();
});

// 保存当前菜单
document.getElementById('saveCurrentBtn').addEventListener('click', async () => {
    const token = checkAuth();
    if (!token) return;
    
    try {
        const response = await fetch(`${API_BASE}/menu/current`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                menu: currentMenu,
                theme: currentTheme
            })
        });
        
        if (response.ok) {
            alert('保存成功！');
        } else {
            throw new Error('保存失败');
        }
    } catch (error) {
        alert('保存失败: ' + error.message);
    }
});

// 保存为预存菜单
document.getElementById('saveAsPresetBtn').addEventListener('click', async () => {
    const token = checkAuth();
    if (!token) return;
    
    const name = prompt('请输入预存菜单名称:');
    if (!name) return;
    
    try {
        const response = await fetch(`${API_BASE}/menu/presets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name,
                menu: currentMenu,
                theme: currentTheme
            })
        });
        
        if (response.ok) {
            alert('保存成功！');
            loadPresets();
        } else {
            throw new Error('保存失败');
        }
    } catch (error) {
        alert('保存失败: ' + error.message);
    }
});

// 主题选择
document.querySelectorAll('.theme-card').forEach(card => {
    card.addEventListener('click', () => {
        document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        currentTheme = card.dataset.theme;
    });
});

// 应用主题
document.getElementById('saveThemeBtn').addEventListener('click', async () => {
    const token = checkAuth();
    if (!token) return;
    
    try {
        const response = await fetch(`${API_BASE}/menu/theme`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ theme: currentTheme })
        });
        
        if (response.ok) {
            alert('主题已应用！');
        } else {
            throw new Error('应用失败');
        }
    } catch (error) {
        alert('应用失败: ' + error.message);
    }
});

// 预览菜单
document.getElementById('previewBtn').addEventListener('click', () => {
    window.open('../index.html', '_blank');
});

// 加载当前菜单
async function loadCurrentMenu() {
    const token = checkAuth();
    if (!token) return;
    
    try {
        const response = await fetch(`${API_BASE}/menu/current`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            currentMenu = data.menu || currentMenu;
            currentTheme = data.theme || currentTheme;
            currentBackgroundImage = data.backgroundImage || '';
            renderAllEditors();
            
            // 更新主题选择
            document.querySelectorAll('.theme-card').forEach(card => {
                card.classList.toggle('active', card.dataset.theme === currentTheme);
            });
        }
    } catch (error) {
        console.error('加载菜单失败:', error);
    }
}

// 加载预存菜单列表
async function loadPresets() {
    const token = checkAuth();
    if (!token) return;
    
    try {
        const response = await fetch(`${API_BASE}/menu/presets`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const presets = await response.json();
            renderPresets(presets);
        }
    } catch (error) {
        console.error('加载预存菜单失败:', error);
    }
}

// 渲染预存菜单
function renderPresets(presets) {
    const container = document.getElementById('presetsList');
    container.innerHTML = '';
    
    if (presets.length === 0) {
        container.innerHTML = '<p class="no-presets">暂无预存菜单</p>';
        return;
    }
    
    presets.forEach(preset => {
        const card = document.createElement('div');
        card.className = 'preset-card';
        card.innerHTML = `
            <h3>${preset.name}</h3>
            <div class="preset-date">${new Date(preset.created_at).toLocaleDateString()}</div>
            <div class="preset-actions">
                <button class="btn btn-primary btn-sm apply-preset" data-id="${preset.id}">应用</button>
                <button class="btn btn-secondary btn-sm delete-preset" data-id="${preset.id}">删除</button>
            </div>
        `;
        container.appendChild(card);
    });
    
    // 绑定应用按钮事件
    container.querySelectorAll('.apply-preset').forEach(btn => {
        btn.addEventListener('click', () => {
            const presetId = btn.dataset.id;
            applyPreset(presetId);
        });
    });
    
    // 绑定删除按钮事件
    container.querySelectorAll('.delete-preset').forEach(btn => {
        btn.addEventListener('click', () => {
            const presetId = btn.dataset.id;
            deletePresetConfirm(presetId);
        });
    });
}

// Excel相关功能
// 下载Excel模板
document.getElementById('downloadTemplateBtn').addEventListener('click', () => {
    const templateData = [
        ['分类', '菜品名称', '价格', '畅销', '推荐'],
        ['凉菜', '示例：拍黄瓜', '12元', 'TRUE', 'FALSE'],
        ['凉菜', '示例：凉拌木耳', '8元', 'FALSE', 'TRUE'],
        ['热菜', '示例：红烧肉', '时价', 'TRUE', 'TRUE'],
        ['热菜', '示例：糖醋鱼', '22元', 'FALSE', 'FALSE'],
        ['主食', '示例：米饭', '面议', 'FALSE', 'TRUE'],
        ['主食', '示例：面条', '8元', 'TRUE', 'FALSE'],
        ['汤品', '示例：紫菜蛋花汤', '3元', 'FALSE', 'FALSE'],
        ['汤品', '示例：番茄汤', '时价', 'TRUE', 'FALSE'],
        ['水果', '示例：苹果', '5元/斤', 'TRUE', 'FALSE'],
        ['水果', '示例：香蕉', '4元/斤', 'FALSE', 'TRUE']
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '菜单模板');
    
    // 设置列宽
    ws['!cols'] = [{width: 15}, {width: 20}, {width: 10}];
    
    XLSX.writeFile(wb, '菜单模板.xlsx');
});

// 导入Excel
document.getElementById('importExcelBtn').addEventListener('click', () => {
    document.getElementById('excelFileInput').click();
});

document.getElementById('excelFileInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, {header: 1});
            
            // 解析Excel数据
            const menuData = parseExcelData(jsonData);
            
            if (menuData) {
                // 确认导入
                const totalDishes = Object.values(menuData).reduce((sum, arr) => sum + arr.length, 0);
                const confirmed = confirm(`检测到${totalDishes}个菜品，确认导入吗？\n这将替换当前菜单内容。`);
                
                if (confirmed) {
                    currentMenu = menuData;
                    renderAllEditors();
                    alert('导入成功！');
                }
            }
        } catch (error) {
            alert('Excel文件解析失败：' + error.message);
        }
    };
    reader.readAsArrayBuffer(file);
    
    // 清空文件输入
    e.target.value = '';
});

// 解析Excel数据
function parseExcelData(jsonData) {
    const menuData = {};
    
    // 获取自定义分类
    const customCategories = getCategoriesFromStorage();
    
    // 构建分类映射
    const categoryMap = {
        '凉菜': 'coldDishes',
        'coldDishes': 'coldDishes',
        '热菜': 'hotDishes', 
        'hotDishes': 'hotDishes',
        '主食': 'stapleFood',
        'stapleFood': 'stapleFood',
        '汤品': 'soup',
        '汤': 'soup',
        'soup': 'soup',
        '水果': 'fruit',
        'fruit': 'fruit'
    };
    
    // 添加自定义分类映射
    customCategories.forEach(cat => {
        categoryMap[cat.name] = cat.key;
        categoryMap[cat.key] = cat.key;
    });
    
    // 初始化所有分类
    const allCategories = ['coldDishes', 'hotDishes', 'stapleFood', 'soup', 'fruit', ...customCategories.map(c => c.key)];
    allCategories.forEach(key => {
        menuData[key] = [];
    });
    
    // 跳过标题行，从第二行开始处理
    for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length < 3) continue;
        
        const categoryKey = String(row[0] || '').trim();
        const dishName = String(row[1] || '').trim();
        const price = String(row[2] || '').trim(); // 支持文字价格
        const isHot = String(row[3] || '').trim().toUpperCase() === 'TRUE';
        const isRecommend = String(row[4] || '').trim().toUpperCase() === 'TRUE';
        
        if (!categoryKey || !dishName) {
            continue;
        }
        
        const category = categoryMap[categoryKey];
        if (category) {
            const dish = {
                name: dishName,
                price: price,
                badges: []
            };
            
            if (isHot) dish.badges.push('hot');
            if (isRecommend) dish.badges.push('recommend');
            
            menuData[category].push(dish);
        }
    }
    
    return menuData;
}

// 导出Excel
document.getElementById('exportExcelBtn').addEventListener('click', () => {
    const exportData = [
        ['分类', '菜品名称', '价格', '畅销', '推荐']
    ];
    
    // 获取所有分类名称
    const customCategories = getCategoriesFromStorage();
    const categoryNames = {
        coldDishes: '凉菜',
        hotDishes: '热菜', 
        stapleFood: '主食',
        soup: '汤品',
        fruit: '水果'
    };
    
    customCategories.forEach(cat => {
        categoryNames[cat.key] = cat.name;
    });
    
    Object.keys(currentMenu).forEach(category => {
        currentMenu[category].forEach(dish => {
            const badges = dish.badges || [];
            exportData.push([
                categoryNames[category],
                dish.name,
                dish.price,
                badges.includes('hot') ? 'TRUE' : 'FALSE',
                badges.includes('recommend') ? 'TRUE' : 'FALSE'
            ]);
        });
    });
    
    if (exportData.length === 1) {
        alert('当前菜单为空，无法导出！');
        return;
    }
    
    const ws = XLSX.utils.aoa_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '菜单数据');
    
    // 设置列宽
    ws['!cols'] = [{width: 15}, {width: 20}, {width: 10}];
    
    const fileName = `菜单导出_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(wb, fileName);
});

// 创建新预存菜单
document.getElementById('createPresetBtn').addEventListener('click', async () => {
    const name = prompt('请输入预存菜单名称:');
    if (!name) return;
    
    const token = checkAuth();
    if (!token) return;
    
    try {
        const response = await fetch(`${API_BASE}/menu/presets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name,
                menu: currentMenu,
                theme: currentTheme
            })
        });
        
        if (response.ok) {
            alert('预存菜单创建成功！');
            loadPresets(); // 重新加载预存列表
        } else {
            throw new Error('创建失败');
        }
    } catch (error) {
        alert('创建预存菜单失败: ' + error.message);
    }
});

// 应用预存菜单
async function applyPreset(presetId) {
    const token = checkAuth();
    if (!token) return;
    
    try {
        // 获取预存菜单详情
        const response = await fetch(`${API_BASE}/menu/presets`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('获取预存菜单失败');
        
        const presets = await response.json();
        const preset = presets.find(p => p.id == presetId);
        
        if (!preset) {
            throw new Error('预存菜单不存在');
        }
        
        // 确认应用
        const confirmed = confirm(`确定要应用预存菜单"${preset.name}"吗？\n这将替换当前菜单内容。`);
        if (!confirmed) return;
        
        // 应用到当前菜单
        const applyResponse = await fetch(`${API_BASE}/menu/current`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                menu: JSON.parse(preset.menu_data),
                theme: preset.theme
            })
        });
        
        if (applyResponse.ok) {
            alert('预存菜单应用成功！');
            currentMenu = JSON.parse(preset.menu_data);
            currentTheme = preset.theme;
            renderAllEditors();
            
            // 更新主题选择
            document.querySelectorAll('.theme-card').forEach(card => {
                card.classList.toggle('active', card.dataset.theme === currentTheme);
            });
            
            // 切换到当前菜单Tab
            document.querySelector('[data-tab="current"]').click();
        } else {
            throw new Error('应用失败');
        }
    } catch (error) {
        alert('应用预存菜单失败: ' + error.message);
    }
}

// 确认删除预存菜单
function deletePresetConfirm(presetId) {
    const confirmed = confirm('确定要删除这个预存菜单吗？删除后无法恢复。');
    if (!confirmed) return;
    
    deletePreset(presetId);
}

// 删除预存菜单
async function deletePreset(presetId) {
    const token = checkAuth();
    if (!token) return;
    
    try {
        const response = await fetch(`${API_BASE}/menu/presets/${presetId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            alert('预存菜单删除成功！');
            loadPresets(); // 重新加载预存列表
        } else {
            throw new Error('删除失败');
        }
    } catch (error) {
        alert('删除预存菜单失败: ' + error.message);
    }
}

// 背景图片配置功能
// 背景图片输入框实时预览
document.getElementById('backgroundImageUrl').addEventListener('input', (e) => {
    const url = e.target.value.trim();
    const preview = document.getElementById('backgroundPreview');
    const previewImage = document.getElementById('previewImage');
    
    if (url) {
        // 验证URL格式
        try {
            new URL(url);
            previewImage.style.backgroundImage = `url(${url})`;
            preview.style.display = 'block';
        } catch (error) {
            preview.style.display = 'none';
        }
    } else {
        preview.style.display = 'none';
    }
});

// 添加分类按钮
document.getElementById('addCategoryBtn').addEventListener('click', () => {
    openCategoryModal();
});

// 分类表单提交
document.getElementById('categoryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('categoryName').value.trim();
    const key = document.getElementById('categoryKey').value.trim();
    
    if (!name || !key) return;
    
    const token = checkAuth();
    if (!token) return;
    
    try {
        if (editingCategoryIndex !== null) {
            // 编辑模式（暂时只支持本地编辑，数据库不支持更新）
            customCategories[editingCategoryIndex] = { name, key };
            saveCategoriesToStorage();
        } else {
            // 添加模式 - 保存到数据库
            const response = await fetch(`${API_BASE}/categories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, key })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || '添加分类失败');
            }
            
            const result = await response.json();
            customCategories.push({ id: result.id, name, key });
            saveCategoriesToStorage();
        }
        
        renderCategories();
        renderAllEditors();
        closeCategoryModal();
        alert('分类保存成功！');
    } catch (error) {
        alert('保存分类失败: ' + error.message);
    }
});

// 分类模态框关闭按钮
document.getElementById('cancelCategoryBtn').addEventListener('click', closeCategoryModal);
document.querySelector('.close-category').addEventListener('click', closeCategoryModal);

// 保存背景图片设置
document.getElementById('saveBackgroundBtn').addEventListener('click', async () => {
    const token = checkAuth();
    if (!token) return;
    
    const backgroundImageUrl = document.getElementById('backgroundImageUrl').value.trim();
    
    try {
        const response = await fetch(`${API_BASE}/menu/background`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                backgroundImage: backgroundImageUrl 
            })
        });
        
        if (response.ok) {
            currentBackgroundImage = backgroundImageUrl;
            alert('背景图片设置已保存！');
        } else {
            throw new Error('保存失败');
        }
    } catch (error) {
        alert('保存背景设置失败: ' + error.message);
    }
});

// 加载当前背景图片设置
async function loadBackgroundImage() {
    const token = checkAuth();
    if (!token) return;
    
    try {
        const response = await fetch(`${API_BASE}/menu/background`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            currentBackgroundImage = data.backgroundImage || '';
            
            // 更新输入框和预览
            const input = document.getElementById('backgroundImageUrl');
            input.value = currentBackgroundImage;
            
            if (currentBackgroundImage) {
                const preview = document.getElementById('backgroundPreview');
                const previewImage = document.getElementById('previewImage');
                previewImage.style.backgroundImage = `url(${currentBackgroundImage})`;
                preview.style.display = 'block';
            }
        }
    } catch (error) {
        console.error('加载背景图片设置失败:', error);
    }
}

// 分类管理功能
let customCategories = [];
let editingCategoryIndex = null;

// 从数据库加载分类
async function loadCategoriesFromDB() {
    const token = checkAuth();
    if (!token) return [];
    
    try {
        const response = await fetch(`${API_BASE}/categories`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const allCategories = await response.json();
            // 过滤掉默认分类，只保留自定义分类
            const defaultKeys = ['coldDishes', 'hotDishes', 'stapleFood', 'soup', 'fruit'];
            const custom = allCategories.filter(cat => !defaultKeys.includes(cat.key));
            
            // 同步到localStorage
            customCategories = custom;
            saveCategoriesToStorage();
            
            return custom;
        }
    } catch (error) {
        console.error('从数据库加载分类失败:', error);
    }
    
    // 如果加载失败，从localStorage加载
    return getCategoriesFromStorage();
}

// 获取分类（优先从localStorage）
function getCategoriesFromStorage() {
    const stored = localStorage.getItem('custom_categories');
    return stored ? JSON.parse(stored) : customCategories;
}

// 保存分类到localStorage
function saveCategoriesToStorage() {
    localStorage.setItem('custom_categories', JSON.stringify(customCategories));
}

// 渲染分类列表
function renderCategories() {
    const container = document.getElementById('categoriesList');
    container.innerHTML = '';
    
    // 默认分类（只显示，不可编辑删除）
    const defaultCategories = [
        { name: '凉菜', key: 'coldDishes' },
        { name: '热菜', key: 'hotDishes' },
        { name: '主食', key: 'stapleFood' },
        { name: '汤品', key: 'soup' },
        { name: '水果', key: 'fruit' }
    ];
    
    // 渲染默认分类
    defaultCategories.forEach(category => {
        const card = document.createElement('div');
        card.className = 'category-card default-category';
        card.innerHTML = `
            <h4>${category.name}</h4>
            <div class="category-key">${category.key}</div>
            <div class="category-actions">
                <small style="color: #999;">默认分类</small>
            </div>
        `;
        container.appendChild(card);
    });
    
    // 渲染自定义分类
    customCategories.forEach((category, index) => {
        const card = document.createElement('div');
        card.className = 'category-card';
        card.innerHTML = `
            <h4>${category.name}</h4>
            <div class="category-key">${category.key}</div>
            <div class="category-actions">
                <button class="btn btn-primary btn-sm edit-category" data-index="${index}">编辑</button>
                <button class="btn btn-secondary btn-sm delete-category" data-index="${index}">删除</button>
            </div>
        `;
        container.appendChild(card);
    });
    
    // 绑定自定义分类事件
    container.querySelectorAll('.edit-category').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            openCategoryModal(index);
        });
    });
    
    container.querySelectorAll('.delete-category').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            deleteCategory(index);
        });
    });
}

// 打开分类模态框
function openCategoryModal(index = null) {
    editingCategoryIndex = index;
    
    const modalTitle = document.getElementById('categoryModalTitle');
    const categoryName = document.getElementById('categoryName');
    const categoryKey = document.getElementById('categoryKey');
    
    if (index !== null) {
        const category = customCategories[index];
        modalTitle.textContent = '编辑分类';
        categoryName.value = category.name;
        categoryKey.value = category.key;
    } else {
        modalTitle.textContent = '添加分类';
        categoryName.value = '';
        categoryKey.value = '';
    }
    
    document.getElementById('categoryModal').classList.add('show');
}

// 关闭分类模态框
function closeCategoryModal() {
    document.getElementById('categoryModal').classList.remove('show');
    editingCategoryIndex = null;
}

// 删除分类
async function deleteCategory(index) {
    const category = customCategories[index];
    const confirmed = confirm(`确定要删除分类\"${category.name}\"吗？相关菜品也会被删除。`);
    if (!confirmed) return;
    
    const token = checkAuth();
    if (!token) return;
    
    try {
        // 如果有ID，从数据库删除
        if (category.id) {
            const response = await fetch(`${API_BASE}/categories/${category.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || '删除分类失败');
            }
        }
        
        // 从本地删除
        customCategories.splice(index, 1);
        saveCategoriesToStorage();
        renderCategories();
        
        // 同时删除该分类下的菜品
        delete currentMenu[category.key];
        
        // 重新渲染所有编辑器
        renderAllEditors();
        
        alert('分类删除成功！');
    } catch (error) {
        alert('删除分类失败: ' + error.message);
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
    checkAuth();
    
    // 先加载分类（需要等待，因为其他功能依赖分类）
    customCategories = await loadCategoriesFromDB();
    renderCategories();
    
    // 然后加载其他数据
    loadCurrentMenu();
    loadPresets();
    loadBackgroundImage();
});
