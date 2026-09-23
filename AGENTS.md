# 大展宏涂 - 在线协作画板

## 应用概览

一个支持多人实时协作涂鸦的在线画板网站，包含项目管理、涂鸦精选社区、管理员后台等功能模块。

## 设计规范

### 色彩系统

以橙色为主色调，体现创意、活力、艺术感：

- **主色 primary**: `hsl(24 95% 55%)`（活力橙）
- **主色前景**: `hsl(0 0% 100%)`
- **辅助色 accent**: `hsl(280 85% 60%)`（创意紫）
- **背景**: `hsl(30 30% 98%)`（暖米白）
- **卡片背景**: `hsl(0 0% 100%)`
- **文字主色**: `hsl(24 20% 20%)`
- **文字次色**: `hsl(24 10% 45%)`
- **边框**: `hsl(24 15% 90%)`

### 排版层级

- **Hero 标题**: text-5xl md:text-6xl font-bold tracking-tight
- **区块标题**: text-3xl font-bold tracking-tight
- **卡片标题**: text-xl font-semibold
- **正文**: text-base leading-7
- **辅助文字**: text-sm text-muted-foreground

### 间距系统

- 页面水平内边距: px-6 md:px-10 lg:px-16
- 区块垂直间距: py-16 md:py-24
- 卡片内边距: p-6
- 元素间距: gap-6

### 圆角与阴影

- 卡片圆角: rounded-2xl
- 按钮圆角: rounded-full
- 卡片阴影: shadow-lg hover:shadow-xl transition-shadow

### 设计风格

- 温暖、创意、艺术感的视觉基调
- 手绘风格装饰元素
- 渐变背景与彩色涂鸦点缀
- 圆润的卡片与按钮造型
- 柔和的阴影与过渡动画

## 架构概览

### 后端模块

- `projects` - 项目管理（创建、列表、协作成员、置顶/隐藏/删除）
- `strokes` - 画布笔迹存储与同步
- `gallery` - 涂鸦精选（截图上传、点赞、评论）
- `notifications` - 消息提醒
- `feedback` - 网站反馈
- `admin` - 管理员后台

### 前端页面

- `HomePage` - 主页（封面、功能介绍）
- `PaintPage` - 一起绘画（项目列表 + 画板）
- `GalleryPage` - 涂鸦精选
- `MinePage` - 我的
- `FeedbackPage` - 网站反馈
- `AdminPage` - 管理员后台

### 数据库表

- `projects` - 项目表
- `project_members` - 项目成员表
- `strokes` - 笔迹表
- `gallery_items` - 涂鸦精选表
- `gallery_likes` - 精选点赞表
- `gallery_comments` - 精选评论表
- `notifications` - 消息通知表
- `feedbacks` - 反馈表
