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
        // 获取当前背景图片
        const currentBackground = await db.prepare(`
          SELECT * FROM background_settings WHERE is_active = 1
        `).first();
        
        response = Response.json({ 
          success: true, 
          data: currentBackground
        });
        break;

      case 'POST':
        // 设置背景图片
        const { imageData } = await request.json();
        
        // 先重置所有背景状态
        await db.prepare('UPDATE background_settings SET is_active = 0').run();
        
        if (imageData) {
          // 插入新记录或更新现有记录
          const existing = await db.prepare('SELECT id FROM background_settings LIMIT 1').first();
          
          if (existing) {
            // 更新现有记录
            const result = await db.prepare(`
              UPDATE background_settings SET image_data = ?, is_active = 1 WHERE id = ?
            `).bind(imageData, existing.id).run();
            response = Response.json({ success: result.success });
          } else {
            // 插入新记录
            const result = await db.prepare(`
              INSERT INTO background_settings (image_data, is_active) VALUES (?, 1)
            `).bind(imageData).run();
            response = Response.json({ success: result.success });
          }
        } else {
          // 清除背景图片
          await db.prepare('UPDATE background_settings SET is_active = 0').run();
          response = Response.json({ success: true });
        }
        break;

      default:
        response = Response.json({ success: false, error: '方法不允许' }, { status: 405 });
    }

    // 添加 CORS 头
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;
    
  } catch (error) {
    console.error('Background API Error:', error);
    const errorResponse = Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
    
    errorResponse.headers.set('Access-Control-Allow-Origin', '*');
    return errorResponse;
  }
}
