# 部署说明

## 项目结构

```
cf_work_TypeScript/
├── worker.js           # Cloudflare Workers 后端
├── wrangler.json       # Cloudflare 配置
├── schema.sql          # 数据库 schema
├── selector.html      # 版本选择页面
├── public/            # 普通版本 (原生 JavaScript)
│   ├── index.html
│   ├── styles.css
│   └── script.js
└── vue/               # Vue 3 版本
    ├── package.json
    ├── vite.config.js
    └── src/
```

## 部署步骤

### 1. 构建 Vue 版本

```bash
cd vue
npm install
npm run build
```

### 2. 更新 wrangler.json

确保 `wrangler.json` 配置正确：

```json
{
    "name": "cf-test-project",
    "compatibility_date": "2025-10-06",
    "main": "worker.js",
    "assets": {
        "directory": "./"
    },
    "d1_databases": [
        {
            "binding": "DB",
            "database_name": "d1db",
            "database_id": "49ebe697-5233-417e-9a19-bfd32025e192"
        }
    ]
}
```

**注意**：`directory` 改为 `"./"` 以支持多路径访问

### 3. 部署到 Cloudflare Workers

```bash
cd ..
wrangler deploy
```

## 访问路径

- **选择页面**：`https://your-worker.workers.dev/`
- **Vue 版本**：`https://your-worker.workers.dev/vue/`
- **普通版本**：`https://your-worker.workers.dev/public/`

## 记住用户选择

选择页面支持记住用户的选择：
- 勾选"记住我的选择"后，选择会保存到 localStorage
- 下次访问会自动记住您的偏好

## 路由说明

### 根路径 `/`
返回版本选择页面 `selector.html`

### Vue 版本 `/vue/*`
- `/vue/` → Vue 应用入口
- `/vue/assets/*` → Vue 静态资源

### 普通版本 `/public/*`
- `/public/` → 普通版本入口
- `/public/styles.css` → 样式文件
- `/public/script.js` → JavaScript 文件

### API 路径 `/api/*`
所有 API 请求保持不变：
- `/api/login` - 用户登录
- `/api/register` - 用户注册
- `/api/messages` - 留言相关
- 等等...

## 开发模式

### Vue 版本开发

```bash
cd vue
npm run dev
```

访问 `http://localhost:5173` 进行开发

### 普通版本开发

直接在浏览器中打开 `public/index.html`

## 注意事项

1. **Vue 构建路径**：确保 `vite.config.js` 中的 `base: '/vue/'` 配置正确
2. **静态资源路径**：wrangler 需要上传所有静态文件（selector.html, public/, vue/dist/）
3. **数据库迁移**：如果需要支持图片功能，请参考 `vue/README.md` 进行数据库迁移
4. **缓存问题**：部署后如遇到资源加载问题，可能需要清除浏览器缓存

## 故障排除

### Vue 版本无法加载

1. 检查 `vue/dist` 目录是否存在
2. 确认 `npm run build` 已成功执行
3. 检查浏览器控制台是否有路径错误

### 普通版本无法加载

1. 检查 `public/` 目录文件是否完整
2. 确认 `selector.html`、`public/index.html` 等文件已上传

### API 请求失败

1. 确认 D1 数据库已正确配置
2. 检查 `wrangler.json` 中的 `database_id` 是否正确
3. 查看 Workers 日志获取详细错误信息
