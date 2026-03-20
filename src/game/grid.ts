import type { Cell, CellType } from '../types';
import { GRID_SIZE, OCEAN_COLUMNS } from './constants';

export function createInitialGrid(): Cell[][] {
  const grid: Cell[][] = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      const type: CellType = x >= GRID_SIZE - OCEAN_COLUMNS ? 'OCEAN' : 'EMPTY';
      row.push({
        x,
        y,
        type,
        population: 0,
        happiness: 0,
      });
    }
    grid.push(row);
  }
  return grid;
}

export function getNeighbors(grid: Cell[][], x: number, y: number): Cell[] {
  const neighbors: Cell[] = [];
  const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  for (const [dx, dy] of dirs) {
    const nx = x + dx;
    const ny = y + dy;
    if (ny >= 0 && ny < GRID_SIZE && nx >= 0 && nx < GRID_SIZE) {
      neighbors.push(grid[ny][nx]);
    }
  }
  return neighbors;
}

export function calculateRoadDistances(grid: Cell[][]): number[][] {
  const distances: number[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(Infinity));
  const queue: { x: number, y: number, dist: number }[] = [];

  // Find all roads and add to queue
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (grid[y][x].type === 'ROAD') {
        queue.push({ x, y, dist: 0 });
        distances[y][x] = 0;
      }
    }
  }

  // BFS
  while (queue.length > 0) {
    const { x, y, dist } = queue.shift()!;
    const neighbors = getNeighbors(grid, x, y);
    
    for (const neighbor of neighbors) {
      if (distances[neighbor.y][neighbor.x] > dist + 1) {
        distances[neighbor.y][neighbor.x] = dist + 1;
        queue.push({ x: neighbor.x, y: neighbor.y, dist: dist + 1 });
      }
    }
  }

  return distances;
}
