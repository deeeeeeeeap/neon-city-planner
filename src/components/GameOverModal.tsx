import { RotateCcw, Users } from 'lucide-react';

interface Props {
  score: number;
  population: number;
  happiness: number;
  simulationComplete: string;
  finalScoreLabel: string;
  populationLabel: string;
  happinessLabel: string;
  playAgainLabel: string;
  newPlayerLabel: string;
  onRestartSamePlayer: () => void;
  onNewPlayer: () => void;
}

export default function GameOverModal(props: Props) {
  return (
    <div className="absolute inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-300">
      <div className="relative w-[32rem] rounded-2xl border border-slate-600 bg-slate-900 p-8 text-center shadow-2xl">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 rounded-full bg-yellow-400 px-6 py-2 font-black uppercase tracking-widest text-black shadow-lg shadow-yellow-400/50">{props.simulationComplete}</div>
        <div className="mb-8 mt-4">
          <div className="mb-2 font-mono text-sm text-slate-400">{props.finalScoreLabel}</div>
          <div className="text-6xl font-black tracking-tighter text-white drop-shadow-lg">{props.score.toLocaleString()}</div>
        </div>
        <div className="mb-8 grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
            <div className="text-xs uppercase text-slate-500">{props.populationLabel}</div>
            <div className="text-2xl font-bold text-blue-300">{props.population}</div>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
            <div className="text-xs uppercase text-slate-500">{props.happinessLabel}</div>
            <div className="text-2xl font-bold text-green-300">{props.happiness}</div>
          </div>
        </div>
        <div className="space-y-3">
          <button onClick={props.onRestartSamePlayer} className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-700 py-3 font-bold text-white transition-colors hover:bg-slate-600">
            <RotateCcw size={18} /> {props.playAgainLabel}
          </button>
          <button onClick={props.onNewPlayer} className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-slate-700 bg-slate-800 py-3 font-bold text-slate-300 transition-all hover:border-slate-500 hover:bg-slate-700">
            <Users size={18} /> {props.newPlayerLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
