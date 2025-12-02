const API_BASE = '/api';
let currentMenu = {
    coldDishes: [],
    hotDishes: [],
    stapleFood: [],
    soup: [],
    fruit: []
};
let currentTheme = 'prosperity';
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
        div.innerHTML = `
            <div class="dish-info">
                <div class="dish-name-text">${item.name}</div>
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
    Object.keys(currentMenu).forEach(category => {
        renderDishEditor(category, currentMenu[category]);
    });
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
    
    if (index !== null) {
        modalTitle.textContent = '编辑菜品';
        const item = currentMenu[category][index];
        dishName.value = item.name;
        dishPrice.value = item.price;
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
    const price = parseFloat(document.getElementById('dishPrice').value);
    
    if (editingIndex !== null) {
        currentMenu[editingCategory][editingIndex] = { name, price };
    } else {
        currentMenu[editingCategory].push({ name, price });
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
    
    presets.forEach(preset => {
        const card = document.createElement('div');
        card.className = 'preset-card';
        card.innerHTML = `
            <h3>${preset.name}</h3>
            <div class="preset-date">${new Date(preset.created_at).toLocaleDateString()}</div>
            <div class="preset-actions">
                <button class="btn btn-primary btn-sm" data-id="${preset.id}">应用</button>
                <button class="btn btn-secondary btn-sm" data-id="${preset.id}">删除</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// Excel相关功能
// 下载Excel模板
document.getElementById('downloadTemplateBtn').addEventListener('click', () => {
    const templateData = [
        ['分类', '菜品名称', '价格'],
        ['凉菜', '示例：拍黄瓜', 5],
        ['凉菜', '示例：凉拌木耳', 6],
        ['热菜', '示例：红烧肉', 18],
        ['热菜', '示例：糖醋鱼', 22],
        ['主食', '示例：米饭', 2],
        ['主食', '示例：面条', 8],
        ['汤品', '示例：紫菜蛋花汤', 3],
        ['汤品', '示例：番茄汤', 3],
        ['水果', '示例：苹果', 5],
        ['水果', '示例：香蕉', 4]
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
    const menuData = {
        coldDishes: [],
        hotDishes: [],
        stapleFood: [],
        soup: [],
        fruit: []
    };
    
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
    
    // 跳过标题行，从第二行开始处理
    for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length < 3) continue;
        
        const categoryKey = String(row[0] || '').trim();
        const dishName = String(row[1] || '').trim();
        const price = parseFloat(row[2]);
        
        if (!categoryKey || !dishName || isNaN(price) || price <= 0) {
            continue;
        }
        
        const category = categoryMap[categoryKey];
        if (category) {
            menuData[category].push({
                name: dishName,
                price: price
            });
        }
    }
    
    return menuData;
}

// 导出Excel
document.getElementById('exportExcelBtn').addEventListener('click', () => {
    const exportData = [
        ['分类', '菜品名称', '价格']
    ];
    
    // 按分类添加菜品
    const categoryNames = {
        coldDishes: '凉菜',
        hotDishes: '热菜', 
        stapleFood: '主食',
        soup: '汤品',
        fruit: '水果'
    };
    
    Object.keys(currentMenu).forEach(category => {
        currentMenu[category].forEach(dish => {
            exportData.push([
                categoryNames[category],
                dish.name,
                dish.price
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

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadCurrentMenu();
    loadPresets();
});
