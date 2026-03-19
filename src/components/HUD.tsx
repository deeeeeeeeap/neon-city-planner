import type React from 'react';
import { Coins, Factory, Languages, RotateCcw, Smile, Trophy, Users } from 'lucide-react';

interface Props {
  title: string;
  playerName: string;
  guestLabel: string;
  resources: { budget: number; population: number; happiness: number; pollution: number };
  labels: { budget: string; population: string; happiness: string; pollution: string; leaderboard: string };
  statDescriptions: { budget: string; population: string; happiness: string; pollution: string };
  onToggleLang: () => void;
  onToggleLeaderboard: () => void;
  onReset: () => void;
  onStatHover: (label: string, text: string, event: React.MouseEvent<HTMLDivElement>) => void;
  onClearHover: () => void;
}

function StatItem({ icon: Icon, value, color, label, onMouseEnter, onMouseLeave }: { icon: typeof Coins; value: string | number; color: string; label: string; onMouseEnter?: (event: React.MouseEvent<HTMLDivElement>) => void; onMouseLeave?: () => void }) {
  return (
    <div className="group flex cursor-help flex-col items-center px-3 transition-transform hover:scale-105" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <div className="mb-0.5 text-[10px] uppercase tracking-widest text-slate-500 transition-colors group-hover:text-slate-300">{label}</div>
      <div className="flex items-center gap-1.5"><Icon size={14} className={color} /><span className="font-mono font-bold text-slate-200">{value}</span></div>
    </div>
  );
}

export default function HUD(props: Props) {
  return (
    <div className="glass-panel relative z-50 flex items-center justify-between border-b border-white/10 p-4">
      <div className="flex items-center gap-6">
        <h1 className="text-gradient text-2xl font-black italic drop-shadow-lg">{props.title}</h1>
        <div className="flex gap-4 font-mono text-sm">
          <StatItem icon={Coins} value={`$${props.resources.budget}`} color="text-yellow-400" label={props.labels.budget} onMouseEnter={(event) => props.onStatHover(props.labels.budget, props.statDescriptions.budget, event)} onMouseLeave={props.onClearHover} />
          <StatItem icon={Users} value={props.resources.population} color="text-blue-300" label={props.labels.population} onMouseEnter={(event) => props.onStatHover(props.labels.population, props.statDescriptions.population, event)} onMouseLeave={props.onClearHover} />
          <StatItem icon={Smile} value={props.resources.happiness} color="text-green-400" label={props.labels.happiness} onMouseEnter={(event) => props.onStatHover(props.labels.happiness, props.statDescriptions.happiness, event)} onMouseLeave={props.onClearHover} />
          <StatItem icon={Factory} value={props.resources.pollution} color="text-gray-400" label={props.labels.pollution} onMouseEnter={(event) => props.onStatHover(props.labels.pollution, props.statDescriptions.pollution, event)} onMouseLeave={props.onClearHover} />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="glass-panel-light flex items-center gap-2 rounded-full px-4 py-1.5"><div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" /><span className="text-xs font-bold uppercase tracking-wider text-slate-200">{props.playerName || props.guestLabel}</span></div>
        <button onClick={props.onToggleLang} className="glass-panel-light rounded-full p-2.5 text-blue-300 transition-all hover:bg-white/10 hover:text-white hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]" title="Switch Language"><Languages size={18} /></button>
        <button onClick={props.onToggleLeaderboard} className="glass-panel-light rounded-full p-2.5 text-yellow-400 transition-all hover:bg-white/10 hover:text-yellow-300 hover:shadow-[0_0_15px_rgba(250,204,21,0.5)]" title={props.labels.leaderboard}><Trophy size={18} /></button>
        <button onClick={props.onReset} className="glass-panel-light rounded-full p-2.5 text-red-400 transition-all hover:bg-white/10 hover:text-red-300 hover:shadow-[0_0_15px_rgba(248,113,113,0.5)]" title="Reset Game"><RotateCcw size={18} /></button>
      </div>
    </div>
  );
}
