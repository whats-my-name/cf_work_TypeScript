/**
 * 处理静态资源请求
 */
async function handleStaticAssets(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 处理根路径请求，返回index.html
    if (path === '/' || path === '') {
        return new Response(await env.ASSETS.get('index.html'), {
            headers: { 'Content-Type': 'text/html;charset=UTF-8' }
        });
    }

    // 处理CSS文件请求
    if (path.endsWith('.css')) {
        const asset = await env.ASSETS.get(path.slice(1)); // 移除前导斜杠
        if (asset) {
            return new Response(asset, {
                headers: { 'Content-Type': 'text/css;charset=UTF-8' }
            });
        }
    }

    // 处理JavaScript文件请求
    if (path.endsWith('.js')) {
        const asset = await env.ASSETS.get(path.slice(1)); // 移除前导斜杠
        if (asset) {
            return new Response(asset, {
                headers: { 'Content-Type': 'application/javascript;charset=UTF-8' }
            });
        }
    }

    // 资源未找到
    return new Response('Not found', { status: 404 });
}

/**
 * 验证用户会话
 */
async function verifySession(request, env) {
    const cookieHeader = request.headers.get('Cookie') || '';
    const sessionCookie = cookieHeader.split(';').find(c => c.trim().startsWith('session='));
    
    if (!sessionCookie) {
        return null;
    }
    
    const sessionId = sessionCookie.split('=')[1];
    
    // 从D1查询会话
    const { results } = await env.DB.prepare(
        'SELECT u.* FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.session_id = ? AND s.expires_at > CURRENT_TIMESTAMP'
    ).bind(sessionId).all();
    
    return results.length > 0 ? results[0] : null;
}

/**
 * 生成会话ID
 */
function generateSessionId() {
    return crypto.randomUUID();
}

/**
 * 哈希密码
 */
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * 处理API请求
 */
async function handleApiRequest(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    
    // 获取当前登录用户
    const user = await verifySession(request, env);

    // 注册用户
    if (path === '/api/register' && method === 'POST') {
        const { username, email, password } = await request.json();
        
        // 验证输入
        if (!username || !email || !password) {
            return new Response(JSON.stringify({ error: '请填写所有字段' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        try {
            // 检查用户名是否已存在
            const userExists = await env.DB.prepare(
                'SELECT id FROM users WHERE username = ?'
            ).bind(username).first();
            
            if (userExists) {
                return new Response(JSON.stringify({ error: '用户名已存在' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            
            // 检查邮箱是否已存在
            const emailExists = await env.DB.prepare(
                'SELECT id FROM users WHERE email = ?'
            ).bind(email).first();
            
            if (emailExists) {
                return new Response(JSON.stringify({ error: '邮箱已被注册' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            
            // 哈希密码
            const passwordHash = await hashPassword(password);
            
            // 创建用户
            const result = await env.DB.prepare(
                'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)'
            ).bind(username, email, passwordHash, 'user').run();
            
            return new Response(JSON.stringify({ success: true, userId: result.lastInsertRowid }), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            console.error('注册失败:', error);
            return new Response(JSON.stringify({ error: '注册失败，请重试' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    // 用户登录
    if (path === '/api/login' && method === 'POST') {
        const { username, password } = await request.json();
        
        if (!username || !password) {
            return new Response(JSON.stringify({ error: '请填写用户名和密码' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        try {
            // 查询用户
            const user = await env.DB.prepare(
                'SELECT id, username, password_hash, role FROM users WHERE username = ?'
            ).bind(username).first();
            
            if (!user) {
                return new Response(JSON.stringify({ error: '用户名或密码错误' }), {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            
            // 验证密码
            const passwordHash = await hashPassword(password);
            if (user.password_hash !== passwordHash) {
                return new Response(JSON.stringify({ error: '用户名或密码错误' }), {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            
            // 生成会话ID
            const sessionId = generateSessionId();
            
            // 设置会话过期时间为7天
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);
            
            // 存储会话
            await env.DB.prepare(
                'INSERT INTO sessions (session_id, user_id, expires_at) VALUES (?, ?, ?)'
            ).bind(sessionId, user.id, expiresAt.toISOString()).run();
            
            // 设置Cookie
            const response = new Response(JSON.stringify({
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role
                }
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
            
            response.headers.append('Set-Cookie', `session=${sessionId}; HttpOnly; Secure; SameSite=Lax; Expires=${expiresAt.toUTCString()}`);
            
            return response;
        } catch (error) {
            console.error('登录失败:', error);
            return new Response(JSON.stringify({ error: '登录失败，请重试' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    // 获取当前用户信息
    if (path === '/api/me' && method === 'GET') {
        if (!user) {
            return new Response(JSON.stringify({ error: '未登录' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        return new Response(JSON.stringify({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // 用户登出
    if (path === '/api/logout' && method === 'POST') {
        const cookieHeader = request.headers.get('Cookie') || '';
        const sessionCookie = cookieHeader.split(';').find(c => c.trim().startsWith('session='));
        
        if (sessionCookie) {
            const sessionId = sessionCookie.split('=')[1];
            await env.DB.prepare('DELETE FROM sessions WHERE session_id = ?').bind(sessionId).run();
        }
        
        const response = new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
        
        response.headers.append('Set-Cookie', 'session=; HttpOnly; Secure; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 UTC');
        
        return response;
    }

    // 处理留言相关请求
    if (path.startsWith('/api/messages')) {
        // 获取留言列表
        if (path === '/api/messages' && method === 'GET') {
            try {
                let query = `
                    SELECT m.*, u.username 
                    FROM messages m 
                    JOIN users u ON m.user_id = u.id 
                    WHERE m.is_approved = 1 
                    ORDER BY m.created_at DESC
                `;
                
                // 管理员可以看到所有留言，包括未批准的
                if (user && user.role === 'admin') {
                    query = `
                        SELECT m.*, u.username 
                        FROM messages m 
                        JOIN users u ON m.user_id = u.id 
                        ORDER BY m.created_at DESC
                    `;
                }
                
                const { results } = await env.DB.prepare(query).all();
                
                return new Response(JSON.stringify(results), {
                    headers: { 'Content-Type': 'application/json' }
                });
            } catch (error) {
                console.error('获取留言失败:', error);
                return new Response(JSON.stringify({ error: '获取留言失败' }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }
        
        // 创建新留言
        if (path === '/api/messages' && method === 'POST') {
            if (!user) {
                return new Response(JSON.stringify({ error: '请先登录' }), {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            
            const { content } = await request.json();
            
            if (!content || content.trim() === '') {
                return new Response(JSON.stringify({ error: '留言内容不能为空' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            
            try {
                // 管理员的留言自动批准，普通用户可能需要审核
                const isApproved = user.role === 'admin' ? 1 : 1; // 这里简化为全部自动批准
                
                await env.DB.prepare(
                    'INSERT INTO messages (user_id, content, is_approved) VALUES (?, ?, ?)'
                ).bind(user.id, content, isApproved).run();
                
                return new Response(JSON.stringify({ success: true }), {
                    headers: { 'Content-Type': 'application/json' }
                });
            } catch (error) {
                console.error('创建留言失败:', error);
                return new Response(JSON.stringify({ error: '创建留言失败' }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }
        
        // 删除留言
if (path.match(/^\/api\/messages\/(\d+)$/) && method === 'DELETE') {
    if (!user) {
        return new Response(JSON.stringify({ error: '请先登录' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    const messageId = path.match(/^\/api\/messages\/(\d+)$/)[1];
    
    try {
        // 检查留言是否存在
        const message = await env.DB.prepare(
            'SELECT user_id FROM messages WHERE id = ?'
        ).bind(messageId).first();
        
        if (!message) {
            return new Response(JSON.stringify({ error: '留言不存在' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // 核心修改：管理员可以删除任何留言，普通用户只能删除自己的
        if (user.role !== 'admin' && message.user_id !== user.id) {
            return new Response(JSON.stringify({ error: '没有权限删除此留言' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // 执行删除
        await env.DB.prepare('DELETE FROM messages WHERE id = ?').bind(messageId).run();
        
        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('删除留言失败:', error);
        return new Response(JSON.stringify({ error: '删除留言失败' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

    }

    // 管理员用户管理API
    if (path.startsWith('/api/users')) {
        // 只有管理员可以访问
        if (!user || user.role !== 'admin') {
            return new Response(JSON.stringify({ error: '没有权限' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // 获取用户列表
        if (path === '/api/users' && method === 'GET') {
            try {
                const { results } = await env.DB.prepare(
                    'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC'
                ).all();
                
                return new Response(JSON.stringify(results), {
                    headers: { 'Content-Type': 'application/json' }
                });
            } catch (error) {
                console.error('获取用户列表失败:', error);
                return new Response(JSON.stringify({ error: '获取用户列表失败' }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }
        
        // 更新用户角色
        if (path.match(/^\/api\/users\/(\d+)\/role$/) && method === 'PATCH') {
            const userId = path.match(/^\/api\/users\/(\d+)\/role$/)[1];
            const { role } = await request.json();
            
            if (!['user', 'admin'].includes(role)) {
                return new Response(JSON.stringify({ error: '无效的角色' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            
            try {
                // 检查用户是否存在
                const userExists = await env.DB.prepare(
                    'SELECT id FROM users WHERE id = ?'
                ).bind(userId).first();
                
                if (!userExists) {
                    return new Response(JSON.stringify({ error: '用户不存在' }), {
                        status: 404,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
                
                // 不允许将自己的角色改为普通用户
                if (userId == user.id && role === 'user') {
                    return new Response(JSON.stringify({ error: '不能将自己的角色改为普通用户' }), {
                        status: 400,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
                
                await env.DB.prepare(
                    'UPDATE users SET role = ? WHERE id = ?'
                ).bind(role, userId).run();
                
                return new Response(JSON.stringify({ success: true }), {
                    headers: { 'Content-Type': 'application/json' }
                });
            } catch (error) {
                console.error('更新用户角色失败:', error);
                return new Response(JSON.stringify({ error: '更新用户角色失败' }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }
    }

    // API端点未找到
    return new Response(JSON.stringify({ error: 'API端点未找到' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
    });
}

/**
 * Cloudflare Worker入口函数
 */
export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        
        // 处理API请求
        if (url.pathname.startsWith('/api/')) {
            return handleApiRequest(request, env);
        }
        
        // 处理静态资源
        return handleStaticAssets(request, env);
    }
};
    