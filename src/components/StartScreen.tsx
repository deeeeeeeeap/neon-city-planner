import { Play } from 'lucide-react';

interface Props {
  playerName: string;
  onPlayerNameChange: (value: string) => void;
  onStart: () => void;
  disabled: boolean;
  title: string;
  terminalTitle: string;
  enterNameLabel: string;
  enterNamePlaceholder: string;
  startLabel: string;
}

export default function StartScreen(props: Props) {
  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="glass-panel relative w-[30rem] overflow-hidden rounded-3xl p-12 text-center transition-all hover:shadow-[0_0_50px_rgba(59,130,246,0.3)]">
        <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
        
        <h1 className="text-gradient relative z-10 mb-3 text-5xl font-black italic tracking-tight">{props.title}</h1>
        <p className="relative z-10 mb-10 font-mono text-sm tracking-widest text-blue-200/60 uppercase">{props.terminalTitle}</p>
        
        <div className="relative z-10 space-y-6">
          <div className="text-left">
            <label className="ml-2 block text-xs font-bold uppercase tracking-widest text-blue-300/70">{props.enterNameLabel}</label>
            <input
              type="text"
              value={props.playerName}
              onChange={(event) => props.onPlayerNameChange(event.target.value)}
              placeholder={props.enterNamePlaceholder}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-5 py-4 text-lg font-bold text-white outline-none transition-all placeholder:text-slate-600 focus:border-blue-400 focus:bg-black/60 focus:shadow-[0_0_20px_rgba(59,130,246,0.2)] focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <button onClick={props.onStart} disabled={props.disabled} className="neon-glow group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 font-bold text-white transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:grayscale hover:from-blue-500 hover:to-indigo-500">
            <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
            <Play fill="currentColor" size={20} className="transition-transform group-hover:scale-110" /> {props.startLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
