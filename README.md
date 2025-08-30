# Meow App
![meow.png](https://pic.oneloved.top/2025-08/meow_1754197450654.png)
Meow App 是一个简洁的笔记应用，支持本地存储和云端同步。它现在使用自托管的 PocketBase 实例进行多用户数据存储。

## 功能亮点：
- 画布模式，便于整理思绪
- 热力图数据统计，满满成就感
- 模糊语法，适用于记忆场景
- 每日回顾，温故而知新
- AI对话，你问它答
....

## 特别感谢
- 使用nocode<https://nocode.cn>制作。
- 部分组件代码源于网络。

## demo
公开的demo地址：[https://flomo.nocode.host/](https://flomo.nocode.host/)

## 本地开发

1.  **启动后端服务**：
    进入 `pocketbase` 目录，运行 `go run . serve`。PocketBase 服务将在 `http://127.0.0.1:8090` 启动。

2.  **启动前端开发服务器**：
    在项目根目录运行 `npm install` 安装依赖，然后运行 `npm run dev`。前端应用将在 `http://localhost:8081` 启动。

3.  **访问应用**：
    在浏览器中打开 `http://localhost:8081` 即可访问应用。

## Docker 部署

1.  **构建和运行 Docker 容器**：
    在项目根目录运行 `docker-compose up --build`。

2.  **访问应用**：
    前端应用将在 `http://localhost:80` 启动，PocketBase 后端将在 `http://localhost:8090` 启动。

## 使用指南

### 云端同步
1. 在应用中打开设置
2. 在"数据"标签页中，启用"云端数据同步"
3. 使用你的 GitHub 账号登录。你的数据将会自动同步到你的 PocketBase 实例。
4. 你也可以使用提供的按钮手动触发备份或恢复。

### 本地数据管理
1. 在设置中的"数据"标签页，你可以导出和导入本地数据。
2. 导出的数据是JSON格式，包含所有想法、标签和设置。

## 项目结构
- `src/` - 前端源代码
  - `components/` - React组件
  - `context/` - React Context
  - `lib/` - 工具库和服务
    - `pocketbase.js` - 与 PocketBase 后端交互的服务
- `pocketbase/` - PocketBase 后端服务
  - `main.go` - 后端主程序文件
- `vite.config.js` - Vite 配置文件, 包含API代理
