export async function onRequest({ request, env }) {
  const db = env.DB;

  // 处理 OPTIONS 请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (request.method === 'POST') {
    try {
      // 删除所有现有数据
      await db.prepare('DELETE FROM menu_items').run();
      
      // 插入默认数据
      const defaultData = [
        { category: '凉菜', name: '凉拌黄瓜', price: 8, tag: '' },
        { category: '凉菜', name: '麻辣口水鸡', price: 15, tag: '招牌' },
        { category: '热菜', name: '红烧狮子头', price: 18, tag: '推荐' },
        { category: '热菜', name: '宫保鸡丁', price: 16, tag: '' },
        { category: '热菜', name: '鱼香肉丝', price: 16, tag: '' },
        { category: '热菜', name: '麻婆豆腐', price: 12, tag: '' },
        { category: '热菜', name: '酸辣土豆丝', price: 10, tag: '推荐' },
        { category: '热菜', name: '清炒时蔬', price: 10, tag: '' },
        { category: '主食', name: '米饭', price: 2, tag: '' },
        { category: '主食', name: '馒头', price: 1, tag: '' },
        { category: '主食', name: '葱油饼', price: 5, tag: '' },
        { category: '主食', name: '水饺(10个)', price: 12, tag: '' },
        { category: '主食', name: '牛肉面', price: 15, tag: '热销' },
        { category: '主食', name: '炒饭', price: 10, tag: '' },
        { category: '汤品', name: '西红柿蛋汤', price: 5, tag: '' },
        { category: '汤品', name: '紫菜蛋花汤', price: 5, tag: '' },
        { category: '水果', name: '时令水果拼盘', price: 8, tag: '' }
      ];

      const statements = defaultData.map(item => 
        db.prepare('INSERT INTO menu_items (category, name, price, tag, sort_order) VALUES (?, ?, ?, ?, ?)')
          .bind(item.category, item.name, item.price, item.tag || '', 0)
      );

      await db.batch(statements);

      const successResponse = Response.json({ success: true });
      successResponse.headers.set('Access-Control-Allow-Origin', '*');
      return successResponse;
      
    } catch (error) {
      console.error('Reset Error:', error);
      const errorResponse = Response.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
      
      errorResponse.headers.set('Access-Control-Allow-Origin', '*');
      return errorResponse;
    }
  }

  return new Response('Method not allowed', { status: 405 });
}
