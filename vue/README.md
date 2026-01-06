# Vue 3 + Cloudflare Workers 项目

这是使用 Vue 3 重构的用户留言系统，部署在 Cloudflare Workers 上。

## 项目结构

```
cf_work_TypeScript/
├── worker.js              # Cloudflare Workers 后端 API
├── wrangler.json          # Cloudflare Workers 配置
├── schema.sql             # 数据库 schema
└── vue/                  # Vue 3 前端项目
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.js
        ├── App.vue
        ├── router/
        │   └── index.js
        ├── components/
        │   ├── LoginForm.vue
        │   ├── RegisterForm.vue
        │   ├── MessageForm.vue
        │   ├── MessageList.vue
        │   ├── MessageCard.vue
        │   ├── UserManagement.vue
        │   └── MessageNotification.vue
        ├── views/
        │   └── Home.vue
        ├── stores/
        │   ├── user.js
        │   ├── message.js
        │   └── notification.js
        ├── api/
        │   ├── auth.js
        │   ├── message.js
        │   └── user.js
        ├── utils/
        │   └── api.js
        └── styles/
            └── main.css
```

## 技术栈

### 前端
- Vue 3 (Composition API)
- Vue Router 4
- Pinia (状态管理)
- Axios (HTTP 客户端)
- Vite (构建工具)

### 后端
- Cloudflare Workers
- D1 (SQLite 数据库)

## 开发步骤

### 1. 安装依赖

```bash
cd vue
npm install
```

### 2. 开发模式

```bash
npm run dev
```

### 3. 构建生产版本

```bash
npm run build
```

### 4. 部署到 Cloudflare Workers

```bash
cd ..
wrangler deploy
```

## 功能特性

- 用户注册和登录
- 发表留言（支持图片上传）
- 查看留言列表
- 删除留言（管理员和留言作者）
- 用户管理（管理员）
- 角色权限管理

## 数据库迁移

由于 messages 表新增了 `image_url` 字段，需要更新数据库：

```sql
-- 1. 创建新表
CREATE TABLE messages_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_approved BOOLEAN DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. 复制数据
INSERT INTO messages_new (id, user_id, content, created_at, is_approved)
SELECT id, user_id, content, created_at, is_approved FROM messages;

-- 3. 删除旧表
DROP TABLE messages;

-- 4. 重命名新表
ALTER TABLE messages_new RENAME TO messages;

-- 5. 重建索引
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
```

## 注意事项

1. 图片使用 base64 格式存储在数据库中，适合小量数据
2. 生产环境建议使用 Cloudflare R2 等对象存储服务
3. 确保 wrangler.json 中的 database_id 正确
4. 部署前需要先运行 `npm run build` 构建前端
