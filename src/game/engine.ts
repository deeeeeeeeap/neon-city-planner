import { CellData, EffectEvent, GameResources, TurnResult } from '../types';
import { MAX_TURNS } from './constants';
import { calculateRoadDistances, cloneGrid } from './grid';

const NEIGHBOR_DIRS = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
] as const;

export const calculateScore = (stats: GameResources): number => {
  let finalScore = stats.population * 10 + stats.budget * 0.1 - stats.pollution * 10;

  if (stats.happiness < stats.population) {
    finalScore -= (stats.population - stats.happiness) * 10;
  } else {
    const effectiveHappiness = Math.min(stats.happiness, stats.population * 2);
    finalScore += (effectiveHappiness - stats.population) * 10;
  }

  return Math.floor(finalScore);
};

const countAdjacentTypes = (grid: CellData[][], x: number, y: number) => {
  let parks = 0;
  let factories = 0;
  let ocean = 0;
  let residentials = 0;
  let commercials = 0;

  for (const [dx, dy] of NEIGHBOR_DIRS) {
    const nx = x + dx;
    const ny = y + dy;

    if (ny < 0 || nx < 0 || ny >= grid.length || nx >= grid[ny].length) {
      continue;
    }

    const neighborType = grid[ny][nx].type;
    if (neighborType === 'PARK') parks += 1;
    if (neighborType === 'INDUSTRIAL') factories += 1;
    if (neighborType === 'OCEAN') ocean += 1;
    if (neighborType === 'RESIDENTIAL') residentials += 1;
    if (neighborType === 'COMMERCIAL') commercials += 1;
  }

  return { parks, factories, ocean, residentials, commercials };
};

export const processTurn = (grid: CellData[][], resources: GameResources): TurnResult => {
  if (resources.turn > MAX_TURNS) {
    return {
      nextGrid: cloneGrid(grid),
      nextResources: { ...resources },
      effects: [],
      gameOver: true,
    };
  }

  const nextGrid = cloneGrid(grid);
  const distMap = calculateRoadDistances(grid);
  const effects: EffectEvent[] = [];

  let income = 0;
  let totalHappinessPoints = 0;
  let residentialCount = 0;
  let addedPollution = 0;
  let parkCount = 0;
  let totalPopulation = 0;

  for (let y = 0; y < nextGrid.length; y += 1) {
    for (let x = 0; x < nextGrid[y].length; x += 1) {
      const cell = nextGrid[y][x];
      const roadDist = distMap[y][x];

      if (cell.type === 'INDUSTRIAL') {
        addedPollution += 5;
        const amount = roadDist === 1 ? 300 : 50;
        income += amount;
        if (amount > 100) {
          effects.push({ type: 'income', cell: { x, y }, amount });
        }
        continue;
      }

      if (cell.type === 'PARK') {
        parkCount += 1;
        continue;
      }

      if (cell.type === 'RESIDENTIAL') {
        residentialCount += 1;
        let localHappiness = 30;
        const { parks, factories, ocean, residentials, commercials } = countAdjacentTypes(grid, x, y);

        localHappiness += parks * 15;
        if (ocean > 0) {
          localHappiness += ocean * 15;
        } else if (x >= nextGrid[y].length - 4) {
          localHappiness += 10;
        }

        localHappiness -= factories * 40;

        if (residentials >= 4) {
          const amenities = parks + commercials;
          localHappiness += amenities < 2 ? -15 : 10;
        } else {
          localHappiness += commercials * 5;
        }

        if (roadDist > 2) localHappiness -= 10;
        if (roadDist > 3) localHappiness -= 30;

        localHappiness = Math.max(0, localHappiness);
        totalHappinessPoints += localHappiness;
        income += 50;

        const threshold = 40;
        const growthCoeff = 0.25;
        let trafficCoeff = 0.2;
        if (roadDist === 1) trafficCoeff = 1.0;
        else if (roadDist === 2) trafficCoeff = 0.8;

        const currentPopulation = cell.population ?? 0;
        const maxPopulation = 50;
        const vacancyFactor = 1 + (maxPopulation - currentPopulation) / maxPopulation;

        let growth = 0;
        if (localHappiness < threshold) {
          growth = -2;
        } else {
          growth = Math.ceil((localHappiness - threshold) * growthCoeff * trafficCoeff * vacancyFactor);
        }

        let nextPopulation = currentPopulation + growth;
        if (nextPopulation > maxPopulation) nextPopulation = maxPopulation;
        if (nextPopulation < 0) nextPopulation = 0;

        cell.population = nextPopulation;
        totalPopulation += nextPopulation;

        if (growth >= 4) {
          effects.push({ type: 'particle', particleType: 'sparkle', cell: { x, y } });
        }
        continue;
      }

      if (cell.type === 'COMMERCIAL') {
        const { residentials } = countAdjacentTypes(grid, x, y);
        const baseIncome = 50;
        const incomePerResident = 16;
        const efficiency = roadDist === 1 ? 1 : roadDist === 2 ? 0.8 : roadDist === 3 ? 0.5 : 0.2;
        const amount = Math.floor((baseIncome + residentials * incomePerResident) * efficiency);
        income += amount;
        if (amount > 100) {
          effects.push({ type: 'income', cell: { x, y }, amount });
        }
      }
    }
  }

  const pollutionRecovery = 1 + parkCount * 2;
  const nextPollution = Math.max(0, resources.pollution + addedPollution - pollutionRecovery);
  const pollutionPenaltyPerHouse = Math.floor(nextPollution / 5);

  if (residentialCount > 0) {
    totalHappinessPoints = Math.max(0, totalHappinessPoints - pollutionPenaltyPerHouse * residentialCount);
  }

  income -= parkCount * 50;

  if (totalHappinessPoints > totalPopulation * 2) {
    totalHappinessPoints = totalPopulation * 2;
  }

  const nextTurn = resources.turn + 1;
  const nextResources: GameResources = {
    budget: resources.budget + Math.floor(income),
    population: totalPopulation,
    happiness: totalHappinessPoints,
    pollution: nextPollution,
    turn: nextTurn,
  };

  return {
    nextGrid,
    nextResources,
    effects,
    gameOver: nextTurn > MAX_TURNS,
  };
};
