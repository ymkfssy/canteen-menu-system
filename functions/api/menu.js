// 处理所有HTTP方法
export async function onRequest(context) {
  const { request, env } = context;
  
  try {
    switch (request.method) {
      case 'GET':
        return handleGetMenu(context);
      case 'POST':
        return handleSaveMenu(context);
      case 'OPTIONS':
        return handleOptions();
      default:
        return new Response(JSON.stringify({ error: '方法不允许' }), {
          status: 405,
          headers: getCorsHeaders()
        });
    }
  } catch (error) {
    console.error('菜单API错误:', error);
    return new Response(JSON.stringify({ 
      error: '服务器错误: ' + error.message 
    }), {
      status: 500,
      headers: getCorsHeaders()
    });
  }
}

// 获取菜单
async function handleGetMenu(context) {
  const { env } = context;
  
  try {
    // 检查数据库连接
    if (!env.DB) {
      console.log('D1数据库未连接，返回模拟数据');
      return getMockMenuData();
    }
    
    // 尝试查询数据库
    let menuItems;
    try {
      menuItems = await env.DB.prepare(
        "SELECT * FROM menu_items ORDER BY category, sort_order"
      ).all();
      console.log('数据库查询成功，获取到', menuItems.results?.length, '个菜品');
    } catch (dbError) {
      console.error('数据库查询失败:', dbError);
      return getMockMenuData();
    }
    
    // 按分类组织数据
    const menuData = {
      coldDishes: menuItems.results?.filter(item => item.category === 'coldDishes') || [],
      hotDishes: menuItems.results?.filter(item => item.category === 'hotDishes') || [],
      staples: menuItems.results?.filter(item => item.category === 'staples') || [],
      soups: menuItems.results?.filter(item => item.category === 'soups') || [],
      fruits: menuItems.results?.filter(item => item.category === 'fruits') || []
    };
    
    return new Response(JSON.stringify(menuData), {
      status: 200,
      headers: getCorsHeaders()
    });
  } catch (error) {
    console.error('获取菜单错误:', error);
    return getMockMenuData();
  }
}

// 保存菜单
async function handleSaveMenu(context) {
  const { request, env } = context;
  
  try {
    const menuData = await request.json();
    console.log('收到菜单数据:', JSON.stringify(menuData).substring(0, 200) + '...');
    
    // 检查数据库连接
    if (!env.DB) {
      console.log('D1数据库未连接，模拟保存成功');
      return new Response(JSON.stringify({ 
        success: true,
        message: '菜单已保存（模拟模式）',
        data: menuData
      }), {
        status: 200,
        headers: getCorsHeaders()
      });
    }
    
    // 验证菜单数据
    if (!menuData || typeof menuData !== 'object') {
      return new Response(JSON.stringify({ 
        error: '无效的菜单数据格式'
      }), {
        status: 400,
        headers: getCorsHeaders()
      });
    }
    
    // 开始事务
    await env.DB.prepare("BEGIN TRANSACTION").run();
    
    try {
      // 清空现有菜单
      await env.DB.prepare("DELETE FROM menu_items").run();
      console.log('已清空现有菜单');
      
      // 插入新菜单项
      const categories = ['coldDishes', 'hotDishes', 'staples', 'soups', 'fruits'];
      let totalItems = 0;
      
      for (const category of categories) {
        const items = menuData[category] || [];
        console.log(`处理分类 ${category}, 有 ${items.length} 个菜品`);
        
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item && item.name && item.price !== undefined) {
            await env.DB.prepare(
              "INSERT INTO menu_items (category, name, price, sort_order) VALUES (?, ?, ?, ?)"
            ).bind(
              category, 
              String(item.name).trim(), 
              parseFloat(item.price) || 0, 
              i + 1
            ).run();
            totalItems++;
          }
        }
      }
      
      // 提交事务
      await env.DB.prepare("COMMIT").run();
      console.log(`成功保存 ${totalItems} 个菜品到数据库`);
      
      return new Response(JSON.stringify({ 
        success: true,
        message: `菜单已保存，共 ${totalItems} 个菜品`,
        savedItems: totalItems
      }), {
        status: 200,
        headers: getCorsHeaders()
      });
    } catch (transactionError) {
      // 回滚事务
      await env.DB.prepare("ROLLBACK").run();
      throw transactionError;
    }
  } catch (error) {
    console.error('保存菜单错误:', error);
    return new Response(JSON.stringify({ 
      error: '保存菜单失败: ' + error.message,
      details: error.stack
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

// 模拟菜单数据
function getMockMenuData() {
  console.log('返回模拟菜单数据');
  const mockData = {
    coldDishes: [
      { id: 1, category: 'coldDishes', name: '凉拌黄瓜', price: 8.00, sort_order: 1 },
      { id: 2, category: 'coldDishes', name: '拍黄瓜', price: 8.00, sort_order: 2 }
    ],
    hotDishes: [
      { id: 3, category: 'hotDishes', name: '红烧肉', price: 28.00, sort_order: 1 },
      { id: 4, category: 'hotDishes', name: '宫保鸡丁', price: 22.00, sort_order: 2 },
      { id: 5, category: 'hotDishes', name: '麻婆豆腐', price: 18.00, sort_order: 3 },
      { id: 6, category: 'hotDishes', name: '清蒸鲈鱼', price: 35.00, sort_order: 4 },
      { id: 7, category: 'hotDishes', name: '西红柿炒蛋', price: 15.00, sort_order: 5 },
      { id: 8, category: 'hotDishes', name: '地三鲜', price: 16.00, sort_order: 6 }
    ],
    staples: [
      { id: 9, category: 'staples', name: '米饭', price: 2.00, sort_order: 1 },
      { id: 10, category: 'staples', name: '馒头', price: 1.00, sort_order: 2 },
      { id: 11, category: 'staples', name: '面条', price: 10.00, sort_order: 3 },
      { id: 12, category: 'staples', name: '水饺', price: 15.00, sort_order: 4 },
      { id: 13, category: 'staples', name: '包子', price: 2.50, sort_order: 5 },
      { id: 14, category: 'staples', name: '煎饼', price: 5.00, sort_order: 6 }
    ],
    soups: [
      { id: 15, category: 'soups', name: '西红柿蛋汤', price: 6.00, sort_order: 1 },
      { id: 16, category: 'soups', name: '紫菜汤', price: 5.00, sort_order: 2 }
    ],
    fruits: [
      { id: 17, category: 'fruits', name: '苹果', price: 5.00, sort_order: 1 },
      { id: 18, category: 'fruits', name: '香蕉', price: 4.00, sort_order: 2 }
    ]
  };
  
  return new Response(JSON.stringify(mockData), {
    status: 200,
    headers: getCorsHeaders()
  });
}
