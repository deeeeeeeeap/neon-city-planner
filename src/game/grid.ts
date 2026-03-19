import { CellData } from '../types';
import { GRID_SIZE, OCEAN_COLUMNS } from './constants';

export const createInitialGrid = (): CellData[][] => {
  const grid: CellData[][] = [];

  for (let y = 0; y < GRID_SIZE; y += 1) {
    const row: CellData[] = [];
    for (let x = 0; x < GRID_SIZE; x += 1) {
      if (x === 0) {
        row.push({ x, y, type: 'ROAD', builtTurn: 0 });
      } else if (x >= GRID_SIZE - OCEAN_COLUMNS) {
        row.push({ x, y, type: 'OCEAN', builtTurn: 0 });
      } else {
        row.push({ x, y, type: 'EMPTY', builtTurn: 0 });
      }
    }

    grid.push(row);
  }

  return grid;
};

export const cloneGrid = (grid: CellData[][]) => grid.map((row) => row.map((cell) => ({ ...cell })));

export const calculateRoadDistances = (grid: CellData[][]): number[][] => {
  const distanceMap = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(Infinity));
  const queue: Array<{ x: number; y: number; distance: number }> = [];

  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      if (grid[y][x].type === 'ROAD') {
        distanceMap[y][x] = 0;
        queue.push({ x, y, distance: 0 });
      }
    }
  }

  const directions = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ] as const;

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      break;
    }

    for (const [dx, dy] of directions) {
      const nx = current.x + dx;
      const ny = current.y + dy;

      if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE && distanceMap[ny][nx] === Infinity) {
        distanceMap[ny][nx] = current.distance + 1;
        queue.push({ x: nx, y: ny, distance: current.distance + 1 });
      }
    }
  }

  return distanceMap;
};
