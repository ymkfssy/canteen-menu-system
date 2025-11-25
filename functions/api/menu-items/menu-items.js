export async function onRequest({ request, env, params }) {
  const { path } = params;
  const db = env.DB;

  // 处理 OPTIONS 请求（CORS 预检）
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    // 提取ID（如果存在）
    const id = path && path.length > 0 ? path[0] : null;
    
    let response;
    
    switch (request.method) {
      case 'GET':
        if (!id) {
          // 获取所有菜单项
          const { results } = await db.prepare(`
            SELECT * FROM menu_items 
            ORDER BY 
              CASE category 
                WHEN '凉菜' THEN 1
                WHEN '热菜' THEN 2
                WHEN '主食' THEN 3
                WHEN '汤品' THEN 4
                WHEN '水果' THEN 5
                ELSE 6
              END,
              sort_order
          `).all();
          
          response = Response.json({ success: true, data: results });
        } else {
          // 获取单个菜单项
          const item = await db.prepare('SELECT * FROM menu_items WHERE id = ?').bind(id).first();
          response = Response.json({ success: true, data: item });
        }
        break;

      case 'POST':
        // 创建新菜单项
        const { category, name, price, tag } = await request.json();
        
        if (!category || !name || !price) {
          response = Response.json({ success: false, error: '缺少必要字段' }, { status: 400 });
          break;
        }

        const maxSortResult = await db.prepare(`
          SELECT MAX(sort_order) as max_order FROM menu_items WHERE category = ?
        `).bind(category).first();
        
        const nextSortOrder = (maxSortResult?.max_order || 0) + 1;

        const result = await db.prepare(`
          INSERT INTO menu_items (category, name, price, tag, sort_order)
          VALUES (?, ?, ?, ?, ?)
        `).bind(category, name, price, tag || '', nextSortOrder).run();

        response = Response.json({ success: true, id: result.meta.last_row_id });
        break;

      case 'PUT':
        // 更新菜单项
        if (!id) {
          response = Response.json({ success: false, error: '缺少菜单项ID' }, { status: 400 });
          break;
        }

        const { category: updateCategory, name: updateName, price: updatePrice, tag: updateTag } = await request.json();
        
        const updateResult = await db.prepare(`
          UPDATE menu_items 
          SET category = ?, name = ?, price = ?, tag = ?
          WHERE id = ?
        `).bind(updateCategory, updateName, updatePrice, updateTag || '', id).run();

        response = Response.json({ success: updateResult.success });
        break;

      case 'DELETE':
        // 删除菜单项
        if (!id) {
          response = Response.json({ success: false, error: '缺少菜单项ID' }, { status: 400 });
          break;
        }

        const deleteResult = await db.prepare('DELETE FROM menu_items WHERE id = ?')
          .bind(id).run();

        response = Response.json({ success: deleteResult.success });
        break;

      default:
        response = Response.json({ success: false, error: '方法不允许' }, { status: 405 });
    }

    // 添加 CORS 头
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;
    
  } catch (error) {
    console.error('API Error:', error);
    const errorResponse = Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
    
    errorResponse.headers.set('Access-Control-Allow-Origin', '*');
    return errorResponse;
  }
}
