import React from 'react';
import { TreePine } from 'lucide-react';
import { BUILDING_TYPES } from '../game/constants';
import { BuildingTypeID, DayPhase } from '../types';

interface Props {
  type: BuildingTypeID;
  connect: { top: boolean; bottom: boolean; left: boolean; right: boolean };
  age: number;
  dayPhase: DayPhase;
  isPreview?: boolean;
}

const BuildingBlock = React.memo(({ type, connect, age, dayPhase, isPreview }: Props) => {
  const info = BUILDING_TYPES[type];
  const height = info.heightClass || 'h-8';
  const isNew = age === 0;
  const isPark = type === 'PARK';
  const animationClass = isNew ? (isPark ? 'park-grow-in' : 'building-drop-in') : '';

  const style = {
    backgroundColor: info.color,
    transformStyle: 'preserve-3d' as const,
    opacity: isPreview ? 0.6 : 1,
  };

  const getFaceStyle = () => {
    if (type === 'RESIDENTIAL') {
      return {
        backgroundImage: `
          linear-gradient(#334155 2px, transparent 2px),
          linear-gradient(90deg, #334155 2px, transparent 2px),
          linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)
        `,
        backgroundSize: '12px 12px, 12px 12px, 6px 6px',
        backgroundColor: '#fcd34d',
      };
    }

    if (type === 'COMMERCIAL') {
      return {
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.1) 100%), #60a5fa',
        borderBottom: '4px solid #1e3a8a',
      };
    }

    if (type === 'INDUSTRIAL') {
      return {
        backgroundImage: 'repeating-linear-gradient(45deg, #fbbf24, #fbbf24 10px, #000 10px, #000 20px)',
        border: '1px solid #000',
      };
    }

    return {};
  };

  const faceStyle = getFaceStyle();
  const topTransform =
    type === 'COMMERCIAL'
      ? 'translateZ(24px)'
      : type === 'INDUSTRIAL'
        ? 'translateZ(40px)'
        : type === 'RESIDENTIAL'
          ? 'translateZ(32px)'
          : type === 'ROAD'
            ? 'translateZ(2px)'
            : 'translateZ(8px)';

  const WindowLight = () => (
    <div
      className="mx-auto my-1 h-3 w-2 bg-yellow-100 shadow-[0_0_5px_rgba(253,224,71,0.8)] transition-opacity duration-1000"
      style={{ opacity: 'var(--window-opacity)' }}
    />
  );

  return (
    <div className={`absolute inset-1 pointer-events-none ${animationClass}`} style={{ transformStyle: 'preserve-3d' }}>
      <div
        className={`absolute bottom-0 left-0 right-0 ${height} brightness-90`}
        style={{ ...style, ...faceStyle, transform: 'rotateX(-90deg)', transformOrigin: 'bottom' }}
      >
        {type === 'COMMERCIAL' && (
          <div
            className="absolute bottom-0 left-0 right-0 h-4 origin-bottom bg-red-500"
            style={{
              transform: 'rotateX(45deg)',
              backgroundImage:
                'repeating-linear-gradient(90deg, #ef4444, #ef4444 6px, #ffffff 6px, #ffffff 12px)',
              boxShadow: '0 5px 5px rgba(0,0,0,0.3)',
            }}
          />
        )}
      </div>

      <div
        className={`absolute left-0 bottom-0 top-0 ${height} overflow-hidden brightness-75`}
        style={{ ...style, ...faceStyle, width: '100%', transform: 'rotateY(90deg)', transformOrigin: 'left' }}
      >
        {type === 'RESIDENTIAL' && (
          <div className="flex h-full w-full flex-col justify-evenly">
            <div className="flex w-full justify-evenly">
              <WindowLight />
              <WindowLight />
            </div>
            <div className="flex w-full justify-evenly">
              <WindowLight />
              <WindowLight />
            </div>
          </div>
        )}
        {type === 'COMMERCIAL' && <div className="absolute inset-2 border border-white/20 bg-blue-900/30" />}
      </div>

      <div
        className={`absolute right-0 bottom-0 top-0 ${height} overflow-hidden brightness-50`}
        style={{ ...style, ...faceStyle, width: '100%', transform: 'rotateY(90deg)', transformOrigin: 'right' }}
      >
        {type === 'RESIDENTIAL' && (
          <div className="flex h-full w-full flex-col justify-evenly">
            <div className="flex w-full justify-evenly">
              <WindowLight />
              <WindowLight />
            </div>
          </div>
        )}
      </div>

      <div
        className={`absolute left-0 right-0 top-0 ${height} brightness-50`}
        style={{ ...style, ...faceStyle, transform: 'rotateX(-90deg)', transformOrigin: 'top' }}
      />

      <div
        className="absolute inset-0 flex items-center justify-center transition-all duration-1000"
        data-phase={dayPhase}
        style={{
          ...style,
          transform: topTransform,
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)',
        }}
      >
        {type === 'RESIDENTIAL' && (
          <div className="relative h-full w-full border-4 border-orange-400 bg-orange-300">
            <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-600 shadow-md" />
            <div className="absolute right-1 top-1 h-2 w-3 border border-gray-400 bg-gray-300" />
          </div>
        )}

        {type === 'COMMERCIAL' && (
          <div className="relative h-full w-full overflow-hidden bg-slate-300">
            <div className="absolute inset-1 border-2 border-slate-400 bg-slate-200" />
            <div className="absolute left-2 top-2 h-4 w-4 rounded-full bg-gray-800 opacity-20" />
          </div>
        )}

        {type === 'PARK' && (
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[2px] bg-emerald-500/50">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.16),transparent_40%),radial-gradient(circle_at_70%_70%,rgba(16,185,129,0.3),transparent_48%)]" />
            <div className={`flex items-center justify-center rounded-full border-2 border-stone-300 bg-cyan-400 shadow-inner ${isPreview ? 'h-5 w-5' : 'h-6 w-6'}`}>
              <div className={`rounded-full bg-cyan-300 ${isPreview ? 'h-2.5 w-2.5' : 'h-3 w-3 animate-pulse'}`} />
            </div>
            {!isPreview && (
              <>
                <TreePine
                  size={18}
                  className="absolute left-0 top-0 text-emerald-900 drop-shadow-lg"
                  style={{ transform: 'rotateX(-45deg) translate(-2px, -4px)' }}
                />
                <TreePine
                  size={16}
                  className="absolute bottom-0 right-0 text-emerald-800 drop-shadow-lg"
                  style={{ transform: 'rotateX(-45deg) translate(2px, 4px)' }}
                />
              </>
            )}
          </div>
        )}

        {type === 'INDUSTRIAL' && (
          <div className="relative flex h-full w-full items-center justify-center border-2 border-gray-600 bg-gray-800">
            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,#000_2px,#000_4px)] opacity-20" />
            <div className="relative h-5 w-5 rounded-full border border-gray-600 bg-black shadow-[0_0_10px_rgba(0,0,0,0.8)]">
              <div className="absolute inset-0 rounded-full bg-orange-900 opacity-50 animate-pulse" />
              {[0, 1].map((index) => (
                <div
                  key={index}
                  className="absolute -top-2 left-1 h-3 w-3 rounded-full bg-gray-500 opacity-0 blur-sm animate-ping"
                  style={{ animationDelay: `${index * 1.5}s`, animationDuration: '3s' }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

BuildingBlock.displayName = 'BuildingBlock';

export default BuildingBlock;
