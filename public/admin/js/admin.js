const API_BASE = '/api';
let currentMenu = {
    coldDishes: [],
    hotDishes: [],
    stapleFood: [],
    soup: [],
    fruit: []
};
let currentTheme = 'winter';
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

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadCurrentMenu();
    loadPresets();
});
