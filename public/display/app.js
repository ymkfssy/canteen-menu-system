// 食堂菜单展示系统 - 前台JavaScript - 升级版
class CanteenDisplay {
    constructor() {
        this.menuData = null;
        this.lastUpdateTime = null;
        this.retryCount = 0;
        this.maxRetries = 3;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDateTime();
        this.loadAllData();
        this.startAutoRefresh();
    }

    setupEventListeners() {
        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
                e.preventDefault();
                this.loadAllData();
            } else if (e.key === 'r' || e.key === 'R') {
                this.loadAllData();
            }
        });

        // 页面可见性变化时刷新数据
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.loadAllData();
            }
        });
    }

    async loadAllData() {
        this.setStatus('loading');
        
        try {
            await Promise.all([
                this.loadThemeSettings(),
                this.loadBackgroundSettings(),
                this.loadMenuData()
            ]);
            this.setStatus('online');
            this.retryCount = 0;
        } catch (error) {
            console.error('加载数据失败:', error);
            this.handleLoadError(error);
        }
    }

    async loadMenuData() {
        try {
            const response = await fetch('/api/menu-items');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const result = await response.json();
            
            if (result.success) {
                const previousData = this.menuData;
                this.menuData = result.data;
                this.lastUpdateTime = new Date();
                this.renderMenu(this.menuData, previousData);
                this.updateRefreshInfo();
            } else {
                throw new Error(result.error || '加载菜单数据失败');
            }
        } catch (error) {
            throw new Error(`菜单数据: ${error.message}`);
        }
    }

    async loadThemeSettings() {
        try {
            const response = await fetch('/api/themes');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const result = await response.json();
            
            if (result.success && result.data.current) {
                this.applyTheme(result.data.current);
            }
        } catch (error) {
            console.error('加载主题设置失败:', error);
        }
    }

    async loadBackgroundSettings() {
        try {
            const response = await fetch('/api/background');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const result = await response.json();
            
            if (result.success && result.data) {
                document.body.style.setProperty('--bg-image', `url(${result.data.image_data})`);
            } else {
                document.body.style.setProperty('--bg-image', 'none');
            }
        } catch (error) {
            console.error('加载背景设置失败:', error);
        }
    }

    applyTheme(theme) {
        document.body.className = `theme-${theme.theme_name}`;
    }

    renderMenu(menuData, previousData = null) {
        const menuContent = document.getElementById('menuContent');
        
        // 隐藏加载动画
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }

        // 清除错误信息
        const errorElement = menuContent.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }

        // 创建菜单结构
        menuContent.innerHTML = this.createMenuStructure();
        
        // 按分类分组
        const categorized = {};
        menuData.forEach(item => {
            if (!categorized[item.category]) {
                categorized[item.category] = [];
            }
            categorized[item.category].push(item);
        });

        // 渲染每个分类
        Object.keys(categorized).forEach(category => {
            const containerId = this.getContainerId(category);
            const container = document.getElementById(containerId);
            
            if (container) {
                categorized[category].forEach(dish => {
                    const isNew = previousData && 
                        !previousData.find(d => d.id === dish.id && d.name === dish.name);
                    const dishElement = this.createDishElement(dish, isNew);
                    container.appendChild(dishElement);
                });
            }
        });
    }

    createMenuStructure() {
        return `
            <div class="menu-section cold-dishes">
                <div class="section-title">凉菜</div>
                <div class="dishes" id="cold-dishes-list"></div>
            </div>
            
            <div class="menu-section hot-dishes">
                <div class="section-title">热菜</div>
                <div class="dishes" id="hot-dishes-list"></div>
            </div>
            
            <div class="menu-section staple-food">
                <div class="section-title">主食</div>
                <div class="dishes" id="staple-food-list"></div>
            </div>
            
            <div class="menu-section soup">
                <div class="section-title">汤品</div>
                <div class="dishes" id="soup-list"></div>
            </div>
            
            <div class="menu-section fruit">
                <div class="section-title">水果</div>
                <div class="dishes" id="fruit-list"></div>
            </div>
        `;
    }

    getContainerId(category) {
        const mapping = {
            '凉菜': 'cold-dishes-list',
            '热菜': 'hot-dishes-list',
            '主食': 'staple-food-list',
            '汤品': 'soup-list',
            '水果': 'fruit-list'
        };
        return mapping[category] || '';
    }

    createDishElement(dish, isNew = false) {
        const dishItem = document.createElement('div');
        dishItem.className = `dish-item ${isNew ? 'new-item' : ''}`;
        dishItem.setAttribute('data-id', dish.id);
        
        const dishName = document.createElement('span');
        dishName.className = 'dish-name';
        dishName.textContent = dish.name;
        
        const dishPrice = document.createElement('span');
        dishPrice.className = 'dish-price';
        dishPrice.textContent = `¥${dish.price}`;
        
        dishItem.appendChild(dishName);
        dishItem.appendChild(dishPrice);
        
        if (dish.tag) {
            const tag = document.createElement('span');
            tag.className = 'special-tag';
            tag.textContent = dish.tag;
            dishItem.appendChild(tag);
        }
        
        return dishItem;
    }

    updateDateTime() {
        const update = () => {
            const now = new Date();
            const options = { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            };
            document.getElementById('datetime').textContent = 
                now.toLocaleDateString('zh-CN', options);
        };
        
        update();
        setInterval(update, 1000);
    }

    updateRefreshInfo() {
        if (this.lastUpdateTime) {
            const timeString = this.lastUpdateTime.toLocaleTimeString('zh-CN');
            document.getElementById('lastUpdate').textContent = timeString;
        }
    }

    setStatus(status) {
        const indicator = document.getElementById('statusIndicator');
        const dot = indicator.querySelector('.status-dot');
        const text = indicator.querySelector('.status-text');
        
        dot.className = 'status-dot';
        text.textContent = this.getStatusText(status);
        
        switch (status) {
            case 'online':
                dot.classList.add('online');
                break;
            case 'offline':
                dot.classList.add('offline');
                break;
            case 'loading':
                dot.classList.add('loading');
                break;
        }
    }

    getStatusText(status) {
        const statusMap = {
            online: '在线',
            offline: '离线',
            loading: '连接中...'
        };
        return statusMap[status] || '未知';
    }

    handleLoadError(error) {
        this.retryCount++;
        
        if (this.retryCount >= this.maxRetries) {
            this.setStatus('offline');
            this.showErrorMessage('网络连接失败，请检查网络连接');
        } else {
            this.setStatus('loading');
            // 5秒后重试
            setTimeout(() => this.loadAllData(), 5000);
        }
    }

    showErrorMessage(message) {
        const menuContent = document.getElementById('menuContent');
        menuContent.innerHTML = `
            <div class="error-message">
                <div>${message}</div>
                <button class="retry-button" onclick="canteenDisplay.loadAllData()">重试</button>
            </div>
        `;
    }

    startAutoRefresh() {
        // 每30秒刷新一次数据
        setInterval(() => {
            if (document.visibilityState === 'visible') {
                this.loadAllData();
            }
        }, 30000);
    }
}

// 初始化应用
const canteenDisplay = new CanteenDisplay();
