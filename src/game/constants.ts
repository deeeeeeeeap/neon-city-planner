import { Building2, Factory, Route, Store, Trash2, TreePine } from 'lucide-react';

import { BuildingDef, BuildingTypeID, GameResources } from '../types';

export const GRID_SIZE = 15;
export const OCEAN_COLUMNS = 2;
export const MAX_TURNS = 10;
export const CONSTRUCTION_PHASE_END = 5;

export const INITIAL_RESOURCES: GameResources = {
  budget: 5000,
  population: 0,
  happiness: 0,
  pollution: 0,
  turn: 1,
};

export const DEFAULT_SELECTED_TOOL: BuildingTypeID = 'RESIDENTIAL';

export const BUILDING_TYPES: Record<BuildingTypeID, BuildingDef> = {
  EMPTY: {
    id: 'empty',
    label: '空地',
    labelEn: 'Empty',
    cost: 0,
    color: '#e5e7eb',
    description: '未开发的土地。',
    descriptionEn: 'Undeveloped land.',
  },
  RESIDENTIAL: {
    id: 'R',
    label: '居住用地',
    labelEn: 'Residential',
    cost: 100,
    color: '#fcd34d',
    icon: Building2,
    heightClass: 'h-8',
    description:
      '基础收益: +$50 | 基础幸福: 30\n• 邻近公园: +15 幸福\n• 邻近工业: -40 幸福\n• 道路距离 > 2 格: 幸福度大幅衰减',
    descriptionEn:
      'Base Income: +$50 | Base Happiness: 30\n• Near Park: +15 Happiness\n• Near Industry: -40 Happiness\n• Road distance > 2: Major happiness decay',
  },
  COMMERCIAL: {
    id: 'C',
    label: '商业用地',
    labelEn: 'Commercial',
    cost: 200,
    color: '#60a5fa',
    icon: Store,
    heightClass: 'h-6',
    description:
      '基础收益: +$50 + 居民加成\n• 紧邻道路: 100% 收益\n• 距离 2 格: 80% 收益\n• 距离 3 格: 50% 收益',
    descriptionEn:
      'Base Income: +$50 + Resident bonus\n• Adjacent to road: 100% income\n• Distance 2: 80% income\n• Distance 3: 50% income',
  },
  INDUSTRIAL: {
    id: 'M',
    label: '工业用地',
    labelEn: 'Industrial',
    cost: 150,
    color: '#78716c',
    icon: Factory,
    heightClass: 'h-10',
    description: '基础收益: +$300\n• 污染: +5/回合\n• 靠路收益更高，拆除后污染会缓慢自然衰减',
    descriptionEn:
      'Base Income: +$300\n• Pollution: +5/turn\n• Road access boosts income and pollution decays slowly after demolition',
  },
  PARK: {
    id: 'G',
    label: '绿地公园',
    labelEn: 'Park',
    cost: 300,
    color: '#34d399',
    icon: TreePine,
    heightClass: 'h-2',
    description: '维护费: $50/回合\n• 净化环境，加速污染消散\n• 周围居住区幸福 +15',
    descriptionEn:
      'Upkeep: $50/turn\n• Purifies the environment and accelerates pollution recovery\n• Nearby residential happiness +15',
  },
  ROAD: {
    id: 'Road',
    label: '道路',
    labelEn: 'Road',
    cost: 80,
    color: '#cbd5e1',
    icon: Route,
    heightClass: 'h-0.5',
    description: '城市血管\n• 居住/商业依赖道路\n• 工业需要更近的道路\n• 距离越远，效率越低',
    descriptionEn:
      'City arteries\n• Residential and commercial zones rely on roads\n• Industry needs closer road access\n• Efficiency drops with distance',
  },
  DEMOLISH: {
    id: 'Demolish',
    label: '拆除',
    labelEn: 'Demolish',
    cost: 50,
    color: '#ef4444',
    icon: Trash2,
    description: '花费 $50 清理地块。\n注意：不能覆盖建设，必须先拆除。',
    descriptionEn: 'Spend $50 to clear a tile.\nNote: Existing structures must be demolished first.',
  },
  OCEAN: {
    id: 'Ocean',
    label: '海洋',
    labelEn: 'Ocean',
    cost: 0,
    color: '#22d3ee',
    description: '自然景观\n• 紧邻海洋的住宅获得 +15 幸福',
    descriptionEn: 'Natural scenery\n• Oceanfront residential zones gain +15 happiness',
  },
};
