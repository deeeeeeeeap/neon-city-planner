import { Smile, Trophy, Users, X } from 'lucide-react';

import { LeaderboardEntry } from '../types';

interface Props {
  entries: LeaderboardEntry[];
  rankingLabel: string;
  emptyLabel: string;
  onClose: () => void;
}

export default function LeaderboardModal(props: Props) {
  return (
    <div className="absolute inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex max-h-[80vh] w-[32rem] flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-2xl">
        <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-3 text-2xl font-black text-white">
            <Trophy className="text-yellow-400" size={28} /> {props.rankingLabel}
          </h2>
          <button onClick={props.onClose} className="text-slate-500 transition-colors hover:text-white" aria-label="Close leaderboard">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto pr-2">
          {props.entries.length === 0 && (
            <div className="py-10 text-center text-slate-500">{props.emptyLabel}</div>
          )}
          {props.entries.map((entry, index) => (
            <div key={`${entry.id ?? entry.name}-${index}`} className="flex items-center justify-between rounded-xl border border-slate-700/50 bg-slate-800/50 p-4 transition-colors hover:border-slate-500">
              <div className="flex items-center gap-4">
                <div className={`w-8 text-center text-lg font-black ${index < 3 ? 'scale-110 text-yellow-400' : 'text-slate-500'}`}>
                  #{index + 1}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{entry.name}</div>
                  <div className="text-[10px] text-slate-500">{new Date(entry.timestamp || Date.now()).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-emerald-400">{entry.score.toLocaleString()}</div>
                <div className="mt-1 flex justify-end gap-3 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1"><Users size={10} />{entry.population}</span>
                  <span className="flex items-center gap-1"><Smile size={10} />{entry.happiness}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
