// Cloudflare Pages Functions API
// 处理所有 /api/* 请求

// 简单的会话token生成（仅用于内部系统）
function createToken(payload) {
  // 生成简单的随机token，包含用户信息和时间戳
  const tokenData = {
    ...payload,
    timestamp: Date.now()
  };
  return btoa(JSON.stringify(tokenData));
}

function verifyToken(token) {
  try {
    const data = JSON.parse(atob(token));
    // 检查token是否过期（24小时）
    const isExpired = Date.now() - data.timestamp > 24 * 60 * 60 * 1000;
    if (isExpired) return null;
    return data;
  } catch {
    return null;
  }
}

// CORS头
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// 处理OPTIONS请求
function handleOptions() {
  return new Response(null, { headers: corsHeaders });
}

// 错误响应
function errorResponse(message, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// 成功响应
function successResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// 认证中间件
function requireAuth(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7);
  return verifyToken(token);
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/', '');
  const method = request.method;

  // 处理OPTIONS
  if (method === 'OPTIONS') {
    return handleOptions();
  }

  try {
    // 路由处理
    if (path === 'auth/login' && method === 'POST') {
      return await handleLogin(request, env);
    }

    if (path === 'menu/current') {
      if (method === 'GET') {
        return await getCurrentMenu(env);
      }
      if (method === 'PUT') {
        const user = requireAuth(request);
        if (!user) return errorResponse('未授权', 401);
        return await updateCurrentMenu(request, env);
      }
    }

    if (path === 'menu/theme' && method === 'PUT') {
      const user = requireAuth(request);
      if (!user) return errorResponse('未授权', 401);
      return await updateTheme(request, env);
    }

    if (path === 'menu/presets') {
      const user = requireAuth(request);
      if (!user) return errorResponse('未授权', 401);
      
      if (method === 'GET') {
        return await getPresets(env);
      }
      if (method === 'POST') {
        return await createPreset(request, env);
      }
    }

    if (path.startsWith('menu/presets/') && method === 'DELETE') {
      const user = requireAuth(request);
      if (!user) return errorResponse('未授权', 401);
      const id = path.split('/')[2];
      return await deletePreset(id, env);
    }

    return errorResponse('未找到', 404);
  } catch (error) {
    console.error('API错误:', error);
    return errorResponse('服务器错误: ' + error.message, 500);
  }
}

// 登录处理
async function handleLogin(request, env) {
  const { username, password } = await request.json();
  
  // 查询用户
  const result = await env.DB.prepare(
    'SELECT * FROM users WHERE username = ?'
  ).bind(username).first();

  if (!result) {
    return errorResponse('用户名或密码错误', 401);
  }

  // 简单密码验证（生产环境应使用加密）
  if (result.password !== password) {
    return errorResponse('用户名或密码错误', 401);
  }

  // 生成简单token（24小时有效）
  const token = createToken({
    id: result.id,
    username: result.username
  });

  return successResponse({ token, username: result.username });
}

// 获取当前菜单
async function getCurrentMenu(env) {
  const result = await env.DB.prepare(
    'SELECT * FROM current_menu WHERE id = 1'
  ).first();

  if (!result) {
    return successResponse({
      menu: {
        coldDishes: [],
        hotDishes: [],
        stapleFood: [],
        soup: [],
        fruit: []
      },
      theme: 'winter'
    });
  }

  return successResponse({
    menu: JSON.parse(result.menu_data),
    theme: result.theme || 'winter'
  });
}

// 更新当前菜单
async function updateCurrentMenu(request, env) {
  const { menu, theme } = await request.json();

  await env.DB.prepare(
    `INSERT OR REPLACE INTO current_menu (id, menu_data, theme, updated_at)
     VALUES (1, ?, ?, datetime('now'))`
  ).bind(JSON.stringify(menu), theme).run();

  return successResponse({ success: true });
}

// 更新主题
async function updateTheme(request, env) {
  const { theme } = await request.json();

  await env.DB.prepare(
    `UPDATE current_menu SET theme = ?, updated_at = datetime('now') WHERE id = 1`
  ).bind(theme).run();

  return successResponse({ success: true });
}

// 获取预存菜单列表
async function getPresets(env) {
  const { results } = await env.DB.prepare(
    'SELECT id, name, menu_data, theme, created_at FROM menu_presets ORDER BY created_at DESC'
  ).all();

  return successResponse(results || []);
}

// 创建预存菜单
async function createPreset(request, env) {
  const { name, menu, theme } = await request.json();

  const result = await env.DB.prepare(
    `INSERT INTO menu_presets (name, menu_data, theme, created_at)
     VALUES (?, ?, ?, datetime('now'))`
  ).bind(name, JSON.stringify(menu), theme).run();

  return successResponse({ success: true, id: result.lastRowId });
}

// 删除预存菜单
async function deletePreset(id, env) {
  await env.DB.prepare(
    'DELETE FROM menu_presets WHERE id = ?'
  ).bind(id).run();

  return successResponse({ success: true });
}
