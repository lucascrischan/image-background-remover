# Image Background Remover — MVP 需求文档

> 版本：v0.1 | 日期：2026-03-20

---

## 1. 产品概述

- **产品名称**：BgRemover
- **一句话描述**：拖拽图片 → 自动移除背景 → 下载透明 PNG
- **目标用户**：设计师、电商卖家、内容创作者
- **核心价值**：3 秒完成背景移除，无需 Photoshop

---

## 2. 功能范围

### MVP 必须有

| 功能 | 描述 |
|------|------|
| **图片上传** | 拖拽或点击上传，支持 JPG/PNG/WEBP，最大 10MB |
| **背景移除** | 调用 Remove.bg API 移除背景 |
| **预览对比** | 原图 vs 去背图左右对比展示 |
| **下载结果** | 一键下载透明 PNG |
| **处理状态** | 上传中 / 处理中 / 完成 / 失败四种状态 |

### MVP 不会有（后续迭代）

- [ ] 批量处理
- [ ] 历史记录
- [ ] 用户登录
- [ ] 自定义背景色

---

## 3. 技术方案

### 前端（Cloudflare Pages）

- 纯静态页面：HTML + CSS + Vanilla JS
- 无框架依赖，打开即用
- 拖拽上传用 FileReader API
- 对比预览用 CSS Grid

### 后端（Cloudflare Workers）

- 接收前端 Base64 图片
- 调用 Remove.bg API（POST `https://api.remove.bg/v1.0/removebg`）
- 返回透明 PNG（或 Base64）
- 不存储任何文件，内存处理

### API Key

- 环境变量：`REMOVE_BG_API_KEY`
- 每天免费额度 50 张（remove.bg 免费计划）

---

## 4. API 设计

### 请求

```
POST /api/remove
Content-Type: application/json

{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

### 响应（成功）

```json
{
  "success": true,
  "result": "data:image/png;base64,iVBORw0KGgo..."
}
```

### 响应（失败）

```json
{
  "success": false,
  "error": "API rate limit exceeded"
}
```

---

## 5. UI 设计方向

### 布局

- 单页面，垂直居中
- 最大宽度 600px
- 顶部标题 + 描述

### 交互流程

```
[拖拽区域] → [上传后显示原图] → [处理中转圈] → [显示透明图] → [下载按钮]
```

### 视觉风格

- 极简工具感：白底、灰字、无多余装饰
- 字体：系统字体栈
- 按钮：实心深色，强调主操作
- 拖拽区域：虚线边框，上传时高亮

---

## 6. 错误处理

| 场景 | 用户提示 |
|------|----------|
| 文件太大 | "图片最大 10MB" |
| 格式不支持 | "请上传 JPG/PNG/WEBP 图片" |
| API Key 未配置 | "服务暂不可用，请联系管理员" |
| API 调用失败 | "处理失败，请重试" |
| 额度用完 | "今日额度已用完（50/50），明天再来" |

---

## 7. 交付物

1. `bg-remover/` 前端代码（静态页面）
2. `bg-remover/workers/` Cloudflare Worker 代码
3. 本文档
4. 部署指南（可选）

---

## 8. 后续迭代方向

- 批量上传
- 自选背景色
- 历史记录（Cloudflare KV）
- Stripe 付费解锁更多额度
