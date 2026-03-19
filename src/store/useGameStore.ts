import { useCallback, useMemo, useReducer } from 'react';

import { DEFAULT_SELECTED_TOOL, INITIAL_RESOURCES } from '../game/constants';
import { createInitialGrid } from '../game/grid';
import { BuildCommitResult, GameAction, GameState, TurnResult } from '../types';

export const createInitialGameState = (playerName = ''): GameState => ({
  gameStarted: false,
  isGameOver: false,
  playerName,
  selectedTool: DEFAULT_SELECTED_TOOL,
  grid: createInitialGrid(),
  resources: { ...INITIAL_RESOURCES },
});

export const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'set_player_name':
      return {
        ...state,
        playerName: action.playerName,
      };

    case 'set_tool':
      return {
        ...state,
        selectedTool: action.tool,
      };

    case 'start_game':
      return {
        ...createInitialGameState(state.playerName),
        gameStarted: true,
      };

    case 'restart_same_player':
      return {
        ...createInitialGameState(state.playerName),
        gameStarted: true,
      };

    case 'new_player':
      return createInitialGameState('');

    case 'apply_build_result':
      return {
        ...state,
        grid: action.result.nextGrid,
        resources: action.result.nextResources,
      };

    case 'apply_turn_result':
      return {
        ...state,
        grid: action.result.nextGrid,
        resources: action.result.nextResources,
        isGameOver: action.result.gameOver,
      };

    case 'set_game_over':
      return {
        ...state,
        isGameOver: action.value,
      };

    default:
      return state;
  }
};

export const useGameStore = (initialPlayerName = '') => {
  const [state, dispatch] = useReducer(gameReducer, initialPlayerName, createInitialGameState);

  const setPlayerName = useCallback((playerName: string) => dispatch({ type: 'set_player_name', playerName }), []);
  const setTool = useCallback((tool: GameState['selectedTool']) => dispatch({ type: 'set_tool', tool }), []);
  const startGame = useCallback(() => dispatch({ type: 'start_game' }), []);
  const restartSamePlayer = useCallback(() => dispatch({ type: 'restart_same_player' }), []);
  const newPlayer = useCallback(() => dispatch({ type: 'new_player' }), []);
  const applyBuildResult = useCallback((result: BuildCommitResult) => dispatch({ type: 'apply_build_result', result }), []);
  const applyTurnResult = useCallback((result: TurnResult) => dispatch({ type: 'apply_turn_result', result }), []);
  const setGameOver = useCallback((value: boolean) => dispatch({ type: 'set_game_over', value }), []);

  const actions = useMemo(
    () => ({
      dispatch,
      setPlayerName,
      setTool,
      startGame,
      restartSamePlayer,
      newPlayer,
      applyBuildResult,
      applyTurnResult,
      setGameOver,
    }),
    [applyBuildResult, applyTurnResult, dispatch, newPlayer, restartSamePlayer, setGameOver, setPlayerName, setTool, startGame],
  );

  return useMemo(
    () => ({
      state,
      ...actions,
    }),
    [actions, state],
  );
};
