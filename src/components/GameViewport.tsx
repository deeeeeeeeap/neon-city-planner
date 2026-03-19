import type React from 'react';
import { Moon, Sun } from 'lucide-react';

import { GRID_SIZE } from '../game/constants';
import { BuildingTypeID, CellData, DayPhase } from '../types';
import GridCell from './GridCell';

interface Props {
  grid: CellData[][];
  currentTurn: number;
  dayPhase: DayPhase;
  isTransitioning: boolean;
  selectedTool: BuildingTypeID;
  dragPreview: Set<string>;
  notification: string;
  onCellMouseDown: (x: number, y: number, event: React.MouseEvent) => void;
  onCellMouseEnter: (x: number, y: number) => void;
}

export default function GameViewport(props: Props) {
  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-radial-gradient">
      <div className="pointer-events-none absolute inset-0">
        <div
          className={`absolute right-24 z-0 transition-all duration-[1500ms] ease-in-out ${
            props.dayPhase === 'day' || props.dayPhase === 'sunrise' ? 'top-12 opacity-100' : 'top-[120%] opacity-0'
          }`}
        >
          <div className="absolute -inset-10 rounded-full bg-yellow-400 opacity-40 blur-2xl" />
          <div className="relative text-yellow-300">
            <Sun size={80} strokeWidth={1.5} />
          </div>
        </div>

        <div
          className={`absolute left-1/3 z-0 text-slate-200 transition-all duration-[1500ms] ease-in-out ${
            props.dayPhase === 'night' ? 'top-16 scale-100 opacity-100' : '-top-40 scale-50 opacity-0'
          }`}
        >
          <div className="absolute -inset-8 rounded-full bg-blue-100 opacity-20 blur-3xl" />
          <Moon size={64} fill="#e2e8f0" />
        </div>
      </div>

      <div
        className="transition-all duration-1000"
        style={{
          transform: `perspective(1000px) rotateX(25deg) scale(${props.isTransitioning ? 0.95 : 1})`,
          transformStyle: 'preserve-3d',
        }}
      >
        <div
          className="relative z-10 grid gap-[2px] p-8 transition-transform duration-500"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            boxShadow:
              props.dayPhase === 'night'
                ? '0 50px 100px -20px rgba(0,0,0,0.8)'
                : '0 50px 100px -20px rgba(0,0,0,0.5)',
            background: 'rgba(15, 23, 42, 0.5)',
            borderRadius: '4px',
            border: '1px solid rgba(255,255,255,0.05)',
            transformStyle: 'preserve-3d',
          }}
        >
          {props.grid.map((row, y) =>
            row.map((cell, x) => (
              <GridCell
                key={`${x}-${y}`}
                cell={cell}
                grid={props.grid}
                currentTurn={props.currentTurn}
                dayPhase={props.dayPhase}
                dragPreview={props.dragPreview.has(`${x},${y}`) ? props.selectedTool : undefined}
                onMouseDown={(event) => props.onCellMouseDown(x, y, event)}
                onMouseEnter={() => props.onCellMouseEnter(x, y)}
              />
            )),
          )}
        </div>
      </div>

      {props.notification && (
        <div className="absolute left-1/2 top-8 z-[70] -translate-x-1/2 animate-bounce rounded-full bg-blue-500/90 px-8 py-3 font-bold tracking-wide text-white shadow-[0_0_20px_rgba(59,130,246,0.5)] backdrop-blur">
          {props.notification}
        </div>
      )}
    </div>
  );
}
