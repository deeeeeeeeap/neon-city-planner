import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { fetchLeaderboard, submitScore } from './api/leaderboard';
import GameOverModal from './components/GameOverModal';
import GameViewport from './components/GameViewport';
import HUD from './components/HUD';
import LeaderboardModal from './components/LeaderboardModal';
import ParticleOverlay, { ParticleHandle } from './components/ParticleOverlay';
import Sidebar from './components/Sidebar';
import StartScreen from './components/StartScreen';
import Tooltip from './components/Tooltip';
import { CONSTRUCTION_PHASE_END, GRID_SIZE } from './game/constants';
import { calculateDragPreview, commitBuild, isValidForPreview } from './game/builder';
import { calculateScore, processTurn } from './game/engine';
import { useTranslation } from './i18n';
import { useGameStore } from './store/useGameStore';
import { DayPhase, EffectEvent, Language, LeaderboardEntry } from './types';

interface TooltipData {
  label: string;
  text: string;
  y: number;
  cost?: number;
}

const toScreenPoint = (x: number, y: number) => ({
  x: window.innerWidth / 2 + (x - GRID_SIZE / 2) * 45,
  y: window.innerHeight / 2 + (y - GRID_SIZE / 2) * 20,
});

export default function App() {
  const store = useGameStore();
  const { state } = store;

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [lang, setLang] = useState<Language>('zh');
  const [notification, setNotification] = useState('');
  const [hoveredDescription, setHoveredDescription] = useState<TooltipData | null>(null);
  const [dayPhase, setDayPhase] = useState<DayPhase>('day');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragPreview, setDragPreview] = useState<Set<string>>(new Set());

  const particleRef = useRef<ParticleHandle>(null);
  const notificationTimeoutRef = useRef<number | null>(null);
  const animationTimeoutsRef = useRef<number[]>([]);
  const dragStartRef = useRef<typeof dragStart>(dragStart);
  const dragPreviewRef = useRef<string[]>([]);

  const t = useTranslation(lang);

  useEffect(() => {
    dragStartRef.current = dragStart;
  }, [dragStart]);

  useEffect(() => {
    dragPreviewRef.current = [...dragPreview];
  }, [dragPreview]);

  const refreshLeaderboard = useCallback(async () => {
    try {
      const entries = await fetchLeaderboard();
      setLeaderboard(entries);
    } catch {
      setLeaderboard([]);
    }
  }, []);

  useEffect(() => {
    void refreshLeaderboard();
  }, [refreshLeaderboard]);

  useEffect(
    () => () => {
      if (notificationTimeoutRef.current) {
        window.clearTimeout(notificationTimeoutRef.current);
      }
      animationTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    },
    [],
  );

  const clearAnimationQueue = useCallback(() => {
    animationTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    animationTimeoutsRef.current = [];
  }, []);

  const resetTransientUi = useCallback(() => {
    clearAnimationQueue();
    setShowLeaderboard(false);
    setDayPhase('day');
    setIsTransitioning(false);
    setDragStart(null);
    setDragPreview(new Set());
    setHoveredDescription(null);
    setNotification('');
  }, [clearAnimationQueue]);

  const showNotification = useCallback((message: string) => {
    setNotification(message);
    if (notificationTimeoutRef.current) {
      window.clearTimeout(notificationTimeoutRef.current);
    }

    notificationTimeoutRef.current = window.setTimeout(() => {
      setNotification('');
    }, 3000);
  }, []);

  const applyEffects = useCallback((effects: EffectEvent[]) => {
    effects.forEach((effect) => {
      const point = toScreenPoint(effect.cell.x, effect.cell.y);
      if (effect.type === 'income') {
        particleRef.current?.spawnIncome(point.x, point.y, effect.amount);
      } else {
        particleRef.current?.spawn(point.x, point.y, effect.particleType);
      }
    });
  }, []);

  const handleStartGame = useCallback(() => {
    const name = state.playerName.trim();
    if (!name) {
      showNotification(t.error_name_empty);
      return;
    }

    store.startGame();
    resetTransientUi();
    showNotification(`${t.welcome_mayor} ${name}!`);
  }, [resetTransientUi, showNotification, state.playerName, store, t.error_name_empty, t.welcome_mayor]);

  const handleRestartSamePlayer = useCallback(() => {
    store.restartSamePlayer();
    resetTransientUi();
  }, [resetTransientUi, store]);

  const handleNewPlayer = useCallback(() => {
    store.newPlayer();
    resetTransientUi();
    void refreshLeaderboard();
  }, [refreshLeaderboard, resetTransientUi, store]);

  const handleMouseDown = useCallback(
    (x: number, y: number, event: React.MouseEvent) => {
      if (!state.gameStarted || state.isGameOver || isTransitioning) {
        return;
      }

      event.preventDefault();

      if (state.resources.turn > CONSTRUCTION_PHASE_END && state.selectedTool !== 'DEMOLISH') {
        showNotification(t.restricted_error);
        return;
      }

      if (state.grid[y][x].type === 'OCEAN') {
        showNotification(t.ocean_error);
        return;
      }

      if (!isValidForPreview(x, y, state.selectedTool, state.grid, state.resources)) {
        return;
      }

      const start = { x, y };
      setDragStart(start);
      setDragPreview(new Set([`${x},${y}`]));
    },
    [
      isTransitioning,
      showNotification,
      state.gameStarted,
      state.grid,
      state.isGameOver,
      state.resources,
      state.selectedTool,
      t.ocean_error,
      t.restricted_error,
    ],
  );

  const handleMouseEnter = useCallback(
    (x: number, y: number) => {
      if (!dragStartRef.current) {
        return;
      }

      const preview = calculateDragPreview(
        dragStartRef.current,
        { x, y },
        state.selectedTool,
        state.grid,
        state.resources,
      );
      setDragPreview(new Set(preview.cells));
    },
    [state.grid, state.resources, state.selectedTool],
  );

  const handleMouseUp = useCallback(() => {
    const currentDragStart = dragStartRef.current;
    const preview = [...dragPreviewRef.current];

    setDragStart(null);
    setDragPreview(new Set());

    if (!currentDragStart || preview.length === 0) {
      return;
    }

    const result = commitBuild({
      preview,
      tool: state.selectedTool,
      grid: state.grid,
      resources: state.resources,
    });

    if (result.error === 'not_enough_money') {
      showNotification(t.not_enough_money);
      return;
    }

    if (result.error === 'invalid_preview') {
      return;
    }

    store.applyBuildResult(result);
    applyEffects(result.effects);
  }, [applyEffects, showNotification, state.grid, state.resources, state.selectedTool, store, t.not_enough_money]);

  useEffect(() => {
    if (!dragStart) {
      return undefined;
    }

    const handleDocumentMouseMove = (event: MouseEvent) => {
      const target = document.elementFromPoint(event.clientX, event.clientY);
      const cellElement = target instanceof HTMLElement ? target.closest<HTMLElement>('[data-grid-cell="true"]') : null;
      if (!cellElement) {
        return;
      }

      const x = Number.parseInt(cellElement.dataset.x ?? '', 10);
      const y = Number.parseInt(cellElement.dataset.y ?? '', 10);
      if (Number.isNaN(x) || Number.isNaN(y)) {
        return;
      }

      const preview = calculateDragPreview(
        dragStartRef.current ?? dragStart,
        { x, y },
        state.selectedTool,
        state.grid,
        state.resources,
      );
      setDragPreview(new Set(preview.cells));
    };

    const handleDocumentMouseUp = () => {
      handleMouseUp();
    };

    document.addEventListener('mousemove', handleDocumentMouseMove);
    document.addEventListener('mouseup', handleDocumentMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleDocumentMouseMove);
      document.removeEventListener('mouseup', handleDocumentMouseUp);
    };
  }, [dragStart, handleMouseUp, state.grid, state.resources, state.selectedTool]);

  const uploadScore = useCallback(
    async (entry: LeaderboardEntry) => {
      try {
        await submitScore({
          name: entry.name,
          score: entry.score,
          population: entry.population,
          happiness: entry.happiness,
          pollution: entry.pollution,
        });
        await refreshLeaderboard();
      } catch {
        showNotification(t.error_save);
      }
    },
    [refreshLeaderboard, showNotification, t.error_save],
  );

  const finalizeTurn = useCallback(() => {
    const result = processTurn(state.grid, state.resources);

    store.applyTurnResult(result);
    applyEffects(result.effects);

    if (result.gameOver) {
      setShowLeaderboard(true);
      void uploadScore({
        name: state.playerName || t.guest,
        score: Math.max(0, calculateScore(result.nextResources)),
        population: result.nextResources.population,
        happiness: result.nextResources.happiness,
        pollution: result.nextResources.pollution,
        timestamp: new Date().toISOString(),
      });
    } else {
      showNotification(`${t.turn} ${state.resources.turn} ${t.turn_complete}`);
    }
  }, [
    applyEffects,
    showNotification,
    state.grid,
    state.playerName,
    state.resources,
    store,
    t.guest,
    t.turn,
    t.turn_complete,
    uploadScore,
  ]);

  const queueAnimation = useCallback((callback: () => void, delay: number) => {
    const timeoutId = window.setTimeout(callback, delay);
    animationTimeoutsRef.current.push(timeoutId);
  }, []);

  const handleNextTurn = useCallback(() => {
    if (isTransitioning || state.isGameOver) {
      return;
    }

    setIsTransitioning(true);
    setDayPhase('sunset');
    clearAnimationQueue();

    queueAnimation(() => {
      setDayPhase('night');
      queueAnimation(() => {
        finalizeTurn();
        setDayPhase('sunrise');
        queueAnimation(() => {
          setDayPhase('day');
          setIsTransitioning(false);
        }, 1200);
      }, 1500);
    }, 1200);
  }, [clearAnimationQueue, finalizeTurn, isTransitioning, queueAnimation, state.isGameOver]);

  const handleStatHover = useCallback(
    (label: string, text: string, event: React.MouseEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      setHoveredDescription({ label, text, y: rect.bottom + 10 });
    },
    [],
  );

  const hudLabels = useMemo(
    () => ({
      budget: t.budget,
      population: t.population,
      happiness: t.happiness,
      pollution: t.pollution,
      leaderboard: t.leaderboard,
    }),
    [t],
  );

  const statDescriptions = useMemo(
    () => ({
      budget: t.stats_budget_desc,
      population: t.stats_pop_desc,
      happiness: t.stats_happy_desc,
      pollution: t.stats_pol_desc,
    }),
    [t],
  );

  const sidebarLabels = useMemo(
    () => ({
      tools: t.tools,
      phaseBuild: t.phase_build,
      phaseRestricted: t.phase_restricted,
      turn: t.turn,
      nextTurn: t.next_turn,
      finishGame: t.finish_game,
    }),
    [t],
  );

  return (
    <div className={`phase-${dayPhase} flex h-screen flex-col overflow-hidden bg-slate-900 text-slate-100`} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <ParticleOverlay ref={particleRef} />

      {!state.gameStarted && (
        <StartScreen
          playerName={state.playerName}
          onPlayerNameChange={store.setPlayerName}
          onStart={handleStartGame}
          disabled={!state.playerName.trim()}
          title={t.title}
          terminalTitle={t.terminal_title}
          enterNameLabel={t.enter_name_label}
          enterNamePlaceholder={t.enter_name_placeholder}
          startLabel={t.start_button}
        />
      )}

      {state.isGameOver && state.gameStarted && (
        <GameOverModal
          score={calculateScore(state.resources)}
          population={state.resources.population}
          happiness={state.resources.happiness}
          simulationComplete={t.simulation_complete}
          finalScoreLabel={t.final_score}
          populationLabel={t.population}
          happinessLabel={t.happiness}
          playAgainLabel={t.play_again_same}
          newPlayerLabel={t.new_player}
          onRestartSamePlayer={handleRestartSamePlayer}
          onNewPlayer={handleNewPlayer}
        />
      )}

      <HUD
        title={t.title}
        playerName={state.playerName}
        guestLabel={t.guest}
        resources={state.resources}
        labels={hudLabels}
        statDescriptions={statDescriptions}
        onToggleLang={() => setLang((current) => (current === 'zh' ? 'en' : 'zh'))}
        onToggleLeaderboard={() => {
          const next = !showLeaderboard;
          setShowLeaderboard(next);
          if (next) {
            void refreshLeaderboard();
          }
        }}
        onReset={handleNewPlayer}
        onStatHover={handleStatHover}
        onClearHover={() => setHoveredDescription(null)}
      />

      <div className="relative flex flex-1 overflow-hidden">
        {hoveredDescription && (
          <Tooltip
            label={hoveredDescription.label}
            text={hoveredDescription.text}
            y={hoveredDescription.y}
            cost={hoveredDescription.cost}
            estimatedCostLabel={t.estimated_cost}
          />
        )}

        <Sidebar
          gameStarted={state.gameStarted}
          selectedTool={state.selectedTool}
          turn={state.resources.turn}
          isGameOver={state.isGameOver}
          isTransitioning={isTransitioning}
          lang={lang}
          labels={sidebarLabels}
          onSelectTool={store.setTool}
          onToolHover={(label, description, cost, top) =>
            setHoveredDescription({
              label,
              text: description,
              cost,
              y: top,
            })
          }
          onClearHover={() => setHoveredDescription(null)}
          onNextTurn={handleNextTurn}
        />

        <GameViewport
          grid={state.grid}
          currentTurn={state.resources.turn}
          dayPhase={dayPhase}
          isTransitioning={isTransitioning}
          selectedTool={state.selectedTool}
          dragPreview={dragPreview}
          notification={notification}
          onCellMouseDown={handleMouseDown}
          onCellMouseEnter={handleMouseEnter}
        />

        {showLeaderboard && (
          <LeaderboardModal
            entries={leaderboard}
            rankingLabel={t.ranking}
            emptyLabel={t.leaderboard_empty}
            onClose={() => setShowLeaderboard(false)}
          />
        )}
      </div>
    </div>
  );
}
