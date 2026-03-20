// Board Constants
export const GRID_SIZE = 15;
export const OCEAN_COLUMNS = 2; // Rightmost 2 columns are ocean

// Game Pacing
export const MAX_TURNS = 10;
export const CONSTRUCTION_PHASE_END = 5; // After turn 5, only DEMOLISH is allowed

// Resources Options
export const INITIAL_BUDGET = 5000;

// Building Costs & Stats
export const BUILDING_COSTS: Record<Exclude<import('../types').CellType, 'EMPTY' | 'OCEAN'>, number> = {
  RESIDENTIAL: 100,
  COMMERCIAL: 200,
  INDUSTRIAL: 300,
  PARK: 150,
  ROAD: 50,
  DEMOLISH: 50, // Cost to demolish
};

export const PARK_MAINTENANCE = 50;

export const INDUSTRIAL_POLLUTION_PER_TURN = 5;
export const PARK_POLLUTION_RECOVERY = 2;
