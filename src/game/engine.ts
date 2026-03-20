import type { Cell, Resources, TurnResult, EffectEvent } from '../types';
import { GRID_SIZE, OCEAN_COLUMNS, PARK_MAINTENANCE, INDUSTRIAL_POLLUTION_PER_TURN, PARK_POLLUTION_RECOVERY } from './constants';
import { calculateRoadDistances, getNeighbors } from './grid';

export function processTurn(grid: Cell[][], resources: Resources): TurnResult {
  const nextGrid: Cell[][] = JSON.parse(JSON.stringify(grid));
  const { turn } = resources;
  let { budget, population, happiness, pollution } = resources;
  const effects: EffectEvent[] = [];

  const distances = calculateRoadDistances(nextGrid);
  
  let income = 0;
  let parkCount = 0;
  let industrialCount = 0;
  let residentialCount = 0;
  let totalLocalHappiness = 0;
  
  // Phase 1: Pre-calculate counts & incomes
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const cell = nextGrid[y][x];
      const dist = distances[y][x];
      const neighbors = getNeighbors(nextGrid, x, y);
      
      let cellIncome = 0;

      if (cell.type === 'PARK') {
        parkCount++;
      } else if (cell.type === 'INDUSTRIAL') {
        industrialCount++;
        cellIncome = dist === 1 ? 300 : 50;
        
        if (cellIncome > 0) {
          effects.push({ id: `inc_ind_${x}_${y}_${turn}`, type: 'INCOME', x, y, value: cellIncome });
        }
      } else if (cell.type === 'COMMERCIAL') {
        const residentialNeighbors = neighbors.filter(n => n.type === 'RESIDENTIAL').length;
        let efficiency = 0.2;
        if (dist === 1) efficiency = 1.0;
        else if (dist === 2) efficiency = 0.8;
        else if (dist === 3) efficiency = 0.5;
        
        cellIncome = Math.floor((50 + residentialNeighbors * 16) * efficiency);
        if (cellIncome > 0) {
          effects.push({ id: `inc_com_${x}_${y}_${turn}`, type: 'INCOME', x, y, value: cellIncome });
        }
      }
      
      cell.roadDist = dist;
      cell.localIncome = cellIncome;
      income += cellIncome;
    }
  }

  // Phase 2: Pollution Update
  const addedPollution = industrialCount * INDUSTRIAL_POLLUTION_PER_TURN;
  const pollutionRecovery = 1 + parkCount * PARK_POLLUTION_RECOVERY;
  pollution = Math.max(0, pollution + addedPollution - pollutionRecovery);
  
  if (addedPollution > 0) {
    effects.push({ id: `poll_up_${turn}`, type: 'POLLUTION_UP', x: Math.floor(GRID_SIZE/2), y: Math.floor(GRID_SIZE/2), value: addedPollution });
  }

  // Phase 3: Happiness & Population per Residential
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const cell = nextGrid[y][x];
      if (cell.type !== 'RESIDENTIAL') continue;
      
      residentialCount++;
      const dist = distances[y][x];
      const neighbors = getNeighbors(nextGrid, x, y);
      
      // Calculate Local Happiness
      let localHappiness = 30;
      
      // Bonus: Parks
      const localParks = neighbors.filter(n => n.type === 'PARK').length;
      localHappiness += 15 * localParks;
      
      // Bonus: Ocean
      const hasOceanNeighbor = neighbors.some(n => n.type === 'OCEAN');
      if (hasOceanNeighbor) {
        localHappiness += 15;
      } else if (x >= GRID_SIZE - OCEAN_COLUMNS - 2) {
        // Near right coast zone (within 2 blocks of ocean)
        localHappiness += 10;
      }
      
      // Penalty: Industrial
      const localFactories = neighbors.filter(n => n.type === 'INDUSTRIAL').length;
      localHappiness -= 40 * localFactories;
      
      // Density logic
      const localResidentials = neighbors.filter(n => n.type === 'RESIDENTIAL').length;
      const localCommercials = neighbors.filter(n => n.type === 'COMMERCIAL').length;
      if (localResidentials >= 4) {
        const amenities = localParks + localCommercials;
        if (amenities < 2) localHappiness -= 15;
        else localHappiness += 10;
      } else {
        localHappiness += 5 * localCommercials;
      }
      
      // Road penalty
      if (dist > 2) localHappiness -= 10;
      if (dist > 3) localHappiness -= 30;
      
      localHappiness = Math.max(0, localHappiness);
      cell.happiness = localHappiness;
      totalLocalHappiness += localHappiness;
      
      // Population Growth
      const THRESHOLD = 40;
      const MAX_POPULATION = 50;
      const vacancyFactor = 1 + (MAX_POPULATION - cell.population) / MAX_POPULATION;
      
      let trafficCoeff = 0.2;
      if (dist === 1) trafficCoeff = 1.0;
      else if (dist === 2) trafficCoeff = 0.8;
      
      let growth = 0;
      if (localHappiness < THRESHOLD) {
        growth = -2;
      } else {
        growth = Math.ceil((localHappiness - THRESHOLD) * 0.25 * trafficCoeff * vacancyFactor);
      }
      
      const prevPop = cell.population;
      cell.population = Math.max(0, Math.min(MAX_POPULATION, cell.population + growth));
      const actualGrowth = cell.population - prevPop;
      
      if (actualGrowth > 0) {
        effects.push({ id: `pop_up_${x}__${y}_${turn}`, type: 'POPULATION_GROWTH', x, y, value: actualGrowth });
      } else if (actualGrowth < 0) {
        effects.push({ id: `pop_down_${x}__${y}_${turn}`, type: 'HAPPINESS_DOWN', x, y, value: actualGrowth });
      }
      
      population += actualGrowth;
    }
  }

  // Phase 4: Summarize
  const parkMaintenance = parkCount * PARK_MAINTENANCE;
  income -= parkMaintenance;
  budget += Math.floor(income);
  
  // Apply pollution penalty to global happiness
  const pollutionPenaltyPerHouse = Math.floor(pollution / 5);
  let globalHappiness = Math.max(0, totalLocalHappiness - pollutionPenaltyPerHouse * residentialCount);
  
  // Cap at population * 2
  if (globalHappiness > population * 2) {
    globalHappiness = population * 2;
  }
  
  happiness = globalHappiness;

  const nextResources = {
    budget,
    population,
    happiness,
    pollution,
    turn: turn + 1
  };

  return { nextGrid, nextResources, effects };
}

export function calculateScore(resources: Resources): number {
  const { population, budget, pollution, happiness } = resources;
  let happinessAdjustment = 0;
  
  if (happiness < population) {
    happinessAdjustment = -(population - happiness) * 10;
  } else {
    const effectiveHappiness = Math.min(happiness, population * 2);
    happinessAdjustment = (effectiveHappiness - population) * 10;
  }
  
  return Math.floor(population * 10 + budget * 0.1 - pollution * 10 + happinessAdjustment);
}
