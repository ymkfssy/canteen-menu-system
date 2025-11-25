class CanteenAPI {
  constructor() {
    this.baseURL = '/api';
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      };
      
      // 如果是POST请求，确保body是JSON字符串
      if (options.body && typeof options.body !== 'string') {
        config.body = JSON.stringify(options.body);
      }
      
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || `HTTP错误: ${response.status}` };
        }
        throw new Error(errorData.error || errorData.detail || `API请求失败: ${response.status}`);
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
      body: { username, password }
    });
  }

  // 菜单相关
  async getMenu() {
    return this.request('/menu');
  }

  async saveMenu(menuData) {
    return this.request('/menu', {
      method: 'POST',
      body: menuData
    });
  }

  // 主题相关
  async getThemes() {
    return this.request('/theme');
  }

  async setTheme(theme) {
    return this.request('/theme', {
      method: 'POST',
      body: { theme }
    });
  }
}

// 创建全局API实例
window.canteenAPI = new CanteenAPI();
