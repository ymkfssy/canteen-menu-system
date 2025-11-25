export async function onRequestGet(context) {
  const { env } = context;
  
  try {
    const themes = await env.DB.prepare(
      "SELECT * FROM themes"
    ).all();
    
    const activeTheme = themes.results.find(theme => theme.is_active) || themes.results[0];
    
    return new Response(JSON.stringify({
      themes: themes.results,
      activeTheme: activeTheme.name
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '获取主题失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const { theme } = await request.json();
    
    // 重置所有主题为非活跃
    await env.DB.prepare("UPDATE themes SET is_active = FALSE").run();
    
    // 设置选定主题为活跃
    await env.DB.prepare(
      "UPDATE themes SET is_active = TRUE WHERE name = ?"
    ).bind(theme).run();
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '更新主题失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}