import { LucideIcon } from 'lucide-react';

export type BuildingTypeID =
  | 'EMPTY'
  | 'RESIDENTIAL'
  | 'COMMERCIAL'
  | 'INDUSTRIAL'
  | 'PARK'
  | 'ROAD'
  | 'OCEAN'
  | 'DEMOLISH';

export type Language = 'zh' | 'en';

export type DayPhase = 'day' | 'sunset' | 'night' | 'sunrise';

export type EffectParticleType = 'dust' | 'sparkle' | 'smoke' | 'text';

export interface GridPoint {
  x: number;
  y: number;
}

export interface BuildingDef {
  id: string;
  label: string;
  labelEn: string;
  cost: number;
  color: string;
  icon?: LucideIcon;
  description: string;
  descriptionEn: string;
  heightClass?: string;
}

export interface CellData extends GridPoint {
  type: BuildingTypeID;
  builtTurn: number;
  population?: number;
}

export interface GameResources {
  budget: number;
  population: number;
  happiness: number;
  pollution: number;
  turn: number;
}

export interface LeaderboardEntry {
  id?: string;
  name: string;
  score: number;
  population: number;
  happiness: number;
  pollution: number;
  timestamp: string;
}

export interface LeaderboardSubmission {
  name: string;
  score: number;
  population: number;
  happiness: number;
  pollution: number;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: EffectParticleType;
  text?: string;
}

export interface ParticleEffectEvent {
  type: 'particle';
  particleType: Exclude<EffectParticleType, 'text'>;
  cell: GridPoint;
}

export interface IncomeEffectEvent {
  type: 'income';
  cell: GridPoint;
  amount: number;
}

export type EffectEvent = ParticleEffectEvent | IncomeEffectEvent;

export type BuildErrorCode =
  | 'not_enough_money'
  | 'restricted_error'
  | 'ocean_error'
  | 'clear_first'
  | 'invalid_preview';

export interface BuildPreviewResult {
  cells: string[];
}

export interface BuildCommitResult {
  nextGrid: CellData[][];
  nextResources: GameResources;
  effects: EffectEvent[];
  successfulBuilds: number;
  totalCost: number;
  error?: BuildErrorCode;
}

export interface TurnResult {
  nextGrid: CellData[][];
  nextResources: GameResources;
  effects: EffectEvent[];
  gameOver: boolean;
}

export interface GameState {
  gameStarted: boolean;
  isGameOver: boolean;
  playerName: string;
  selectedTool: BuildingTypeID;
  grid: CellData[][];
  resources: GameResources;
}

export type GameAction =
  | { type: 'set_player_name'; playerName: string }
  | { type: 'set_tool'; tool: BuildingTypeID }
  | { type: 'start_game' }
  | { type: 'restart_same_player' }
  | { type: 'new_player' }
  | { type: 'apply_build_result'; result: BuildCommitResult }
  | { type: 'apply_turn_result'; result: TurnResult }
  | { type: 'set_game_over'; value: boolean };
