# 大展宏涂 · 在线协作涂鸦画板（通用版）

一个支持**多人实时协作涂鸦**的 Web 画板。用户注册登录后可创建项目、与朋友在同一块画布上作画；每人只能删除自己的笔迹，管理员拥有最高权限；支持将画布截图发布到「涂鸦精选」并点赞、评论；内置「我的」「后台管理」「网站反馈」模块。

- 前端：React 19 + Vite 7 + Tailwind CSS v4 + Radix UI
- 后端：NestJS 10 + Drizzle ORM
- 数据库：PostgreSQL（>= 14）
- 鉴权：JWT（Access Token），密码 bcrypt 加密

> 本仓库为**通用部署版**：不依赖任何私有 SDK 与平台账号体系，可直接部署到自建服务器（宝塔、Docker、裸机均可）。

---

## 功能总览

| 模块 | 说明 |
| --- | --- |
| 主页 | 封面大图 + 标题「与小伙伴们共度涂鸦娱乐，大展宏涂」+ 简介 + 功能预览，向下滚动展示 |
| 一起绘画 | 创建/加入项目，多人同画布协作涂鸦，笔迹实时同步（轮询拉取） |
| 涂鸦精选 | 展示用户与管理员上传的画布截图，支持点赞、留言、相互评论；被评论触发站内消息提醒 |
| 我的 | 查看我创建/参与的项目、我上传的精选图、我的消息通知 |
| 后台管理 | 管理员专用：项目删除/隐藏/置顶、精选删除/置顶、评论删除、反馈处理 |
| 网站反馈 | 游客与用户均可提交反馈 |
| 注册登录 | 自定义账号密码（**无需邮箱**），支持昵称 |

## 权限模型

| 角色 | 能力 |
| --- | --- |
| 游客（未登录） | 浏览主页、项目列表、画板（只读）、涂鸦精选、提交反馈 |
| 普通用户 | 创建项目、在项目内涂鸦、删除**自己的**笔迹、上传精选图、点赞/评论、接收消息提醒 |
| 管理员 | 普通用户全部能力 + 删除任意笔迹/评论/精选/项目、隐藏与置顶项目、置顶精选、处理反馈 |

### 管理员账号怎么来？

无需预置账号，满足任一条件即可成为管理员：

1. **环境变量 `ADMIN_USERNAME`**：逗号分隔的账号名列表，注册这些账号时自动授予管理员角色（推荐）；
2. **系统首个注册用户**：部署后第一个注册的用户自动成为管理员（适合单机小范围使用）。

---

## 部署到宝塔 Linux 面板（完整 12 步）

以下以 CentOS 7.9+/Debian 12/Ubuntu 22.04 的宝塔面板为例，服务器建议 2 核 4G 及以上。

### 准备

1. 在云厂商控制台创建服务器（建议选 Debian 12 / Ubuntu 22.04），安全组放行 **22 / 80 / 443** 端口。
2. 安装宝塔面板并登录（首次安装会输出面板地址与账号密码）。
3. 在宝塔「软件商店」安装：**Nginx**、**Node.js（>= 22）**、**PM2 管理器**、**PostgreSQL（>= 14）**、**Git**。

### 1. 创建数据库与用户

在宝塔「数据库」中创建数据库 `graffiti`，并创建同名用户 `graffiti`，密码自定（记好）。
也可以直接在 PostgreSQL 命令行执行：

```sql
CREATE USER graffiti WITH PASSWORD '你的强密码';
CREATE DATABASE graffiti OWNER graffiti;
GRANT ALL PRIVILEGES ON DATABASE graffiti TO graffiti;
```

### 2. 导入数据库表结构

两种方式任选其一：

- **方式 A（推荐）**：在宝塔数据库面板选择 `graffiti` → 导入 `server/db/init.sql`；
- **方式 B**：命令行执行 `psql -U graffiti -d graffiti -f /www/wwwroot/Graffiti/server/db/init.sql`。

### 3. 拉取代码

```bash
cd /www/wwwroot
rm -rf Graffiti   # 若目录已存在先清空
GIT_ASKPASS= git clone -b main https://github.com/Fengxiayi/Graffiti.git
cd Graffiti
```

### 4. 配置环境变量

```bash
cp .env.example .env
vim .env
```

必改项：

| 变量 | 说明 | 示例 |
| --- | --- | --- |
| `PORT` | 后端端口 | `3000` |
| `DATABASE_URL` | PostgreSQL 连接串 | `postgres://graffiti:你的密码@127.0.0.1:5432/graffiti` |
| `JWT_SECRET` | JWT 签名密钥，**务必改为随机长字符串** | `openssl rand -hex 32` 生成 |
| `JWT_EXPIRES_IN` | 登录态有效期 | `7d` |
| `ADMIN_USERNAME` | 管理员账号（逗号分隔） | `admin` |

### 5. 安装依赖

```bash
cd /www/wwwroot/Graffiti
npm install
```

> 需要 Node >= 22。若版本过低：`curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt-get install -y nodejs`。

### 6. 构建

```bash
npm run build
```

产物：后端 `dist/server/main.js`，前端 `client/dist/`。

### 7. 启动后端（PM2）

```bash
cd /www/wwwroot/Graffiti
pm2 start scripts/start.sh --name graffiti
pm2 save
pm2 startup   # 按提示执行输出的命令，实现开机自启
```

验证：`curl http://127.0.0.1:3000/api/auth/me` 应返回 401（JSON）。

### 8. 配置 Nginx 反向代理

在宝塔「网站」→「添加站点」创建站点（域名或服务器 IP），然后在「配置文件」中替换为：

```nginx
server {
    listen 80;
    server_name your-domain.com;   # 改为你的域名或 IP

    client_max_body_size 20m;

    # 前端静态资源
    location / {
        root /www/wwwroot/Graffiti/client/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API
    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 9. 开通 HTTPS（可选）

宝塔「站点」→「SSL」→ Let's Encrypt 免费证书，申请后强制 HTTPS。

### 10. 首次访问与创建管理员

浏览器打开站点 → 点击「登录/注册」→ **注册第一个账号**（该账号自动成为管理员，或使用 `ADMIN_USERNAME` 中配置的账号名注册）。注册后导航栏出现「管理后台」入口。

### 11. 防火墙放行

若面板「安全」中开启了防火墙，放行 80/443；云厂商安全组同样放行。

### 12. 日常维护

| 操作 | 命令 |
| --- | --- |
| 重启后端 | `pm2 restart graffiti` |
| 查看日志 | `pm2 logs graffiti` |
| 更新代码 | `cd /www/wwwroot/Graffiti && git pull && npm install && npm run build && pm2 restart graffiti` |
| 备份数据库 | 宝塔「数据库」→ 备份，或 `pg_dump -U graffiti graffiti > backup.sql` |

---

## 本地开发

```bash
npm install
cp .env.example .env   # 修改 DATABASE_URL 指向本地 PostgreSQL
npm run dev            # 后端 3000 + 前端 5173（/api 已代理）
```

常用命令：

```bash
npm run type:check     # 前后端类型检查
npm run lint           # ESLint
npm run gen:db-schema  # 变更 schema 后生成迁移（drizzle-kit generate）
npm run db:push        # 开发期直接同步表结构（drizzle-kit push）
```

## API 一览（节选）

| 方法 | 路径 | 鉴权 | 说明 |
| --- | --- | --- | --- |
| POST | /api/auth/register | 公开 | 注册（自定义账号密码） |
| POST | /api/auth/login | 公开 | 登录，返回 JWT |
| GET | /api/auth/me | 登录 | 当前用户信息 |
| GET | /api/projects | 公开 | 项目列表（分页） |
| POST | /api/projects | 登录 | 创建项目 |
| GET | /api/projects/:id | 公开 | 项目详情 |
| GET | /api/strokes/:projectId | 公开 | 项目笔迹（游标分页） |
| POST | /api/strokes | 登录 | 新增笔迹 |
| DELETE | /api/strokes/:id | 登录 | 删除笔迹（管理员可删任意） |
| GET | /api/gallery | 公开 | 精选列表 |
| POST | /api/gallery | 登录 | 上传精选图 |
| POST | /api/gallery/:id/like | 登录 | 点赞/取消 |
| GET | /api/gallery/:id/comments | 公开 | 评论列表 |
| POST | /api/gallery/comments | 登录 | 发表评论 |
| GET | /api/notifications | 登录 | 我的消息 |
| POST | /api/feedback | 公开 | 提交反馈 |
| GET | /api/admin/projects | 管理员 | 管理项目列表 |
| PATCH | /api/admin/projects/:id/hidden | 管理员 | 隐藏/显示项目 |
| PATCH | /api/admin/projects/:id/pinned | 管理员 | 置顶/取消项目 |
| DELETE | /api/admin/projects/:id | 管理员 | 删除项目 |
| DELETE | /api/admin/gallery/comments/:id | 管理员 | 删除任意评论 |
| GET | /api/admin/feedbacks | 管理员 | 反馈列表 |
| PATCH | /api/admin/feedbacks/:id/status | 管理员 | 更新反馈状态 |

## 技术说明

- **协作同步**：当前实现为轻量级轮询同步（画板每数秒拉取新笔迹），适合中小规模协作；如需实时 WebSocket 可自行扩展。
- **笔迹删除权限**：后端按 JWT 中的角色判定，管理员可删任意笔迹，普通用户仅可删自己的。
- **截图上传**：画布截图先转为 dataURL/base64 存入 `image_url`；生产环境建议接入对象存储（OSS/COS）替换。
- **密码安全**：bcryptjs 加盐哈希，不存明文。

## 目录结构

```
├── client/            # React 前端
│   └── src/
│       ├── api/       # API 封装
│       ├── auth/      # 登录态（AuthContext）
│       ├── components/
│       ├── hooks/
│       ├── lib/       # axios 实例
│       └── pages/
├── server/            # NestJS 后端
│   ├── auth/          # 注册/登录/JWT/守卫
│   ├── database/      # Drizzle 连接与 schema
│   ├── db/            # init.sql 与迁移
│   └── modules/       # 业务模块
├── shared/            # 前后端共享类型
├── scripts/           # dev/build/start
├── .env.example
└── package.json
```
