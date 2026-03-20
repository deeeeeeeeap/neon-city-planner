import { useCallback, useReducer } from 'react';
import type { CellType, GameAction, GameState } from '../types';
import { createInitialGrid } from '../game/grid';
import { CONSTRUCTION_PHASE_END, INITIAL_BUDGET, MAX_TURNS } from '../game/constants';
import { canPlace, placeBuilding } from '../game/builder';
import { processTurn } from '../game/engine';

const initialState: GameState = {
  grid: [],
  resources: {
    budget: INITIAL_BUDGET,
    population: 0,
    happiness: 0,
    pollution: 0,
    turn: 1,
  },
  phase: 'NOT_STARTED',
  playerName: '',
  selectedTool: 'RESIDENTIAL',
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...state,
        grid: createInitialGrid(),
        resources: {
          budget: INITIAL_BUDGET,
          population: 0,
          happiness: 0,
          pollution: 0,
          turn: 1,
        },
        phase: 'CONSTRUCTION',
        playerName: action.name,
      };

    case 'SELECT_TOOL':
      return {
        ...state,
        selectedTool: action.tool,
      };

    case 'PLACE_BUILDING': {
      const { x, y, building } = action;
      const check = canPlace(state.grid, x, y, building, state.resources, state.phase);
      
      if (!check.valid) {
        // UI should show notification, state remains unchanged
        return state;
      }

      const { nextGrid, nextResources } = placeBuilding(state.grid, state.resources, x, y, building);
      
      return {
        ...state,
        grid: nextGrid,
        resources: nextResources,
      };
    }

    case 'END_TURN': {
      const { nextGrid, nextResources } = action.result;
      let nextPhase = state.phase;
      
      if (nextResources.turn > MAX_TURNS) {
        nextPhase = 'GAME_OVER';
      } else if (nextResources.turn > CONSTRUCTION_PHASE_END) {
        nextPhase = 'SIMULATION';
      } else {
        nextPhase = 'CONSTRUCTION';
      }

      return {
        ...state,
        grid: nextGrid,
        resources: nextResources,
        phase: nextPhase,
      };
    }

    case 'RESET':
      return {
        ...initialState,
        grid: [],
        phase: 'NOT_STARTED',
        playerName: '',
      };

    default:
      return state;
  }
}

export function useGameStore() {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const startGame = useCallback((name: string) => {
    dispatch({ type: 'START_GAME', name });
  }, []);

  const selectTool = useCallback((tool: CellType) => {
    dispatch({ type: 'SELECT_TOOL', tool });
  }, []);

  const build = useCallback((x: number, y: number, building: CellType) => {
    dispatch({ type: 'PLACE_BUILDING', x, y, building });
  }, []);

  const endTurn = useCallback(() => {
    dispatch({ type: 'END_TURN', result: processTurn(state.grid, state.resources) });
  }, [state.grid, state.resources]);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return {
    state,
    dispatch,
    actions: {
      startGame,
      selectTool,
      build,
      endTurn,
      resetGame,
    }
  };
}
