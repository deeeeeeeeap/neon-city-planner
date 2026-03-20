import { useState } from 'react';
import { submitScore } from '../api/leaderboard';
import { calculateScore } from '../game/engine';
import type { Resources } from '../types';

interface GameOverModalProps {
  resources: Resources;
  playerName: string;
  onRestart: () => void;
}

function getRankTitle(score: number) {
  if (score >= 3200) {
    return '滨海大师';
  }

  if (score >= 2200) {
    return '平衡规划师';
  }

  if (score >= 1200) {
    return '新锐市长';
  }

  return '起步中的城市';
}

export const GameOverModal = ({ resources, playerName, onRestart }: GameOverModalProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finalScore = calculateScore(resources);
  const rankTitle = getRankTitle(finalScore);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      await submitScore({
        name: playerName,
        score: finalScore,
        population: resources.population,
        happiness: resources.happiness,
        pollution: resources.pollution,
      });

      setSubmitted(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '成绩提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div
        className="paper-panel"
        style={{
          width: 'min(640px, 100%)',
          padding: 'clamp(24px, 4vw, 38px)',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span className="brand-badge">Final Report</span>
          <h2 style={{ marginTop: '16px', fontSize: 'clamp(2.1rem, 5vw, 3.2rem)' }}>规划结束</h2>
          <p style={{ marginTop: '10px', color: 'var(--color-ink-light)', lineHeight: 1.7 }}>
            市长 <strong style={{ color: 'var(--color-ink)' }}>{playerName}</strong>，这十回合的城市答卷已经生成。
            当前评级为 <strong style={{ color: 'var(--color-accent-strong)' }}>{rankTitle}</strong>。
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '14px',
              marginTop: '24px',
            }}
          >
            <div className="paper-panel" style={{ padding: '18px', background: 'rgba(244, 234, 217, 0.6)' }}>
              <span style={{ color: 'var(--color-ink-light)', fontSize: '0.82rem' }}>最终得分</span>
              <strong style={{ display: 'block', marginTop: '8px', fontSize: '2rem' }}>{finalScore}</strong>
            </div>
            <div className="paper-panel" style={{ padding: '18px', background: 'rgba(244, 234, 217, 0.6)' }}>
              <span style={{ color: 'var(--color-ink-light)', fontSize: '0.82rem' }}>最终人口</span>
              <strong style={{ display: 'block', marginTop: '8px', fontSize: '2rem' }}>{resources.population}</strong>
            </div>
            <div className="paper-panel" style={{ padding: '18px', background: 'rgba(244, 234, 217, 0.6)' }}>
              <span style={{ color: 'var(--color-ink-light)', fontSize: '0.82rem' }}>城市幸福</span>
              <strong
                style={{ display: 'block', marginTop: '8px', fontSize: '2rem', color: 'var(--color-success)' }}
              >
                {resources.happiness}
              </strong>
            </div>
            <div className="paper-panel" style={{ padding: '18px', background: 'rgba(244, 234, 217, 0.6)' }}>
              <span style={{ color: 'var(--color-ink-light)', fontSize: '0.82rem' }}>环境污染</span>
              <strong
                style={{ display: 'block', marginTop: '8px', fontSize: '2rem', color: 'var(--color-danger)' }}
              >
                {resources.pollution}
              </strong>
            </div>
          </div>

          {error && (
            <p style={{ marginTop: '18px', color: 'var(--color-danger)', fontWeight: 700 }}>
              {error}
            </p>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '12px',
              marginTop: '24px',
            }}
          >
            <button
              type="button"
              className="paper-action"
              onClick={handleSubmit}
              disabled={submitting || submitted}
              style={{ minHeight: '54px' }}
            >
              {submitted ? '成绩已提交' : submitting ? '正在提交...' : '提交到排行榜'}
            </button>

            <button type="button" className="btn-primary" onClick={onRestart} style={{ minHeight: '54px' }}>
              再来一局
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
