import { BUILDING_TYPES, CONSTRUCTION_PHASE_END, GRID_SIZE } from './constants';
import { cloneGrid } from './grid';
import type {
  BuildCommitResult,
  BuildPreviewResult,
  BuildingTypeID,
  CellData,
  EffectEvent,
  GameResources,
} from '../types';

export const toCoordKey = ({ x, y }: { x: number; y: number }) => `${x},${y}`;

export const isValidForPreview = (
  x: number,
  y: number,
  tool: BuildingTypeID,
  grid: CellData[][],
  resources: GameResources,
) => {
  if (x < 0 || y < 0 || x >= GRID_SIZE || y >= GRID_SIZE) {
    return false;
  }

  if (resources.turn > CONSTRUCTION_PHASE_END && tool !== 'DEMOLISH') {
    return false;
  }

  const cell = grid[y][x];
  if (cell.type === 'OCEAN') {
    return false;
  }

  if (tool === 'DEMOLISH') {
    return cell.type !== 'EMPTY';
  }

  return cell.type === 'EMPTY';
};

export const calculateDragPreview = (
  start: { x: number; y: number },
  end: { x: number; y: number },
  tool: BuildingTypeID,
  grid: CellData[][],
  resources: GameResources,
): BuildPreviewResult => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const cells = new Set<string>();

  if (Math.abs(dx) >= Math.abs(dy)) {
    const minX = Math.min(start.x, end.x);
    const maxX = Math.max(start.x, end.x);
    for (let x = minX; x <= maxX; x += 1) {
      if (isValidForPreview(x, start.y, tool, grid, resources)) {
        cells.add(toCoordKey({ x, y: start.y }));
      }
    }
  } else {
    const minY = Math.min(start.y, end.y);
    const maxY = Math.max(start.y, end.y);
    for (let y = minY; y <= maxY; y += 1) {
      if (isValidForPreview(start.x, y, tool, grid, resources)) {
        cells.add(toCoordKey({ x: start.x, y }));
      }
    }
  }

  return { cells: [...cells] };
};

export const commitBuild = ({
  preview,
  tool,
  grid,
  resources,
}: {
  preview: string[];
  tool: BuildingTypeID;
  grid: CellData[][];
  resources: GameResources;
}): BuildCommitResult => {
  const building = BUILDING_TYPES[tool];
  const nextGrid = cloneGrid(grid);
  const effects: EffectEvent[] = [];
  let totalCost = 0;
  let successfulBuilds = 0;

  for (const cellKey of preview) {
    const [xString, yString] = cellKey.split(',');
    const x = Number.parseInt(xString, 10);
    const y = Number.parseInt(yString, 10);

    if (Number.isNaN(x) || Number.isNaN(y)) {
      continue;
    }

    if (totalCost + building.cost > resources.budget) {
      continue;
    }

    if (tool === 'DEMOLISH') {
      nextGrid[y][x] = { ...nextGrid[y][x], type: 'EMPTY', builtTurn: 0, population: 0 };
    } else {
      nextGrid[y][x] = {
        ...nextGrid[y][x],
        type: tool,
        builtTurn: resources.turn,
        population: 0,
      };
      effects.push({ type: 'particle', particleType: 'dust', cell: { x, y } });
    }

    totalCost += building.cost;
    successfulBuilds += 1;
  }

  const nextResources: GameResources = {
    ...resources,
    budget: resources.budget - totalCost,
  };

  if (successfulBuilds === 0) {
    return {
      nextGrid: cloneGrid(grid),
      nextResources: { ...resources },
      effects: [],
      successfulBuilds: 0,
      totalCost: 0,
      error: preview.length > 0 && tool !== 'DEMOLISH' ? 'not_enough_money' : 'invalid_preview',
    };
  }

  return {
    nextGrid,
    nextResources,
    effects,
    successfulBuilds,
    totalCost,
  };
};
