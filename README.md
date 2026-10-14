# 观舌护齿 · 牙齿亚健康早筛系统

融合中医舌象辨证与牙齿外观识别的牙齿亚健康早筛系统。用户上传**舌象照片 + 牙齿现状照片**，系统通过双分支视觉分析 + 中医舌齿辨证融合，输出风险等级、可视化报告与个性化养护方案，并提供健康档案追溯与 AI 咨询。

> 本结果由 AI 图像识别与中医辨证规则综合生成，**非医学诊断**，仅供日常口腔健康参考。

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Vue 3 + TypeScript + Vite + Vue Router + Pinia + Axios（手写 CSS，无 UI 库） |
| 后端 | Node.js + Express + Mongoose(MongoDB) + JWT + Multer |
| AI | 智谱 GLM：`glm-4v`（图像分析）、`glm-4`（咨询对话与文案生成） |

## 目录结构

```
oral-care-ai/
├─ src/                        # 前端
│  ├─ api/                     # 接口封装（request.ts 为 axios 实例）
│  ├─ components/              # AppLayout / AppSidebar / ReportPanel / ScoreRing / TrendChart ...
│  ├─ views/                   # 8 个页面组件
│  ├─ stores/                  # Pinia（user）
│  ├─ composables/             # useToast
│  ├─ utils/                   # 校验 / 日期格式化 / 图片压缩
│  ├─ types/                   # 全局 TS 类型
│  └─ styles/                  # global.css + variables.css
└─ server/                     # 后端
   ├─ routers/                 # auth / profile / stats / analyze / records / articles / assistant / checkin
   ├─ models/                  # User / Record / Article / Conversation / Checkin
   ├─ services/                # zhipu（模型调用）/ analyzeService（编排）/ chatService（对话与文案）
   ├─ knowledge/rules.js       # 中医舌齿辨证规则 + 本地打分（模型故障时的兜底）
   ├─ utils/                   # json 容错解析 / 校验 / 日期与连续打卡
   ├─ scripts/seed.js          # 种子数据（演示账号 + 科普文章）
   └─ uploads/                 # 用户图片（按 userId 分目录，不入库）
```

## 快速开始

前置：Node ≥ 22.18（或 ≥ 24.12）、本机 MongoDB 已启动（默认 `mongodb://127.0.0.1:27017`）。

### 1. 后端

```bash
cd server
cp .env.example .env        # 填入 ZHIPU_API_KEY 等
npm install
npm run seed                # 创建演示账号与 10 篇科普文章（可重复执行）
npm run dev                 # http://localhost:3000
```

`.env` 关键项：

```
MONGO_URI=mongodb://127.0.0.1:27017/oral_care
JWT_SECRET=<一串足够长的随机字符串>
ZHIPU_API_KEY=<你的智谱 key>        # 只放这里，切勿写进源码或提交仓库
ZHIPU_VISION_MODEL=glm-4v
ZHIPU_CHAT_MODEL=glm-4
ZHIPU_ENABLED=true                  # 置 false 则完全走本地规则兜底
```

### 2. 前端

```bash
npm install
npm run dev                 # http://localhost:5173
```

前端一律请求同源 `/api`，由 Vite 代理到 `http://localhost:3000`（见 `vite.config.ts`）。

**演示账号**：`13800000000` / `123456`

## 接口一览

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/auth/register` | 注册（真实姓名 / 手机号 / 密码） |
| POST | `/api/auth/login` | 登录，返回 token 与用户信息 |
| GET / PUT | `/api/me` | 获取 / 更新个人资料 |
| GET | `/api/stats/overview` | 首页聚合：今日状态、打卡天数、待办、贴士 |
| POST | `/api/analyze` | 双图分析（multipart：`tongue`、`teeth`）→ 完整报告并存档 |
| GET | `/api/records` | 筛查记录分页列表 |
| GET | `/api/records/trend?days=30` | 评分趋势 |
| GET / DELETE | `/api/records/:id` | 记录详情 / 删除 |
| GET | `/api/articles`、`/api/articles/:id` | 科普文章列表 / 详情 |
| GET / POST | `/api/conversations` | 会话列表 / 新建 |
| GET / DELETE | `/api/conversations/:id` | 会话详情 / 删除 |
| POST | `/api/conversations/:id/messages` | 发送消息（调用 glm-4） |
| POST | `/api/checkins`、GET `/api/checkins/streak` | 打卡 / 查询连续天数 |
| GET | `/api/health` | 健康检查（含 AI 启用状态与模型名） |

## 设计要点

- **分数与等级由本地规则计算**，大模型只负责「看图描述」。规则见 `server/knowledge/rules.js`（齿痕舌↔脾虚湿盛↔牙龈浮肿；厚腻苔↔口腔湿热↔牙菌斑/牙结石；舌色暗红↔气血淤滞↔牙周循环差；舌面裂纹↔阴液亏虚↔牙齿敏感）。避免模型措辞波动导致等级跳变。
- **多级降级**：模型超时/限流 → 退避重试一次 → 仍失败则走本地规则兜底，响应始终带 `aiEnhanced` 标记，前端据此显示「AI 模型」或「本地规则兜底」，不会伪造 AI 结果。
- **JSON 容错解析**：`server/utils/json.js` 依次尝试 ```json 围栏、括号平衡匹配、整体解析，失败返回 null 并做字段白名单校验。
- **密钥不下发前端**：所有模型调用仅在 Express 内；前端只访问 `/api`。
- **图片压缩**：客户端 canvas 压到长边 1280 / JPEG 0.82（规避 GLM-4V 的 base64 体积限制），服务端再以 8MB / 仅图片类型兜底。

## 已知边界

- 作品说明中的「双分支 CNN」在本次实现中由视觉大模型承担识别环节；`analyzeService` 已把双分支提取抽象为 `extractTongue` / `extractTeeth`，将来替换为本地 CNN 微服务时**接口协议无需改动**。
- 报告中的图像标注（`annotations`）字段已预留，具备定位能力后再填充，当前不伪造标注框。
