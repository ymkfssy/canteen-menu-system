class CanteenAPI {
  constructor() {
    this.baseURL = '/api';
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      console.log(`API请求: ${options.method || 'GET'} ${url}`);
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      };
      
      // 如果是POST/PUT请求，确保body是JSON字符串
      if (options.body && typeof options.body !== 'string') {
        config.body = JSON.stringify(options.body);
      }
      
      const response = await fetch(url, config);
      console.log(`API响应: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        let errorText;
        try {
          const errorData = await response.json();
          errorText = errorData.error || errorData.detail || `HTTP错误: ${response.status}`;
          console.error('API错误详情:', errorData);
        } catch {
          errorText = await response.text() || `HTTP错误: ${response.status}`;
        }
        
        const error = new Error(errorText);
        error.status = response.status;
        throw error;
      }

      const data = await response.json();
      console.log('API响应数据:', data);
      return data;
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
