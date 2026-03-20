import type { CellType, GamePhase } from '../types';
import { BUILDING_COSTS, CONSTRUCTION_PHASE_END, MAX_TURNS } from '../game/constants';

interface SidebarProps {
  selectedTool: CellType;
  onSelectTool: (tool: CellType) => void;
  onEndTurn: () => void;
  phase: GamePhase;
  turn: number;
}

const TOOLS: { type: CellType; symbol: string; name: string; desc: string; formula: string }[] = [
  {
    type: 'RESIDENTIAL',
    symbol: '住',
    name: '住宅区',
    desc: '增加人口，幸福会受到周边设施和污染影响。',
    formula:
      '建造费 $100\n' +
      '● 每格上限 50 人\n' +
      '● 基础幸福 30\n' +
      '● 相邻公园 +15, 海洋 +15\n' +
      '● 相邻工厂 −40\n' +
      '● 幸福≥40 时增长, <40 时流失 2 人\n' +
      '● 增长 = (幸福−40)×0.25×道路系数×空位系数',
  },
  {
    type: 'COMMERCIAL',
    symbol: '商',
    name: '商业区',
    desc: '依赖住宅与道路，提供稳定预算收入。',
    formula:
      '建造费 $200\n' +
      '● 收入 = (50 + 相邻住宅数×16) × 道路效率\n' +
      '● 道路效率: 距路1格=100%, 2格=80%,\n  3格=50%, 更远=20%\n' +
      '● 住宅越多、离路越近收入越高',
  },
  {
    type: 'INDUSTRIAL',
    symbol: '工',
    name: '工业区',
    desc: '高收益，但会持续制造污染压力。',
    formula:
      '建造费 $300\n' +
      '● 收入: 距路1格→300, 否则→50\n' +
      '● 每座每回合 +3 污染\n' +
      '● 相邻住宅幸福 −40, 影响很大\n' +
      '● 建议远离住宅区',
  },
  {
    type: 'PARK',
    symbol: '园',
    name: '公园',
    desc: '提升幸福并帮助城市恢复环境。',
    formula:
      '建造费 $150\n' +
      '● 维护费 10/回合\n' +
      '● 相邻住宅幸福 +15\n' +
      '● 每回合减少 2 点污染\n' +
      '● 高密度区配套可额外 +10 幸福',
  },
  {
    type: 'ROAD',
    symbol: '路',
    name: '道路',
    desc: '连接建筑，改善效率与增长速度。',
    formula:
      '建造费 $50\n' +
      '● 影响商业/工业收入效率\n' +
      '● 影响住宅人口增长速度\n' +
      '● 距路>2 住宅幸福 −10\n  距路>3再 −30\n' +
      '● 道路距离由 BFS 计算最短路径',
  },
  {
    type: 'DEMOLISH',
    symbol: '拆',
    name: '拆除',
    desc: '拆掉现有建筑，为后续调整腾出空间。',
    formula: '费用 $50\n● 可在任何阶段使用\n● 观察期唯一可用操作',
  },
];

export const Sidebar = ({ selectedTool, onSelectTool, onEndTurn, phase, turn }: SidebarProps) => {
  const stageLabel = turn > CONSTRUCTION_PHASE_END ? '发展观察期' : '建设窗口期';
  const stageHint =
    turn > CONSTRUCTION_PHASE_END
      ? '新建已关闭，仅可拆除并观察城市结算。'
      : '仍可新建建筑，优先铺路并补足配套。';
  const progress = Math.min((turn / MAX_TURNS) * 100, 100);

  return (
    <div
      className="paper-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '20px',
      }}
    >
      <div style={{ position: 'relative', zIndex: 1 }}>
        <span className="brand-badge">Planner Console</span>
        <h2 style={{ marginTop: '14px', fontSize: '2rem' }}>规划工具</h2>
        <p style={{ marginTop: '10px', color: 'var(--color-ink-light)', lineHeight: 1.65 }}>
          {stageLabel}
          <br />
          {stageHint}
        </p>

        <div style={{ marginTop: '18px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
              fontSize: '0.84rem',
              color: 'var(--color-ink-light)',
            }}
          >
            <span>{phase === 'SIMULATION' ? '模拟阶段' : '建设阶段'}</span>
            <strong style={{ color: 'var(--color-ink)' }}>
              {turn} / {MAX_TURNS}
            </strong>
          </div>

          <div
            style={{
              height: '10px',
              borderRadius: '999px',
              overflow: 'hidden',
              background: 'rgba(94, 70, 44, 0.08)',
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                borderRadius: '999px',
                background: 'linear-gradient(90deg, #d8b16d, var(--color-accent))',
              }}
            />
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'grid',
          gap: '12px',
          marginTop: '22px',
          flex: '1 1 auto',
          overflowY: 'auto',
        }}
      >
        {TOOLS.map((tool) => {
          const cost = BUILDING_COSTS[tool.type as keyof typeof BUILDING_COSTS];
          const isSelected = selectedTool === tool.type;
          const isDisabled = turn > CONSTRUCTION_PHASE_END && tool.type !== 'DEMOLISH';

          return (
            <button
              key={tool.type}
              type="button"
              className="float-effect sidebar-tool-btn"
              disabled={isDisabled}
              onClick={() => onSelectTool(tool.type)}
              title={tool.formula}
              style={{
                display: 'grid',
                gridTemplateColumns: '56px 1fr auto',
                gap: '12px',
                alignItems: 'center',
                padding: '14px',
                borderRadius: '20px',
                border: isSelected ? '1px solid rgba(94, 70, 44, 0.24)' : '1px solid transparent',
                background: isSelected ? 'rgba(244, 234, 217, 0.72)' : 'rgba(255, 250, 243, 0.56)',
                opacity: isDisabled ? 0.45 : 1,
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '18px',
                  display: 'grid',
                  placeItems: 'center',
                  background: 'rgba(255, 255, 255, 0.7)',
                  fontWeight: 800,
                }}
              >
                {tool.symbol}
              </div>

              <div>
                <strong style={{ display: 'block', fontSize: '1rem' }}>{tool.name}</strong>
                <span
                  style={{
                    display: 'block',
                    marginTop: '5px',
                    color: 'var(--color-ink-light)',
                    lineHeight: 1.5,
                  }}
                >
                  {tool.desc}
                </span>
              </div>

              <strong style={{ fontSize: '0.94rem', color: 'var(--color-accent-strong)' }}>${cost}</strong>
            </button>
          );
        })}
      </div>

      <div style={{ position: 'relative', zIndex: 1, marginTop: '18px' }}>
        <button type="button" className="btn-primary" style={{ width: '100%' }} onClick={onEndTurn}>
          结束回合 {turn} / {MAX_TURNS}
        </button>
      </div>
    </div>
  );
};
