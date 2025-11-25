// 获取菜单
export async function onRequestGet(context) {
  const { env } = context;
  
  try {
    // 如果没有数据库连接，返回模拟数据
    if (!env.DB) {
      console.log('使用模拟菜单数据');
      return getMockMenuData();
    }
    
    const menuItems = await env.DB.prepare(
      "SELECT * FROM menu_items ORDER BY category, sort_order"
    ).all();
    
    // 按分类组织数据
    const menuData = {
      coldDishes: menuItems.results.filter(item => item.category === 'coldDishes'),
      hotDishes: menuItems.results.filter(item => item.category === 'hotDishes'),
      staples: menuItems.results.filter(item => item.category === 'staples'),
      soups: menuItems.results.filter(item => item.category === 'soups'),
      fruits: menuItems.results.filter(item => item.category === 'fruits')
    };
    
    return new Response(JSON.stringify(menuData), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  } catch (error) {
    console.error('获取菜单错误:', error);
    // 出错时返回模拟数据
    return getMockMenuData();
  }
}

// 保存菜单
export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const menuData = await request.json();
    
    // 如果没有数据库连接，返回成功但不保存
    if (!env.DB) {
      console.log('模拟保存菜单数据');
      return new Response(JSON.stringify({ 
        success: true,
        message: '菜单已保存（模拟模式）'
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
    
    // 开始事务
    await env.DB.prepare("BEGIN TRANSACTION").run();
    
    // 清空现有菜单
    await env.DB.prepare("DELETE FROM menu_items").run();
    
    // 插入新菜单项
    const categories = ['coldDishes', 'hotDishes', 'staples', 'soups', 'fruits'];
    
    for (const category of categories) {
      const items = menuData[category] || [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        await env.DB.prepare(
          "INSERT INTO menu_items (category, name, price, sort_order) VALUES (?, ?, ?, ?)"
        ).bind(category, item.name, parseFloat(item.price), i + 1).run();
      }
    }
    
    // 提交事务
    await env.DB.prepare("COMMIT").run();
    
    return new Response(JSON.stringify({ 
      success: true,
      message: '菜单已保存'
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
    // 回滚事务
    if (env.DB) {
      await env.DB.prepare("ROLLBACK").run();
    }
    
    console.error('保存菜单错误:', error);
    return new Response(JSON.stringify({ 
      error: '保存菜单失败: ' + error.message 
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

// 模拟菜单数据
function getMockMenuData() {
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
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
