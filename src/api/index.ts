import { Router } from 'itty-router';

// 初始化路由
const router = Router();

// API路由 - 获取所有用户
router.get('/api/users', async ({ env }) => {
  try {
    const { results } = await env.DB.prepare('SELECT * FROM users').all();
    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});

// API路由 - 添加新用户
router.post('/api/users', async ({ request, env }) => {
  try {
    const { name, email } = await request.json();
    
    if (!name || !email) {
      return new Response(JSON.stringify({ error: 'Name and email are required' }), { status: 400 });
    }

    const result = await env.DB
      .prepare('INSERT INTO users (name, email) VALUES (?, ?)')
      .bind(name, email)
      .run();

    return new Response(JSON.stringify({ 
      success: true, 
      id: result.lastInsertRowid 
    }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});

// 静态资源路由 - 指向前端文件
router.get('*', async ({ request, env }) => {
  // 让Cloudflare处理静态文件
  return env.ASSETS.fetch(request);
});

// 导出Worker入口
export default {
  fetch: router.handle,
};
