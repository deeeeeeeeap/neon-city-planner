import React, { useMemo } from 'react';
import { Waves } from 'lucide-react';
import { GRID_SIZE } from '../game/constants';
import { BuildingTypeID, CellData, DayPhase } from '../types';
import BuildingBlock from './BuildingBlock';

interface Props {
  cell: CellData;
  grid: CellData[][];
  currentTurn: number;
  dayPhase: DayPhase;
  dragPreview?: BuildingTypeID;
  onMouseDown: (event: React.MouseEvent) => void;
  onMouseEnter: () => void;
}

const GridCell = React.memo(
  ({ cell, grid, currentTurn, dayPhase, dragPreview, onMouseDown, onMouseEnter }: Props) => {
    const { x, y, type } = cell;

    const nTop = y > 0 ? grid[y - 1][x] : null;
    const nBottom = y < GRID_SIZE - 1 ? grid[y + 1][x] : null;
    const nLeft = x > 0 ? grid[y][x - 1] : null;
    const nRight = x < GRID_SIZE - 1 ? grid[y][x + 1] : null;

    const connect = useMemo(
      () => ({
        top: !!nTop && nTop.type === type,
        bottom: !!nBottom && nBottom.type === type,
        left: !!nLeft && nLeft.type === type,
        right: !!nRight && nRight.type === type,
      }),
      [nBottom, nLeft, nRight, nTop, type],
    );

    const isOcean = type === 'OCEAN';
    const isEmpty = type === 'EMPTY';
    const isRoad = type === 'ROAD';
    const age = currentTurn - (cell.builtTurn || 0);
    const previewConnect = { top: false, bottom: false, left: false, right: false };

    return (
      <div onMouseDown={onMouseDown} onMouseEnter={onMouseEnter} className="group relative h-12 w-12 cursor-pointer" style={{ transformStyle: 'preserve-3d' }}>
        <div
          className={`absolute inset-0 border border-white/5 transition-colors duration-500 ${
            isOcean ? 'bg-cyan-900/80' : isEmpty ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-800'
          }`}
        />

        {dragPreview && dragPreview !== 'DEMOLISH' && dragPreview !== 'ROAD' && (
          <div className="pointer-events-none absolute inset-0 z-30" style={{ transformStyle: 'preserve-3d' }}>
            <BuildingBlock type={dragPreview} connect={previewConnect} age={0} dayPhase={dayPhase} isPreview />
          </div>
        )}

        {dragPreview === 'ROAD' && (
          <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center opacity-60" style={{ transform: 'translateZ(2px)' }}>
            <div className="absolute inset-0 bg-slate-700" />
            <div className="relative flex h-full w-full items-center justify-center">
              <div className="z-10 h-1.5 w-1.5 rounded-full bg-white/50" />
            </div>
          </div>
        )}

        {dragPreview === 'DEMOLISH' && (
          <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center border-2 border-red-500 bg-red-500/40" style={{ transform: 'translateZ(41px)' }}>
            <div className="text-xs font-bold text-white">X</div>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 z-20 border-2 border-white/50 bg-white/20 opacity-0 transition-opacity duration-150 group-hover:opacity-100" style={{ transform: 'translateZ(1px)' }} />

        {!isEmpty && !isOcean && !isRoad && <BuildingBlock type={type} connect={connect} age={age} dayPhase={dayPhase} />}

        {isRoad && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center" style={{ transform: 'translateZ(1px)' }}>
            <div className="absolute inset-0 rounded-sm bg-slate-600" />
            {connect.top && <div className="absolute top-0 h-[55%] w-6 bg-slate-600" />}
            {connect.bottom && <div className="absolute bottom-0 h-[55%] w-6 bg-slate-600" />}
            {connect.left && <div className="absolute left-0 h-6 w-[55%] bg-slate-600" />}
            {connect.right && <div className="absolute right-0 h-6 w-[55%] bg-slate-600" />}
            <div className="relative flex h-full w-full items-center justify-center">
              <div className="z-10 h-1.5 w-1.5 rounded-full bg-white/50" />
              {connect.top && <div className="absolute top-0 h-[50%] w-0.5 border-l-2 border-dashed border-white/60" />}
              {connect.bottom && <div className="absolute bottom-0 h-[50%] w-0.5 border-l-2 border-dashed border-white/60" />}
              {connect.left && <div className="absolute left-0 h-0.5 w-[50%] border-t-2 border-dashed border-white/60" />}
              {connect.right && <div className="absolute right-0 h-0.5 w-[50%] border-t-2 border-dashed border-white/60" />}
            </div>
          </div>
        )}

        {isOcean && (
          <div className="absolute inset-0 overflow-hidden bg-cyan-500/40 backdrop-blur-[1px]">
            <Waves size={16} className="absolute left-2 top-2 animate-pulse text-cyan-200 opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-cyan-900/50" />
          </div>
        )}
      </div>
    );
  },
);

GridCell.displayName = 'GridCell';

export default GridCell;
