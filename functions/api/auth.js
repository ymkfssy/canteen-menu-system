// 处理所有HTTP方法
export async function onRequest(context) {
  const { request, env } = context;
  
  try {
    switch (request.method) {
      case 'POST':
        return handleLogin(context);
      case 'OPTIONS':
        return handleOptions();
      default:
        return new Response(JSON.stringify({ error: '方法不允许' }), {
          status: 405,
          headers: getCorsHeaders()
        });
    }
  } catch (error) {
    console.error('认证API错误:', error);
    return new Response(JSON.stringify({ 
      error: '服务器错误: ' + error.message 
    }), {
      status: 500,
      headers: getCorsHeaders()
    });
  }
}

// 处理登录
async function handleLogin(context) {
  const { request, env } = context;
  
  try {
    const { username, password } = await request.json();
    console.log('登录请求:', { username, password: password ? '***' : '未提供' });
    
    // 简单的认证逻辑
    if (username === 'admin' && password === 'admin') {
      return new Response(JSON.stringify({ 
        success: true,
        message: '登录成功'
      }), {
        status: 200,
        headers: getCorsHeaders()
      });
    } else {
      return new Response(JSON.stringify({ 
        error: '用户名或密码错误',
        provided: { username, hasPassword: !!password }
      }), {
        status: 401,
        headers: getCorsHeaders()
      });
    }
  } catch (error) {
    console.error('认证错误:', error);
    return new Response(JSON.stringify({ 
      error: '服务器错误: ' + error.message 
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
