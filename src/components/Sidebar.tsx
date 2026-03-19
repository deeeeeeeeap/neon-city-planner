import { Ban, Play } from 'lucide-react';
import { BUILDING_TYPES, CONSTRUCTION_PHASE_END, MAX_TURNS } from '@/src/game/constants';
import type { BuildingTypeID, BuildingDef, Language } from '@/src/types';

interface Props {
  gameStarted: boolean;
  selectedTool: BuildingTypeID;
  turn: number;
  isGameOver: boolean;
  isTransitioning: boolean;
  lang: Language;
  labels: {
    tools: string;
    phaseBuild: string;
    phaseRestricted: string;
    turn: string;
    nextTurn: string;
    finishGame: string;
  };
  onSelectTool: (tool: BuildingTypeID) => void;
  onToolHover: (label: string, description: string, cost: number, top: number) => void;
  onClearHover: () => void;
  onNextTurn: () => void;
}

export default function Sidebar(props: Props) {
  return (
    <div
      className={`glass-panel z-40 flex w-72 flex-col gap-3 rounded-r-3xl border-y border-r border-white/10 p-5 shadow-2xl transition-transform duration-500 ${
        !props.gameStarted ? '-translate-x-full' : 'translate-x-0'
      }`}
    >
      <div className="mb-1 flex items-center justify-between px-1">
        <div className="text-xs font-bold uppercase tracking-widest text-slate-400">{props.labels.tools}</div>
        <div
          className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
            props.turn > CONSTRUCTION_PHASE_END
              ? 'border-red-500/50 bg-red-500/20 text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
              : 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
          }`}
        >
          {props.turn > CONSTRUCTION_PHASE_END ? props.labels.phaseRestricted : props.labels.phaseBuild}
        </div>
      </div>
      <div className="flex-1 space-y-2.5 overflow-y-auto pr-2 custom-scrollbar">
        {(Object.entries(BUILDING_TYPES) as [BuildingTypeID, BuildingDef][]).map(([key, type]) => {
          if (key === 'EMPTY' || key === 'OCEAN') return null;
          const isDisabled = props.turn > CONSTRUCTION_PHASE_END && key !== 'DEMOLISH';
          const isSelected = props.selectedTool === key;
          const label = props.lang === 'en' ? type.labelEn : type.label;
          const description = props.lang === 'en' ? type.descriptionEn : type.description;
          return (
            <button
              key={key}
              onClick={() => props.onSelectTool(key)}
              onMouseEnter={(event) => props.onToolHover(label, description, type.cost, event.currentTarget.getBoundingClientRect().top)}
              onMouseLeave={props.onClearHover}
              className={`group relative flex w-full items-center gap-4 rounded-xl border p-3 text-left transition-all duration-300 ${
                isSelected 
                  ? 'translate-x-2 border-blue-400/50 bg-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.3)]' 
                  : 'border-transparent bg-white/5 hover:translate-x-1 hover:border-white/10 hover:bg-white/10'
              } ${isDisabled ? 'cursor-not-allowed opacity-40 grayscale' : ''}`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg shadow-inner transition-colors duration-300 ${isSelected ? 'bg-blue-600 shadow-[inset_0_0_10px_rgba(255,255,255,0.3)]' : 'bg-black/40 group-hover:bg-black/60'}`} style={{ color: isSelected ? 'white' : type.color }}>
                {type.icon ? <type.icon size={22} className={isSelected ? 'drop-shadow-md' : ''} /> : <div className="h-5 w-5" />}
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="text-sm font-bold text-slate-200 transition-colors group-hover:text-white">{label}</span>
                <span className="font-mono text-xs font-medium text-slate-400">${type.cost}</span>
              </div>
              {isDisabled && <Ban className="absolute right-4 text-red-500/80" size={18} />}
              {isSelected && <div className="absolute right-3 h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />}
            </button>
          );
        })}
      </div>
      <div className="border-t border-white/10 pt-5">
        <div className="mb-3 flex items-center justify-between px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <span>{props.labels.turn} PROGRESS</span>
          <span className="font-mono text-white drop-shadow-md">{props.turn > MAX_TURNS ? MAX_TURNS : props.turn} <span className="text-slate-600">/</span> {MAX_TURNS}</span>
        </div>
        <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800 shadow-inner">
          <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-500" style={{ width: `${(props.turn / MAX_TURNS) * 100}%` }} />
        </div>
        <button onClick={props.onNextTurn} disabled={props.isTransitioning || props.isGameOver} className={`neon-glow group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl py-4 text-sm font-black uppercase tracking-widest text-white shadow-lg transition-all duration-300 ${
          props.isGameOver 
            ? 'cursor-not-allowed bg-slate-800 text-slate-500 shadow-none' 
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900'
        } ${props.isTransitioning ? 'scale-95 cursor-not-allowed opacity-50 grayscale' : 'active:scale-95'}`}>
          {!props.isGameOver && <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />}
          <Play size={18} fill="currentColor" className="relative z-10 transition-transform group-hover:scale-110" /> 
          <span className="relative z-10">{props.turn >= MAX_TURNS ? props.labels.finishGame : props.labels.nextTurn}</span>
        </button>
      </div>
    </div>
  );
}
