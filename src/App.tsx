import { useState } from 'react';
import { GameBoard } from './components/GameBoard';
import { GameOverModal } from './components/GameOverModal';
import { HUD } from './components/HUD';
import { LeaderboardModal } from './components/LeaderboardModal';
import { Sidebar } from './components/Sidebar';
import { StartScreen } from './components/StartScreen';
import { useGameStore } from './store/useGameStore';

function App() {
  const store = useGameStore();
  const { state, actions } = store;
  const { phase, selectedTool, resources, playerName } = state;
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const isPlaying = phase !== 'NOT_STARTED';

  return (
    <div className="app-shell">
      {!isPlaying ? (
        <StartScreen onStart={actions.startGame} />
      ) : (
        <>
          <div className="game-stage">
            <div className="game-stage-header">
              <div className="brand-lockup">
                <span className="brand-badge">Paper City Planner</span>
                <h1>纸模城市规划师</h1>
                <p>在十个回合内平衡预算、人口、幸福与污染，搭建一座有呼吸感的海岸城市。</p>
              </div>

              <button
                type="button"
                className="paper-action"
                onClick={() => setShowLeaderboard(true)}
              >
                查看排行榜
              </button>
            </div>

            <HUD resources={resources} />
            <GameBoard store={store} />
          </div>

          <aside className="sidebar-shell">
            <Sidebar
              selectedTool={selectedTool}
              onSelectTool={actions.selectTool}
              onEndTurn={actions.endTurn}
              phase={phase}
              turn={resources.turn}
            />
          </aside>
        </>
      )}

      {phase === 'GAME_OVER' && (
        <GameOverModal
          resources={resources}
          playerName={playerName}
          onRestart={actions.resetGame}
        />
      )}

      {showLeaderboard && (
        <LeaderboardModal onClose={() => setShowLeaderboard(false)} />
      )}
    </div>
  );
}

export default App;
