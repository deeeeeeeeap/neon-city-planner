# 🏙️ Paper City Planner — 纸模城市规划师

一款基于浏览器的 3D 城市规划教育小游戏。在 10 个回合内平衡预算、人口、幸福与污染，搭建一座有呼吸感的海岸城市。

![Paper City Planner](https://img.shields.io/badge/stack-React%20%2B%20Three.js-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ 特色功能

- **3D 可交互棋盘** — 基于 React Three Fiber 的 15×15 纸模风格沙盘，支持旋转、缩放、右键平移
- **智能道路系统** — 道路自动连接，支持直道、转弯、T 形、十字路口
- **建筑群组联动** — 相同类型建筑相邻时自动合并形态（尺寸放大、共享侧墙）
- **建筑朝向道路** — 建筑入口自动面向最近道路（全局曼哈顿距离搜索）
- **工厂冒烟特效** — 工业区烟囱带动态烟雾粒子动画
- **悬停公式说明** — 鼠标悬停 HUD 指标或工具栏，显示完整计算公式
- **海岸城市** — 右侧海洋区域，靠海住宅额外获得幸福加成
- **排行榜** — 基于 Cloudflare D1 的全球排行榜

## 🎮 游戏规则

| 阶段 | 回合 | 说明 |
|------|------|------|
| 建设期 | 1-5 | 可放置住宅、商业、工业、公园、道路 |
| 观察期 | 6-10 | 仅可拆除，观察城市自动结算 |

### 建筑类型

| 类型 | 费用 | 效果 |
|------|------|------|
| 🏠 住宅 | $100 | 增加人口，基础幸福 30 |
| 🏢 商业 | $200 | 收入 = (50 + 邻居住宅×16) × 道路效率 |
| 🏭 工业 | $300 | 距路1格收入 300，每回合 +3 污染 |
| 🌳 公园 | $150 | 邻居住宅 +15 幸福，每回合 -2 污染 |
| 🛤️ 道路 | $50 | 影响所有建筑效率 |

### 得分公式

```
最终得分 = 人口×10 + 预算×0.1 − 污染×10 + 幸福调整
```

## 🛠️ 技术栈

- **前端**: React 19 + TypeScript + Vite
- **3D 渲染**: React Three Fiber + @react-three/drei
- **状态管理**: Zustand
- **部署**: Cloudflare Workers + D1 数据库
- **样式**: 纯 CSS（纸模暖色系设计）

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 构建
npm run build

# 部署到 Cloudflare
npx wrangler deploy
```

## 📁 项目结构

```
src/
├── components/
│   ├── models/
│   │   └── buildings.tsx    # 3D 建筑模型（住宅/商业/工业/公园/道路）
│   ├── GameBoard.tsx        # 3D 棋盘场景（含朝向算法）
│   ├── HUD.tsx              # 顶部资源指标（含公式 tooltip）
│   ├── Sidebar.tsx          # 右侧工具栏
│   ├── StartScreen.tsx      # 开始界面
│   └── GameOverModal.tsx    # 结算弹窗
├── game/
│   ├── engine.ts            # 回合结算引擎
│   ├── builder.ts           # 建造规则校验
│   ├── grid.ts              # 道路距离 BFS
│   └── constants.ts         # 游戏常量
├── store/
│   └── useGameStore.ts      # Zustand 状态管理
├── App.tsx
├── index.css                # 全局样式
└── types.ts                 # TypeScript 类型定义
```

## 📄 License

MIT
