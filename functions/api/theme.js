// 处理所有HTTP方法
export async function onRequest(context) {
  const { request, env } = context;
  
  try {
    switch (request.method) {
      case 'GET':
        return handleGetThemes(context);
      case 'POST':
        return handleSetTheme(context);
      case 'OPTIONS':
        return handleOptions();
      default:
        return new Response(JSON.stringify({ error: '方法不允许' }), {
          status: 405,
          headers: getCorsHeaders()
        });
    }
  } catch (error) {
    console.error('主题API错误:', error);
    return new Response(JSON.stringify({ 
      error: '服务器错误: ' + error.message 
    }), {
      status: 500,
      headers: getCorsHeaders()
    });
  }
}

// 获取主题
async function handleGetThemes(context) {
  const { env } = context;
  
  try {
    // 检查数据库连接
    if (!env.DB) {
      console.log('D1数据库未连接，返回模拟主题数据');
      return getMockThemeData();
    }
    
    let themes;
    try {
      themes = await env.DB.prepare("SELECT * FROM themes").all();
      console.log('成功获取主题数据:', themes.results?.length, '个主题');
    } catch (dbError) {
      console.error('获取主题数据失败:', dbError);
      return getMockThemeData();
    }
    
    const activeTheme = themes.results?.find(theme => theme.is_active) || themes.results?.[0] || { name: 'spring' };
    
    return new Response(JSON.stringify({
      themes: themes.results || [],
      activeTheme: activeTheme.name
    }), {
      status: 200,
      headers: getCorsHeaders()
    });
  } catch (error) {
    console.error('获取主题错误:', error);
    return getMockThemeData();
  }
}

// 设置主题 - 修复事务处理
async function handleSetTheme(context) {
  const { request, env } = context;
  
  try {
    const { theme } = await request.json();
    console.log('设置主题请求:', theme);
    
    if (!theme) {
      return new Response(JSON.stringify({ 
        error: '未指定主题'
      }), {
        status: 400,
        headers: getCorsHeaders()
      });
    }
    
    // 检查数据库连接
    if (!env.DB) {
      console.log('D1数据库未连接，模拟设置主题:', theme);
      return new Response(JSON.stringify({ 
        success: true,
        message: '主题已应用（模拟模式）',
        theme: theme
      }), {
        status: 200,
        headers: getCorsHeaders()
      });
    }
    
    // 验证主题是否存在
    const validThemes = ['spring', 'summer', 'autumn', 'winter'];
    if (!validThemes.includes(theme)) {
      return new Response(JSON.stringify({ 
        error: '无效的主题名称'
      }), {
        status: 400,
        headers: getCorsHeaders()
      });
    }
    
    // 使用批量操作替代事务
    try {
      // 准备所有SQL语句
      const statements = [
        // 重置所有主题为非活跃
        env.DB.prepare("UPDATE themes SET is_active = FALSE"),
        // 设置选定主题为活跃
        env.DB.prepare("UPDATE themes SET is_active = TRUE WHERE name = ?").bind(theme)
      ];
      
      // 执行批量操作
      const results = await env.DB.batch(statements);
      console.log('主题更新结果:', results);
      
      return new Response(JSON.stringify({ 
        success: true,
        message: '主题已应用',
        theme: theme
      }), {
        status: 200,
        headers: getCorsHeaders()
      });
    } catch (batchError) {
      console.error('批量操作失败:', batchError);
      throw batchError;
    }
  } catch (error) {
    console.error('更新主题错误:', error);
    return new Response(JSON.stringify({ 
      error: '更新主题失败: ' + error.message
    }), {
      status: 500,
      headers: getCorsHeaders()
    });
  }
}

// 处理预检请求
function handleOptions() {
  return new Response(null, {
    status: 200,
    headers: getCorsHeaders()
  });
}

// 获取CORS头
function getCorsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
}

// 模拟主题数据
function getMockThemeData() {
  console.log('返回模拟主题数据');
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
    headers: getCorsHeaders()
  });
}
