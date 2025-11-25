// functions/_middleware.js
// 全局中间件 - 处理 CORS 和请求预处理

export async function onRequest({ request, next, env }) {
  // 处理 OPTIONS 预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  try {
    // 继续处理请求
    const response = await next();
    
    // 克隆响应以便添加头部
    const modifiedResponse = new Response(response.body, response);
    
    // 添加 CORS 头到所有响应
    modifiedResponse.headers.set('Access-Control-Allow-Origin', '*');
    modifiedResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    modifiedResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    
    // 添加安全头
    modifiedResponse.headers.set('X-Content-Type-Options', 'nosniff');
    modifiedResponse.headers.set('X-Frame-Options', 'DENY');
    modifiedResponse.headers.set('X-XSS-Protection', '1; mode=block');
    modifiedResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // 缓存控制（可根据需要调整）
    if (request.method === 'GET') {
      modifiedResponse.headers.set('Cache-Control', 'public, max-age=300'); // 5分钟缓存
    } else {
      modifiedResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
    
    return modifiedResponse;
    
  } catch (error) {
    // 全局错误处理
    console.error('Global middleware error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: '服务器内部错误',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        },
      }
    );
  }
}

// 辅助函数：记录请求日志（可选）
function logRequest(request) {
  const url = new URL(request.url);
  console.log({
    method: request.method,
    path: url.pathname,
    timestamp: new Date().toISOString(),
    userAgent: request.headers.get('user-agent'),
  });
}

// 辅助函数：验证请求内容类型
function validateContentType(request) {
  const contentType = request.headers.get('content-type');
  if (['POST', 'PUT'].includes(request.method) && !contentType?.includes('application/json')) {
    throw new Error('Content-Type 必须为 application/json');
  }
}
