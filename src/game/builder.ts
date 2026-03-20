import type { Cell, CellType, Resources, GamePhase } from '../types';
import { BUILDING_COSTS, CONSTRUCTION_PHASE_END, GRID_SIZE, OCEAN_COLUMNS } from './constants';

export function canPlace(
  grid: Cell[][],
  x: number,
  y: number,
  type: CellType,
  resources: Resources,
  phase: GamePhase
): { valid: boolean; reason?: string } {
  // Check bounds
  if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) {
    return { valid: false, reason: 'Out of bounds' };
  }

  // Check game phase
  if (phase !== 'CONSTRUCTION' && phase !== 'SIMULATION') {
    return { valid: false, reason: 'Game not started' };
  }

  const cell = grid[y][x];

  // Ocean cannot be built on
  if (x >= GRID_SIZE - OCEAN_COLUMNS) {
    return { valid: false, reason: 'Cannot build on ocean' };
  }

  // Cost check
  const cost = BUILDING_COSTS[type as keyof typeof BUILDING_COSTS] || 0;
  if (resources.budget < cost) {
    return { valid: false, reason: 'Not enough funds' };
  }

  if (type === 'DEMOLISH') {
    if (cell.type === 'EMPTY' || cell.type === 'OCEAN') {
      return { valid: false, reason: 'Nothing to demolish' };
    }
  } else {
    // Building a new structure
    if (cell.type !== 'EMPTY') {
      return { valid: false, reason: 'Cell is not empty' };
    }

    // After construction phase, only demolish is allowed
    if (resources.turn > CONSTRUCTION_PHASE_END) {
      return { valid: false, reason: 'Construction phase has ended. Only Demolish is allowed.' };
    }
  }

  return { valid: true };
}

export function placeBuilding(
  grid: Cell[][],
  resources: Resources,
  x: number,
  y: number,
  type: CellType
): { nextGrid: Cell[][], nextResources: Resources } {
  const nextGrid = JSON.parse(JSON.stringify(grid));
  const nextResources = { ...resources };

  const cost = BUILDING_COSTS[type as keyof typeof BUILDING_COSTS] || 0;
  
  if (type === 'DEMOLISH') {
    nextGrid[y][x].type = 'EMPTY';
    nextGrid[y][x].population = 0;
    nextGrid[y][x].happiness = 0;
  } else {
    nextGrid[y][x].type = type;
    nextGrid[y][x].population = 0;
    nextGrid[y][x].happiness = 0;
  }

  nextResources.budget -= cost;

  return { nextGrid, nextResources };
}
