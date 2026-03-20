import { useState, type FormEvent } from 'react';

interface StartScreenProps {
  onStart: (name: string) => void;
}

export const StartScreen = ({ onStart }: StartScreenProps) => {
  const [name, setName] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (name.trim()) {
      onStart(name.trim());
    }
  };

  return (
    <div className="modal-overlay">
      <div
        className="paper-panel"
        style={{
          width: 'min(560px, 100%)',
          padding: 'clamp(28px, 4vw, 48px)',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span className="brand-badge">Coastal Sandbox</span>
          <h1 style={{ marginTop: '16px', fontSize: 'clamp(2.4rem, 6vw, 4rem)' }}>
            纸模城市规划师
          </h1>

          <p
            style={{
              marginTop: '18px',
              color: 'var(--color-ink-light)',
              fontSize: '1rem',
              lineHeight: 1.7,
            }}
          >
            在 15x15 的海岸棋盘上，把预算、人口、幸福和污染拉成一份平衡方案。
            <br />
            前 5 回合可以建设，后 5 回合只能拆除与观察城市如何演化。
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: '12px',
              marginTop: '24px',
              marginBottom: '28px',
            }}
          >
            <div className="paper-panel" style={{ padding: '14px', background: 'rgba(244, 234, 217, 0.55)' }}>
              <strong style={{ display: 'block', fontSize: '1.2rem' }}>10</strong>
              <span style={{ color: 'var(--color-ink-light)', fontSize: '0.85rem' }}>总回合</span>
            </div>
            <div className="paper-panel" style={{ padding: '14px', background: 'rgba(244, 234, 217, 0.55)' }}>
              <strong style={{ display: 'block', fontSize: '1.2rem' }}>5</strong>
              <span style={{ color: 'var(--color-ink-light)', fontSize: '0.85rem' }}>施工期</span>
            </div>
            <div className="paper-panel" style={{ padding: '14px', background: 'rgba(244, 234, 217, 0.55)' }}>
              <strong style={{ display: 'block', fontSize: '1.2rem' }}>2</strong>
              <span style={{ color: 'var(--color-ink-light)', fontSize: '0.85rem' }}>海岸列</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
            <label style={{ display: 'grid', gap: '8px', textAlign: 'left' }}>
              <span style={{ fontSize: '0.92rem', fontWeight: 700 }}>市长姓名</span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                minLength={2}
                maxLength={12}
                required
                placeholder="输入 2 到 12 个字符"
                style={{
                  height: '54px',
                  borderRadius: '999px',
                  border: '1px solid rgba(94, 70, 44, 0.14)',
                  background: 'rgba(255, 250, 243, 0.92)',
                  padding: '0 20px',
                  outline: 'none',
                }}
              />
            </label>

            <button type="submit" className="btn-primary" style={{ width: '100%', minHeight: '54px' }}>
              开始规划
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
