import { useState } from 'react';
import type { Resources } from '../types';
import { MAX_TURNS } from '../game/constants';

interface HUDProps {
  resources: Resources;
}

interface MetricDef {
  key: keyof Pick<Resources, 'budget' | 'population' | 'happiness' | 'pollution'>;
  icon: string;
  label: string;
  format: (v: number) => string;
  formula: string;
}

const METRICS: MetricDef[] = [
  {
    key: 'budget',
    icon: '预算',
    label: '预算',
    format: (v) => `$${v}`,
    formula:
      '每回合收入 = 商业收入 + 工业收入 − 公园维护费\n' +
      '● 商业收入 = (50 + 相邻住宅数×16) × 道路效率\n' +
      '  道路效率：距离1=100%, 2=80%, 3=50%, 其他=20%\n' +
      '● 工业收入 = 距道路1格→300, 否则→50\n' +
      '● 公园维护 = 每座公园×10/回合',
  },
  {
    key: 'population',
    icon: '人口',
    label: '人口',
    format: (v) => `${v}`,
    formula:
      '每住宅格每回合独立计算增长\n' +
      '● 幸福≥40：增长 = (幸福−40)×0.25×交通系数×空位系数\n' +
      '● 幸福<40：流失 2 人/回合\n' +
      '● 每格人口上限 50\n' +
      '● 交通系数：距路1格=1.0, 2格=0.8, 其他=0.2',
  },
  {
    key: 'happiness',
    icon: '幸福',
    label: '幸福',
    format: (v) => `${v}`,
    formula:
      '每住宅格本地幸福（独立计算后求和）\n' +
      '● 基础 30\n' +
      '● 相邻公园 +15 / 座\n' +
      '● 相邻海洋 +15（近海 +10）\n' +
      '● 相邻工厂 −40 / 座\n' +
      '● 高密度(≥4邻居住宅): 配套≥2→+10, 否则→−15\n' +
      '● 距路>2 → −10, >3 → 再−30\n' +
      '● 全局扣减：pollution/5 × 住宅数',
  },
  {
    key: 'pollution',
    icon: '污染',
    label: '污染',
    format: (v) => `${v}`,
    formula:
      '每回合更新：\n' +
      '● 新增 = 工业区数量 × 3\n' +
      '● 恢复 = 1 + 公园数量 × 2\n' +
      '● 净值 = max(0, 当前 + 新增 − 恢复)',
  },
];

export const HUD = ({ resources }: HUDProps) => {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  return (
    <div className="hud-container">
      {METRICS.map((metric) => {
        const value = resources[metric.key];
        const tone =
          metric.key === 'pollution'
            ? value > 20
              ? 'var(--color-danger)'
              : 'inherit'
            : metric.key === 'happiness'
              ? value < 40
                ? 'var(--color-danger)'
                : 'var(--color-success)'
              : 'inherit';

        return (
          <div
            key={metric.key}
            className="paper-panel hud-item float-effect"
            style={{ position: 'relative', cursor: 'help' }}
            onMouseEnter={() => setHoveredKey(metric.key)}
            onMouseLeave={() => setHoveredKey(null)}
          >
            <div
              style={{
                minWidth: '42px',
                height: '42px',
                borderRadius: '14px',
                display: 'grid',
                placeItems: 'center',
                background: 'rgba(244, 234, 217, 0.76)',
                fontSize: '0.82rem',
                fontWeight: 800,
              }}
            >
              {metric.icon}
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ color: 'var(--color-ink-light)', fontSize: '0.78rem' }}>{metric.label}</div>
              <strong style={{ display: 'block', marginTop: '4px', fontSize: '1.2rem', color: tone }}>
                {metric.format(value)}
              </strong>
            </div>

            {/* 悬停公式提示 */}
            {hoveredKey === metric.key && (
              <div className="formula-tooltip">
                <div className="formula-tooltip-title">{metric.label} 计算公式</div>
                <pre className="formula-tooltip-body">{metric.formula}</pre>
              </div>
            )}
          </div>
        );
      })}

      <div
        className="paper-panel hud-item float-effect"
        style={{ background: 'linear-gradient(180deg, #48423c, #2f2c28)', color: '#fffaf5', cursor: 'help', position: 'relative' }}
        onMouseEnter={() => setHoveredKey('turn')}
        onMouseLeave={() => setHoveredKey(null)}
      >
        <div
          style={{
            minWidth: '42px',
            height: '42px',
            borderRadius: '14px',
            display: 'grid',
            placeItems: 'center',
            background: 'rgba(255, 255, 255, 0.12)',
            fontSize: '0.82rem',
            fontWeight: 800,
          }}
        >
          回合
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ color: 'rgba(255, 250, 245, 0.72)', fontSize: '0.78rem' }}>城市年度</div>
          <strong style={{ display: 'block', marginTop: '4px', fontSize: '1.2rem' }}>
            {resources.turn} / {MAX_TURNS}
          </strong>
        </div>

        {hoveredKey === 'turn' && (
          <div className="formula-tooltip">
            <div className="formula-tooltip-title">回合机制</div>
            <pre className="formula-tooltip-body">
              {'共 10 回合，分两阶段\n● 前 5 回合：建设期，可放置所有建筑\n● 后 5 回合：观察期，只可拆除\n\n最终得分 = 人口×10 + 预算×0.1\n  − 污染×10 + 幸福调整\n\n幸福调整：\n  幸福<人口 → − (人口−幸福)×10\n  幸福≥人口 → + (幸福−人口)×10\n  幸福上限 = 人口×2'}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
