export async function onRequestGet(context) {
  const { env } = context;
  
  try {
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
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '获取菜单失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const menuData = await request.json();
    
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
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    // 回滚事务
    await env.DB.prepare("ROLLBACK").run();
    
    return new Response(JSON.stringify({ error: '保存菜单失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}