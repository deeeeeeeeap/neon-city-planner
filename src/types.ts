// Cell and Building Types
export type CellType = 'EMPTY' | 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL' | 'PARK' | 'ROAD' | 'OCEAN' | 'DEMOLISH'

export interface Cell {
  x: number;
  y: number;
  type: CellType;
  population: number;
  happiness: number;
  // Used for debugging/tooltip
  roadDist?: number;
  localIncome?: number;
}

// Global Resources
export interface Resources {
  budget: number;
  population: number;
  happiness: number;
  pollution: number;
  turn: number;
}

// Game Phase
export type GamePhase = 'NOT_STARTED' | 'CONSTRUCTION' | 'SIMULATION' | 'GAME_OVER'

// Effect Event (for UI particles/animations)
export interface EffectEvent {
  id: string;
  type: 'INCOME' | 'POPULATION_GROWTH' | 'HAPPINESS_UP' | 'HAPPINESS_DOWN' | 'POLLUTION_UP';
  x: number;
  y: number;
  value: number;
}

// Turn Result from Engine
export interface TurnResult {
  nextGrid: Cell[][];
  nextResources: Resources;
  effects: EffectEvent[];
}

// Reducer Game State
export interface GameState {
  grid: Cell[][];
  resources: Resources;
  phase: GamePhase;
  playerName: string;
  selectedTool: CellType;
}

// Reducer Actions
export type GameAction = 
  | { type: 'START_GAME'; name: string }
  | { type: 'PLACE_BUILDING'; x: number; y: number; building: CellType }
  | { type: 'SELECT_TOOL'; tool: CellType }
  | { type: 'END_TURN'; result: TurnResult }
  | { type: 'RESET' }
