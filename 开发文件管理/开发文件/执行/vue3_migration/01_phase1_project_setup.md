# Vue 3 迁移 - 批次1：项目骨架搭建

**文档版本**：V1.0  
**创建时间**：2026-05-21  
**负责人**：待定  
**状态**：待执行  
**优先级**：P0（核心基础）

---

## 目标

搭建 Vue 3 + Vite + Pinia 项目骨架，确保开发环境可用。

---

## 执行步骤

### 步骤1：安装 Node.js 和 npm
**操作**：
1. 访问 https://nodejs.org 下载 Node.js（推荐 LTS 版本）
2. 安装后验证：
   ```bash
   node -v
   npm -v
   ```

**验证标准**：
- ✅ Node.js 版本 ≥ 18.0
- ✅ npm 版本 ≥ 9.0

---

### 步骤2：创建 Vite + Vue 3 项目
**操作**：
```bash
# 进入项目目录
cd e:\code\demo\mvpdemo\公平事务所

# 创建 Vite 项目（保留原有文件）
npm create vite@latest . -- --template vue

# 安装依赖
npm install
```

**验证标准**：
- ✅ 生成 `package.json`、`vite.config.js`、`index.html`
- ✅ `node_modules` 目录存在

---

### 步骤3：安装 Pinia 和 Vue Router
**操作**：
```bash
npm install pinia vue-router@4
```

**验证标准**：
- ✅ `package.json` 中包含 `pinia` 和 `vue-router`

---

### 步骤4：创建项目目录结构
**操作**：
```
src/
├── main.js               # 入口文件
├── App.vue               # 根组件
├── router/
│   └── index.js         # 路由配置
├── stores/
│   ├── game.js          # 游戏主状态
│   ├── player.js        # 玩家状态
│   └── reportBeauty.js # 报表美容状态
├── components/
│   ├── GameMenu.vue    # 主菜单
│   ├── GameHUD.vue     # 游戏HUD
│   └── ReportBeauty.vue # 报表美容组件
├── views/
│   ├── HomeView.vue    # 主页
│   ├── GameView.vue    # 游戏页
│   └── DebugView.vue   # 调试页
├── assets/
│   ├── css/            # 迁移原有CSS
│   └── images/         # 迁移原有图片
└── data/               # 迁移原有JSON数据
```

**验证标准**：
- ✅ 所有目录和空文件已创建
- ✅ 目录结构符合 Vue 3 最佳实践

---

### 步骤5：配置 Vite 和 Vue Router
**操作**：

1. **`vite.config.js`**：
   ```javascript
   import { defineConfig } from 'vite'
   import vue from '@vitejs/plugin-vue'
   
   export default defineConfig({
     plugins: [vue()],
     server: {
       port: 3000,
       open: true
     }
   })
   ```

2. **`src/router/index.js`**：
   ```javascript
   import { createRouter, createWebHistory } from 'vue-router'
   import HomeView from '@/views/HomeView.vue'
   
   const routes = [
     { path: '/', component: HomeView },
     { path: '/game', component: () => import('@/views/GameView.vue') }
   ]
   
   const router = createRouter({
     history: createWebHistory(),
     routes
   })
   
   export default router
   ```

3. **`src/main.js`**：
   ```javascript
   import { createApp } from 'vue'
   import { createPinia } from 'pinia'
   import App from './App.vue'
   import router from './router'
   
   const app = createApp(App)
   app.use(createPinia())
   app.use(router)
   app.mount('#app')
   ```

**验证标准**：
- ✅ `npm run dev` 启动成功
- ✅ 访问 `http://localhost:3000` 看到 Vue 默认页面

---

## 验收标准

| 项次 | 验收项 | 验收结果 | 备注 |
|------|--------|----------|------|
| 1.1 | Node.js 安装成功（版本 ≥ 18.0） | ☐ 待验收 | 命令行验证 |
| 1.2 | Vite + Vue 3 项目创建成功 | ☐ 待验收 | `npm run dev` 可启动 |
| 1.3 | Pinia 和 Vue Router 安装成功 | ☐ 待验收 | `package.json` 确认 |
| 1.4 | 项目目录结构创建完成 | ☐ 待验收 | 文件浏览器确认 |
| 1.5 | Vite 配置正确（端口3000） | ☐ 待验收 | 启动后访问 localhost:3000 |
| 1.6 | Vue Router 配置正确（/ 和 /game 路由） | ☐ 待验收 | 路由跳转正常 |

---

## 风险与依赖

### 风险
- 🔴 **高风险**：Node.js 版本不兼容（需要 ≥ 18.0）
- 🟡 **中风险**：Vite 配置错误导致启动失败
- 🟢 **低风险**：目录结构创建错误（可手动修复）

### 依赖
- 依赖批次0（无）
- 被批次2依赖（必须完成）

---

## 预计工时

- **开发工时**：4小时
- **测试工时**：1小时
- **总计**：5小时

---

## 完成标准

- [ ] 所有验收项通过
- [ ] `npm run dev` 可正常访问
- [ ] 项目骨架可提交到版本控制

---

**文档结束**
