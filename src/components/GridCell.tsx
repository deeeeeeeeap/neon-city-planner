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

const RoadTile = ({ connect, preview = false }: { connect: { top: boolean; bottom: boolean; left: boolean; right: boolean }; preview?: boolean }) => {
  const asphalt = preview ? 'bg-slate-500/80' : 'bg-slate-600';
  const shoulder = preview ? 'bg-slate-500/25' : 'bg-slate-800/80';
  const edgeLine = preview ? 'border-white/35' : 'border-white/45';
  const centerLine = preview ? 'border-amber-100/45' : 'border-amber-100/70';

  const RoadArm = ({ className }: { className: string }) => (
    <div className={`absolute ${className} ${asphalt} shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]`} />
  );

  const Marking = ({ className, vertical = false }: { className: string; vertical?: boolean }) => (
    <div
      className={`absolute ${className} ${vertical ? 'w-0.5 border-l-2' : 'h-0.5 border-t-2'} border-dashed ${centerLine}`}
    />
  );

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center" style={{ transform: 'translateZ(1px)' }}>
      <div className={`absolute inset-0 rounded-[8px] ${shoulder}`} />
      <RoadArm className="left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-[4px]" />
      {connect.top && <RoadArm className="left-1/2 top-0 h-[55%] w-6 -translate-x-1/2 rounded-t-[4px]" />}
      {connect.bottom && <RoadArm className="bottom-0 left-1/2 h-[55%] w-6 -translate-x-1/2 rounded-b-[4px]" />}
      {connect.left && <RoadArm className="left-0 top-1/2 h-6 w-[55%] -translate-y-1/2 rounded-l-[4px]" />}
      {connect.right && <RoadArm className="right-0 top-1/2 h-6 w-[55%] -translate-y-1/2 rounded-r-[4px]" />}

      <div className={`absolute inset-[5px] rounded-[6px] border ${edgeLine}`} />
      {connect.top && <Marking className="left-1/2 top-0 h-[42%] -translate-x-1/2" vertical />}
      {connect.bottom && <Marking className="bottom-0 left-1/2 h-[42%] -translate-x-1/2" vertical />}
      {connect.left && <Marking className="left-0 top-1/2 w-[42%] -translate-y-1/2" />}
      {connect.right && <Marking className="right-0 top-1/2 w-[42%] -translate-y-1/2" />}

      <div className={`absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full ${preview ? 'bg-white/35' : 'bg-white/55'}`} />
    </div>
  );
};

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
      <div
        data-grid-cell="true"
        data-x={x}
        data-y={y}
        onMouseDown={onMouseDown}
        onMouseEnter={onMouseEnter}
        className="group relative h-12 w-12 cursor-pointer"
        style={{ transformStyle: 'preserve-3d' }}
      >
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
          <div className="absolute inset-0 z-30 opacity-80">
            <RoadTile connect={connect} preview />
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
          <RoadTile connect={connect} />
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
