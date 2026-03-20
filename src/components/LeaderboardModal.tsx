import { useEffect, useState } from 'react';
import { fetchLeaderboard } from '../api/leaderboard';
import type { LeaderboardEntry } from '../api/leaderboard';

interface LeaderboardModalProps {
  onClose: () => void;
}

export const LeaderboardModal = ({ onClose }: LeaderboardModalProps) => {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchLeaderboard(10)
      .then((entries) => {
        if (!cancelled) {
          setData(entries);
        }
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(requestError instanceof Error ? requestError.message : '排行榜加载失败');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="modal-overlay">
      <div
        className="paper-panel"
        style={{
          width: 'min(760px, 100%)',
          maxHeight: '85vh',
          padding: 'clamp(24px, 4vw, 34px)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '18px',
          }}
        >
          <div>
            <span className="brand-badge">Top 10</span>
            <h2 style={{ marginTop: '14px', fontSize: 'clamp(2rem, 4vw, 2.8rem)' }}>排行榜</h2>
          </div>

          <button type="button" className="paper-action" onClick={onClose}>
            关闭
          </button>
        </div>

        <div style={{ position: 'relative', zIndex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div className="paper-panel" style={{ padding: '28px', textAlign: 'center', background: 'rgba(244, 234, 217, 0.48)' }}>
              正在读取排行榜...
            </div>
          ) : error ? (
            <div className="paper-panel" style={{ padding: '28px', color: 'var(--color-danger)', background: 'rgba(244, 234, 217, 0.48)' }}>
              {error}
            </div>
          ) : data.length === 0 ? (
            <div className="paper-panel" style={{ padding: '28px', color: 'var(--color-ink-light)', background: 'rgba(244, 234, 217, 0.48)' }}>
              还没有记录，成为第一位上榜的市长。
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--color-ink-light)' }}>
                  <th style={{ padding: '12px 10px' }}>排名</th>
                  <th style={{ padding: '12px 10px' }}>市长</th>
                  <th style={{ padding: '12px 10px' }}>得分</th>
                  <th style={{ padding: '12px 10px' }}>人口</th>
                  <th style={{ padding: '12px 10px' }}>幸福</th>
                  <th style={{ padding: '12px 10px' }}>污染</th>
                </tr>
              </thead>
              <tbody>
                {data.map((entry, index) => (
                  <tr key={entry.id} style={{ borderTop: '1px solid rgba(94, 70, 44, 0.08)' }}>
                    <td
                      style={{
                        padding: '16px 10px',
                        fontWeight: 800,
                        color: index < 3 ? 'var(--color-accent-strong)' : 'var(--color-ink)',
                      }}
                    >
                      {index + 1}
                    </td>
                    <td style={{ padding: '16px 10px', fontWeight: 700 }}>{entry.name}</td>
                    <td style={{ padding: '16px 10px', fontWeight: 800 }}>{entry.score}</td>
                    <td style={{ padding: '16px 10px' }}>{entry.population}</td>
                    <td style={{ padding: '16px 10px', color: 'var(--color-success)' }}>{entry.happiness}</td>
                    <td style={{ padding: '16px 10px', color: 'var(--color-danger)' }}>{entry.pollution}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
