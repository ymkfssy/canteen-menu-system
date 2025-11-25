// functions/api/themes.js
export async function onRequest({ request, env }) {
  const db = env.DB;

  // 处理 OPTIONS 请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    let response;
    
    switch (request.method) {
      case 'GET':
        // 获取当前激活的主题
        const currentTheme = await db.prepare(`
          SELECT * FROM theme_settings WHERE is_active = 1
        `).first();
        
        const allThemes = await db.prepare(`
          SELECT * FROM theme_settings
        `).all();

        response = Response.json({ 
          success: true, 
          data: {
            current: currentTheme,
            all: allThemes.results
          }
        });
        break;

      case 'POST':
        // 切换主题
        const { themeName } = await request.json();
        
        if (!themeName) {
          response = Response.json({ success: false, error: '缺少主题名称' }, { status: 400 });
          break;
        }
        
        // 先重置所有主题状态
        await db.prepare('UPDATE theme_settings SET is_active = 0').run();
        
        // 激活指定主题
        const result = await db.prepare(`
          UPDATE theme_settings SET is_active = 1 WHERE theme_name = ?
        `).bind(themeName).run();

        response = Response.json({ success: result.success });
        break;

      default:
        response = Response.json({ success: false, error: '方法不允许' }, { status: 405 });
    }

    // 添加 CORS 头
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;
    
  } catch (error) {
    console.error('Theme API Error:', error);
    const errorResponse = Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
    
    errorResponse.headers.set('Access-Control-Allow-Origin', '*');
    return errorResponse;
  }
}