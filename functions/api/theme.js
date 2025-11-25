// 获取主题
export async function onRequestGet(context) {
  const { env } = context;
  
  try {
    // 如果没有数据库连接，返回模拟数据
    if (!env.DB) {
      console.log('使用模拟主题数据');
      return getMockThemeData();
    }
    
    const themes = await env.DB.prepare(
      "SELECT * FROM themes"
    ).all();
    
    const activeTheme = themes.results.find(theme => theme.is_active) || themes.results[0];
    
    return new Response(JSON.stringify({
      themes: themes.results,
      activeTheme: activeTheme.name
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  } catch (error) {
    console.error('获取主题错误:', error);
    // 出错时返回模拟数据
    return getMockThemeData();
  }
}

// 设置主题
export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const { theme } = await request.json();
    
    // 如果没有数据库连接，返回成功但不保存
    if (!env.DB) {
      console.log('模拟设置主题:', theme);
      return new Response(JSON.stringify({ 
        success: true,
        message: '主题已应用（模拟模式）'
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }
    
    // 重置所有主题为非活跃
    await env.DB.prepare("UPDATE themes SET is_active = FALSE").run();
    
    // 设置选定主题为活跃
    await env.DB.prepare(
      "UPDATE themes SET is_active = TRUE WHERE name = ?"
    ).bind(theme).run();
    
    return new Response(JSON.stringify({ 
      success: true,
      message: '主题已应用'
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  } catch (error) {
    console.error('更新主题错误:', error);
    return new Response(JSON.stringify({ 
      error: '更新主题失败: ' + error.message 
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }
}

// 处理预检请求
export async function onRequestOptions(context) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

// 模拟主题数据
function getMockThemeData() {
  const mockData = {
    themes: [
      { id: 1, name: 'spring', is_active: true, config: '{}' },
      { id: 2, name: 'summer', is_active: false, config: '{}' },
      { id: 3, name: 'autumn', is_active: false, config: '{}' },
      { id: 4, name: 'winter', is_active: false, config: '{}' }
    ],
    activeTheme: 'spring'
  };
  
  return new Response(JSON.stringify(mockData), {
    status: 200,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
