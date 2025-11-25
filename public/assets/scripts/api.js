class CanteenAPI {
  constructor() {
    this.baseURL = '/api';
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('API请求错误:', error);
      throw error;
    }
  }

  // 认证相关
  async login(username, password) {
    return this.request('/auth', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  }

  // 菜单相关
  async getMenu() {
    return this.request('/menu');
  }

  async saveMenu(menuData) {
    return this.request('/menu', {
      method: 'POST',
      body: JSON.stringify(menuData)
    });
  }

  // 主题相关
  async getThemes() {
    return this.request('/theme');
  }

  async setTheme(theme) {
    return this.request('/theme', {
      method: 'POST',
      body: JSON.stringify({ theme })
    });
  }
}

// 创建全局API实例
window.canteenAPI = new CanteenAPI();
