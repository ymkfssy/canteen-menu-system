export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const { username, password } = await request.json();
    
    // 简单的认证逻辑 - 生产环境应该使用更安全的方案
    const result = await env.DB.prepare(
      "SELECT * FROM admin WHERE username = ?"
    ).bind(username).first();
    
    if (!result) {
      return new Response(JSON.stringify({ error: '用户不存在' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 简化密码验证 - 生产环境应该使用bcrypt
    if (password === 'admin') { // 默认密码
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ error: '密码错误' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: '服务器错误' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}