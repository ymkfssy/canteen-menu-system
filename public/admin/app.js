// 食堂菜单管理系统 - 后台JavaScript - 升级版
class CanteenAdmin {
    constructor() {
        this.menuItems = [];
        this.currentTheme = 'spring';
        this.actionLogs = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadMenuData();
        this.loadSystemInfo();
        this.loadActionLogs();
    }

    setupEventListeners() {
        // 标签页切换
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Excel模板下载
        document.getElementById('download-template').addEventListener('click', () => {
            this.downloadTemplate();
        });

        // 文件上传
        document.getElementById('excel-file').addEventListener('change', (e) => {
            this.handleFileSelect(e);
        });

        // 数据上传
        document.getElementById('upload-data').addEventListener('click', () => {
            this.uploadExcelData();
        });

        // 数据预览
        document.getElementById('preview-data').addEventListener('click', () => {
            this.previewData();
        });

        // 数据重置
        document.getElementById('reset-data').addEventListener('click', () => {
            this.resetToDefault();
        });

        // 添加菜品
        document.getElementById('add-dish').addEventListener('click', () => {
            this.showDishModal();
        });

        // 主题选择
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.selectTheme(e.currentTarget.dataset.theme);
            });
        });

        // 背景图片上传
        document.getElementById('bg-image-file').addEventListener('change', (e) => {
            this.handleBgImageSelect(e);
        });

        // 背景保存和清除
        document.getElementById('save-bg-image').addEventListener('click', () => {
            this.saveBackgroundImage();
        });

        document.getElementById('clear-bg-image').addEventListener('click', () => {
            this.clearBackgroundImage();
        });

        // 模态框事件
        document.getElementById('cancel-dish').addEventListener('click', () => {
            this.hideDishModal();
        });

        document.querySelector('.close-modal').addEventListener('click', () => {
            this.hideDishModal();
        });

        document.getElementById('dish-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveDish();
        });

        // 确认上传和取消预览
        document.getElementById('confirm-upload').addEventListener('click', () => {
            this.confirmUpload();
        });

        document.getElementById('cancel-preview').addEventListener('click', () => {
            this.hidePreview();
        });
    }

    switchTab(tabName) {
        // 更新活跃标签
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(tabName).classList.add('active');

        this.addActionLog(`切换到${this.getTabName(tabName)}`);
    }

    getTabName(tabKey) {
        const tabNames = {
            'menu-management': '菜单管理',
            'theme-settings': '主题设置',
            'background-settings': '背景设置',
            'system-info': '系统信息'
        };
        return tabNames[tabKey] || tabKey;
    }

    async loadMenuData() {
        try {
            const response = await fetch('/api/menu-items');
            const result = await response.json();
            
            if (result.success) {
                this.menuItems = result.data;
                this.renderMenuItems();
                this.updateSystemInfo();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            this.showMessage('加载菜单数据失败: ' + error.message, 'error');
        }
    }

    renderMenuItems() {
        const container = document.getElementById('menu-items-list');
        
        if (this.menuItems.length === 0) {
            container.innerHTML = '<div class="no-data">暂无菜单数据</div>';
            return;
        }

        container.innerHTML = this.menuItems.map(item => `
            <div class="menu-item" data-id="${item.id}">
                <div class="menu-item-info">
                    <span class="menu-item-category">${item.category}</span>
                    <span class="dish-name">${item.name}</span>
                    <span class="dish-price">¥${item.price}</span>
                    ${item.tag ? `<span class="tag">${item.tag}</span>` : ''}
                </div>
                <div class="menu-item-actions">
                    <button class="btn btn-edit btn-small" onclick="canteenAdmin.editDish(${item.id})">编辑</button>
                    <button class="btn btn-delete btn-small" onclick="canteenAdmin.deleteDish(${item.id})">删除</button>
                </div>
            </div>
        `).join('');
    }

    downloadTemplate() {
        try {
            if (typeof XLSX === 'undefined') {
                this.showMessage('Excel 库加载失败，请刷新页面重试', 'error');
                return;
            }

            const templateData = [
                { '类别': '凉菜', '菜品名称': '凉拌黄瓜', '价格': 8, '标签': '' },
                { '类别': '凉菜', '菜品名称': '麻辣口水鸡', '价格': 15, '标签': '招牌' },
                { '类别': '热菜', '菜品名称': '红烧狮子头', '价格': 18, '标签': '推荐' },
                { '类别': '热菜', '菜品名称': '宫保鸡丁', '价格': 16, '标签': '' },
                { '类别': '热菜', '菜品名称': '鱼香肉丝', '价格': 16, '标签': '' },
                { '类别': '热菜', '菜品名称': '麻婆豆腐', '价格': 12, '标签': '' },
                { '类别': '热菜', '菜品名称': '酸辣土豆丝', '价格': 10, '标签': '推荐' },
                { '类别': '热菜', '菜品名称': '清炒时蔬', '价格': 10, '标签': '' },
                { '类别': '主食', '菜品名称': '米饭', '价格': 2, '标签': '' },
                { '类别': '主食', '菜品名称': '馒头', '价格': 1, '标签': '' },
                { '类别': '主食', '菜品名称': '葱油饼', '价格': 5, '标签': '' },
                { '类别': '主食', '菜品名称': '水饺(10个)', '价格': 12, '标签': '' },
                { '类别': '主食', '菜品名称': '牛肉面', '价格': 15, '标签': '热销' },
                { '类别': '主食', '菜品名称': '炒饭', '价格': 10, '标签': '' },
                { '类别': '汤品', '菜品名称': '西红柿蛋汤', '价格': 5, '标签': '' },
                { '类别': '汤品', '菜品名称': '紫菜蛋花汤', '价格': 5, '标签': '' },
                { '类别': '水果', '菜品名称': '时令水果拼盘', '价格': 8, '标签': '' }
            ];

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(templateData);
            
            // 设置列宽
            const colWidths = [
                { wch: 10 },
                { wch: 20 },
                { wch: 10 },
                { wch: 10 }
            ];
            ws['!cols'] = colWidths;
            
            XLSX.utils.book_append_sheet(wb, ws, "菜单数据");
            XLSX.writeFile(wb, "食堂菜单模板.xlsx");
            
            this.showMessage('Excel 模板下载成功！', 'success');
            this.addActionLog('下载Excel模板');
        } catch (error) {
            console.error('生成 Excel 文件时出错:', error);
            this.showMessage('生成 Excel 文件失败: ' + error.message, 'error');
        }
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        const fileInfo = document.getElementById('file-info');
        fileInfo.innerHTML = `
            <strong>已选择文件:</strong> ${file.name}<br>
            <strong>文件大小:</strong> ${(file.size / 1024).toFixed(2)} KB<br>
            <strong>文件类型:</strong> ${file.type || '未知'}
        `;

        this.addActionLog(`选择文件: ${file.name}`);
    }

    async uploadExcelData() {
        const fileInput = document.getElementById('excel-file');
        const file = fileInput.files[0];
        
        if (!file) {
            this.showMessage('请先选择Excel文件', 'error');
            return;
        }

        try {
            this.showMessage('正在上传文件...', 'success');
            
            const data = await this.parseExcelFile(file);
            this.previewData(data);
            
        } catch (error) {
            this.showMessage('文件解析失败: ' + error.message, 'error');
        }
    }

    parseExcelFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet);
                    
                    resolve(jsonData);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('文件读取失败'));
            reader.readAsArrayBuffer(file);
        });
    }

    previewData(data = null) {
        if (!data) {
            const fileInput = document.getElementById('excel-file');
            const file = fileInput.files[0];
            
            if (!file) {
                this.showMessage('请先选择Excel文件', 'error');
                return;
            }
            
            this.parseExcelFile(file).then(data => this.previewData(data));
            return;
        }

        const previewContent = document.getElementById('preview-content');
        const categorized = {};

        // 数据验证和分类
        data.forEach(item => {
            const category = item['类别'] || '未分类';
            if (!categorized[category]) {
                categorized[category] = [];
            }
            
            categorized[category].push({
                name: item['菜品名称'] || '未知菜品',
                price: item['价格'] || 0,
                tag: item['标签'] || ''
            });
        });

        previewContent.innerHTML = Object.keys(categorized).map(category => `
            <div class="preview-section">
                <div class="preview-section-title">${category}</div>
                <div class="dish-list">
                    ${categorized[category].map(dish => `
                        <div class="dish-item">
                            <span class="dish-name">${dish.name}</span>
                            <span class="dish-price">¥${dish.price}</span>
                            ${dish.tag ? `<span class="tag">${dish.tag}</span>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');

        document.getElementById('data-preview').style.display = 'block';
        this.addActionLog('预览Excel数据');
    }

    hidePreview() {
        document.getElementById('data-preview').style.display = 'none';
    }

    async confirmUpload() {
        const fileInput = document.getElementById('excel-file');
        const file = fileInput.files[0];
        
        if (!file) {
            this.showMessage('请先选择Excel文件', 'error');
            return;
        }

        try {
            this.showMessage('正在更新菜单数据...', 'success');
            
            const data = await this.parseExcelFile(file);
            await this.updateMenuData(data);
            
            this.hidePreview();
            fileInput.value = '';
            document.getElementById('file-info').innerHTML = '';
            
        } catch (error) {
            this.showMessage('数据更新失败: ' + error.message, 'error');
        }
    }

    async updateMenuData(data) {
        // 先清空现有数据
        const clearResponse = await fetch('/api/menu-items', {
            method: 'DELETE'
        });

        if (!clearResponse.ok) {
            throw new Error('清空现有数据失败');
        }

        // 批量添加新数据
        for (const item of data) {
            const menuItem = {
                category: item['类别'],
                name: item['菜品名称'],
                price: parseFloat(item['价格']),
                tag: item['标签'] || ''
            };

            const response = await fetch('/api/menu-items', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(menuItem)
            });

            if (!response.ok) {
                throw new Error(`添加菜品 ${menuItem.name} 失败`);
            }
        }

        this.showMessage('菜单数据更新成功！', 'success');
        this.addActionLog('通过Excel更新菜单数据');
        this.loadMenuData();
    }

    async resetToDefault() {
        if (!confirm('确定要重置为默认菜单数据吗？这将清除所有现有数据。')) {
            return;
        }

        try {
            const response = await fetch('/api/menu-items/reset', {
                method: 'POST'
            });

            if (response.ok) {
                this.showMessage('已重置为默认菜单数据', 'success');
                this.addActionLog('重置菜单数据');
                this.loadMenuData();
            } else {
                throw new Error('重置失败');
            }
        } catch (error) {
            this.showMessage('重置失败: ' + error.message, 'error');
        }
    }

    showDishModal(dish = null) {
        const modal = document.getElementById('dish-modal');
        const form = document.getElementById('dish-form');
        const title = document.getElementById('modal-title');
        
        if (dish) {
            title.textContent = '编辑菜品';
            document.getElementById('dish-id').value = dish.id;
            document.getElementById('dish-category').value = dish.category;
            document.getElementById('dish-name').value = dish.name;
            document.getElementById('dish-price').value = dish.price;
            document.getElementById('dish-tag').value = dish.tag || '';
        } else {
            title.textContent = '添加菜品';
            form.reset();
            document.getElementById('dish-id').value = '';
        }
        
        modal.style.display = 'block';
    }

    hideDishModal() {
        document.getElementById('dish-modal').style.display = 'none';
    }

    async saveDish() {
        const form = document.getElementById('dish-form');
        const formData = new FormData(form);
        
        const dishData = {
            category: document.getElementById('dish-category').value,
            name: document.getElementById('dish-name').value,
            price: parseFloat(document.getElementById('dish-price').value),
            tag: document.getElementById('dish-tag').value
        };

        const dishId = document.getElementById('dish-id').value;

        try {
            let response;
            if (dishId) {
                // 更新现有菜品
                response = await fetch(`/api/menu-items/${dishId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dishData)
                });
            } else {
                // 添加新菜品
                response = await fetch('/api/menu-items', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dishData)
                });
            }

            if (response.ok) {
                this.showMessage(`菜品${dishId ? '更新' : '添加'}成功！`, 'success');
                this.addActionLog(`${dishId ? '更新' : '添加'}菜品: ${dishData.name}`);
                this.hideDishModal();
                this.loadMenuData();
            } else {
                throw new Error('保存失败');
            }
        } catch (error) {
            this.showMessage(`菜品${dishId ? '更新' : '添加'}失败: ` + error.message, 'error');
        }
    }

    editDish(id) {
        const dish = this.menuItems.find(item => item.id == id);
        if (dish) {
            this.showDishModal(dish);
        }
    }

    async deleteDish(id) {
        const dish = this.menuItems.find(item => item.id == id);
        if (!dish) return;

        if (!confirm(`确定要删除菜品 "${dish.name}" 吗？`)) {
            return;
        }

        try {
            const response = await fetch(`/api/menu-items/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showMessage('菜品删除成功！', 'success');
                this.addActionLog(`删除菜品: ${dish.name}`);
                this.loadMenuData();
            } else {
                throw new Error('删除失败');
            }
        } catch (error) {
            this.showMessage('删除失败: ' + error.message, 'error');
        }
    }

    selectTheme(themeName) {
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('active');
        });
        
        document.querySelector(`[data-theme="${themeName}"]`).classList.add('active');
        
        fetch('/api/themes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ themeName })
        }).then(response => {
            if (response.ok) {
                this.showMessage(`已切换到${this.getThemeName(themeName)}`, 'success');
                this.addActionLog(`切换主题: ${this.getThemeName(themeName)}`);
                this.currentTheme = themeName;
            }
        });
    }

    getThemeName(themeKey) {
        const themeNames = {
            'spring': '春季主题',
            'summer': '夏季主题',
            'autumn': '秋季主题',
            'winter': '冬季主题'
        };
        return themeNames[themeKey] || themeKey;
    }

    handleBgImageSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        // 验证文件类型
        if (!file.type.startsWith('image/')) {
            this.showMessage('请选择图片文件', 'error');
            return;
        }

        // 验证文件大小 (2MB)
        if (file.size > 2 * 1024 * 1024) {
            this.showMessage('图片文件大小不能超过2MB', 'error');
            return;
        }

        const fileInfo = document.getElementById('bg-file-info');
        const preview = document.getElementById('bg-preview');
        
        fileInfo.innerHTML = `
            <strong>已选择图片:</strong> ${file.name}<br>
            <strong>文件大小:</strong> ${(file.size / 1024).toFixed(2)} KB
        `;

        const reader = new FileReader();
        reader.onload = (e) => {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);

        this.addActionLog(`选择背景图片: ${file.name}`);
    }

    async saveBackgroundImage() {
        const fileInput = document.getElementById('bg-image-file');
        const file = fileInput.files[0];
        
        if (!file) {
            this.showMessage('请先选择背景图片', 'error');
            return;
        }

        try {
            const imageData = await this.fileToBase64(file);
            
            const response = await fetch('/api/background', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ imageData })
            });

            if (response.ok) {
                this.showMessage('背景图片保存成功！', 'success');
                this.addActionLog('更新背景图片');
                fileInput.value = '';
                document.getElementById('bg-file-info').innerHTML = '';
            } else {
                throw new Error('保存失败');
            }
        } catch (error) {
            this.showMessage('背景图片保存失败: ' + error.message, 'error');
        }
    }

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }

    async clearBackgroundImage() {
        try {
            const response = await fetch('/api/background', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ imageData: null })
            });

            if (response.ok) {
                this.showMessage('背景图片已清除', 'success');
                this.addActionLog('清除背景图片');
                document.getElementById('bg-preview').style.display = 'none';
                document.getElementById('bg-image-file').value = '';
                document.getElementById('bg-file-info').innerHTML = '';
            } else {
                throw new Error('清除失败');
            }
        } catch (error) {
            this.showMessage('清除背景图片失败: ' + error.message, 'error');
        }
    }

async loadSystemInfo() {
  try {
    // 只检查核心的菜单项API
    const menuResponse = await fetch('/api/menu-items');
    
    if (menuResponse.ok) {
      const menuResult = await menuResponse.json();
      document.getElementById('db-status').textContent = '正常';
      document.getElementById('menu-items-count').textContent = 
        menuResult.success ? menuResult.data.length : '未知';
    } else {
      throw new Error('菜单数据加载失败');
    }

    // 主题和背景信息不是关键，不阻塞主要状态显示
    try {
      const [themeResponse, bgResponse] = await Promise.all([
        fetch('/api/themes'),
        fetch('/api/background')
      ]);

      const themeResult = await themeResponse.json();
      const bgResult = await bgResponse.json();

      if (themeResult.success && themeResult.data.current) {
        this.currentTheme = themeResult.data.current.theme_name;
        document.querySelectorAll('.theme-option').forEach(option => {
          option.classList.remove('active');
        });
        const activeOption = document.querySelector(`[data-theme="${this.currentTheme}"]`);
        if (activeOption) {
          activeOption.classList.add('active');
        }
      }
    } catch (secondaryError) {
      console.warn('加载主题或背景信息时出错:', secondaryError);
      // 不将次要错误视为数据库异常
    }

  } catch (error) {
    document.getElementById('db-status').textContent = '异常';
    document.getElementById('menu-items-count').textContent = '未知';
    console.error('加载系统信息失败:', error);
  }
}

    updateSystemInfo() {
        document.getElementById('menu-items-count').textContent = this.menuItems.length;
        document.getElementById('last-data-update').textContent = new Date().toLocaleString('zh-CN');
    }

    addActionLog(action) {
        const log = {
            time: new Date().toLocaleString('zh-CN'),
            action: action
        };
        
        this.actionLogs.unshift(log);
        
        // 只保留最近50条记录
        if (this.actionLogs.length > 50) {
            this.actionLogs = this.actionLogs.slice(0, 50);
        }
        
        this.renderActionLogs();
    }

    renderActionLogs() {
        const container = document.getElementById('action-logs');
        
        container.innerHTML = this.actionLogs.map(log => `
            <div class="log-entry">
                <span class="log-time">[${log.time}]</span>
                <span class="log-action">${log.action}</span>
            </div>
        `).join('');
    }

    loadActionLogs() {
        const savedLogs = localStorage.getItem('canteenAdminLogs');
        if (savedLogs) {
            this.actionLogs = JSON.parse(savedLogs);
            this.renderActionLogs();
        }
    }

    showMessage(text, type) {
        const messageEl = document.getElementById('message');
        messageEl.textContent = text;
        messageEl.className = `message ${type}`;
        messageEl.style.display = 'block';

        // 3秒后自动隐藏
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 3000);
    }
}

// 初始化应用
const canteenAdmin = new CanteenAdmin();

// 保存操作日志到本地存储
window.addEventListener('beforeunload', () => {
    localStorage.setItem('canteenAdminLogs', JSON.stringify(canteenAdmin.actionLogs));
});
