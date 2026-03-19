interface Props {
  label: string;
  text: string;
  y: number;
  cost?: number;
  estimatedCostLabel: string;
}

export default function Tooltip(props: Props) {
  return (
    <div
      className="pointer-events-none fixed z-[100] w-80 rounded-lg border border-blue-500/30 bg-slate-800/95 p-5 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
      style={{ left: props.cost !== undefined ? '19rem' : '50%', top: props.y, transform: props.cost !== undefined ? 'translateY(-10%)' : 'translateX(-50%)' }}
    >
      <div className="mb-2 text-lg font-bold text-blue-300">{props.label}</div>
      <div className="whitespace-pre-line font-mono text-sm leading-relaxed text-slate-300">{props.text}</div>
      {props.cost !== undefined && (
        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
          <span className="text-xs uppercase tracking-wider text-slate-500">{props.estimatedCostLabel}</span>
          <span className="font-mono text-lg font-bold text-yellow-400">${props.cost}</span>
        </div>
      )}
      {props.cost !== undefined ? (
        <div className="absolute left-0 top-6 h-0 w-0 -translate-x-full border-b-[8px] border-r-[8px] border-t-[8px] border-b-transparent border-r-slate-800/95 border-t-transparent" />
      ) : (
        <div className="absolute left-1/2 top-0 h-0 w-0 -translate-x-1/2 -translate-y-full border-b-[8px] border-l-[8px] border-r-[8px] border-l-transparent border-r-transparent border-b-slate-800/95" />
      )}
    </div>
  );
}
