# 大展宏涂 · 在线协作涂鸦画板

> 与小伙伴们共度涂鸦娱乐，大展宏涂 🎨

一个支持多人实时协作涂鸦的在线画板网站：注册登录、项目管理、多人协作画布、涂鸦精选社区、消息提醒、管理员后台，一应俱全。

## ✨ 功能特性

### 用户体系
- 注册 / 登录（平台账号体系）
- 未登录用户仅可浏览主页、项目列表与涂鸦精选
- 登录后可创建项目、参与涂鸦、上传精选、发表评论

### 一起绘画（核心画板）
- 创建绘画项目，支持多人共同在同一个画布上涂鸦
- 画笔 / 橡皮、丰富颜色、粗细可调
- **每 2 秒轮询同步**伙伴的新笔迹，实现近似实时的协作体验
- 笔迹按用户隔离：**只能删除自己绘制的笔迹**（双击笔迹删除 / 一键清空我的笔迹）
- 管理员拥有最高权限，可删除任意笔迹
- 支持分享项目链接邀请好友

### 涂鸦精选
- 用户与管理员均可将当前画布截图存入「涂鸦精选」
- 支持点赞、留言、相互回复评论
- **被评论时触发消息提醒**（导航栏铃铛角标 + 未读数）
- 管理员可置顶 / 删除精选作品、删除任意评论

### 管理员后台（`/admin`）
- **项目管理**：删除、隐藏、置顶项目
- **精选管理**：删除、置顶精选作品
- **反馈管理**：查看并处理用户反馈（待处理 / 处理中 / 已完成）

### 页面结构
| 导航 | 说明 |
|---|---|
| 主页 `/` | 封面大图 + 标题「与小伙伴们共度涂鸦娱乐，大展宏涂」+ 简介，向下滚动展示功能介绍与创作预览 |
| 一起绘画 `/paint` | 项目列表（创建 / 搜索 / 进入画板） |
| 涂鸦精选 `/gallery` | 精选作品墙，点赞、评论、详情弹窗 |
| 我的 `/mine` | 我创建 / 参与的项目、我上传的精选作品 |
| 网站反馈 `/feedback` | 提交反馈（内容 + 联系方式） |
| 管理后台 `/admin` | 管理员专属管理页 |

## 🏗️ 技术架构

基于 **妙搭（Lark Apaas）Fullstack 全栈模板**（NestJS + React + Drizzle ORM + PostgreSQL）：

```
Graffiti/
├── client/                        # 前端（React 19 + Vite + Tailwind CSS v4）
│   ├── index.html
│   └── src/
│       ├── app.tsx                # 路由配置
│       ├── components/            # Layout、ui 组件库（shadcn 风格）、business-ui
│       ├── pages/                 # HomePage / PaintPage / GalleryPage / MinePage / FeedbackPage / AdminPage / NotFound
│       ├── api/                   # 后端接口封装（projects/strokes/gallery/notifications/feedback/admin）
│       ├── hooks/                 # useCurrentUser
│       └── lib/                   # utils、site-config
├── server/                        # 后端（NestJS）
│   ├── main.ts / app.module.ts
│   ├── database/schema.ts         # 8 张业务表（Drizzle）
│   ├── common/                    # 全局异常过滤器、响应码、业务异常
│   └── modules/
│       ├── user/                  # 当前用户
│       ├── projects/              # 项目管理
│       ├── strokes/               # 笔迹存储与同步
│       ├── gallery/               # 涂鸦精选（点赞 / 评论 / 通知）
│       ├── notifications/         # 消息提醒
│       ├── feedback/              # 网站反馈
│       └── admin/                 # 管理员后台
└── shared/api.interface.ts        # 前后端共享类型
```

### 数据库表（8 张）
`projects` 项目 · `project_members` 项目成员 · `strokes` 笔迹 · `gallery_items` 精选作品 · `gallery_likes` 精选点赞 · `gallery_comments` 精选评论 · `notifications` 消息通知 · `feedbacks` 反馈

## 🚀 本地开发

```bash
# 1. 安装依赖（需 Node >= 22）
npm install

# 2. 生成数据库 schema（连接到平台数据库后）
npm run gen:db-schema

# 3. 启动开发服务（前后端并行）
npm run dev
```

> 说明：本项目基于妙搭（Lark Apaas）Fullstack 模板，`@lark-apaas/*` 系列依赖由平台提供，完整构建 / 发布需在妙搭平台环境中进行（`npm run build` → 平台构建发布）。

## 🔑 权限模型

| 操作 | 游客 | 普通用户 | 管理员 |
|---|---|---|---|
| 浏览主页 / 项目 / 精选 | ✅ | ✅ | ✅ |
| 创建 / 参与项目 | ❌ | ✅ | ✅ |
| 涂鸦（保存笔迹） | ❌ | ✅ | ✅ |
| 删除笔迹 | ❌ | 仅自己的 | 任意 |
| 上传精选 / 点赞 / 评论 | ❌ | ✅ | ✅ |
| 项目隐藏 / 置顶 / 删除 | ❌ | ❌ | ✅ |
| 精选删除 / 置顶 | ❌ | 仅自己的评论 | ✅ |
| 反馈处理 | ❌ | 提交 | 处理 |
