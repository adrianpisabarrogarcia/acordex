import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Volume2, Music } from 'lucide-react';

interface MetronomeProps {
  initialBpm?: number;
}

export const Metronome: React.FC<MetronomeProps> = ({ initialBpm = 100 }) => {
  const [bpm, setBpm] = useState(initialBpm);
  const [isPlaying, setIsPlaying] = useState(false);
  const [beat, setBeat] = useState(0);
  const [timeSig, setTimeSig] = useState(4); // 4/4 default

  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerIdRef = useRef<number | null>(null);
  const currentBeatRef = useRef(0);

  const playClick = (isAccent: boolean) => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = isAccent ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(isAccent ? 1200 : 800, ctx.currentTime);

    gain.gain.setValueAtTime(1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  };

  useEffect(() => {
    if (isPlaying) {
      const intervalMs = (60 / bpm) * 1000;
      currentBeatRef.current = 0;
      setBeat(0);

      timerIdRef.current = window.setInterval(() => {
        const nextBeat = (currentBeatRef.current % timeSig) + 1;
        currentBeatRef.current = nextBeat;
        setBeat(nextBeat);
        playClick(nextBeat === 1);
      }, intervalMs);
    } else {
      if (timerIdRef.current) clearInterval(timerIdRef.current);
      setBeat(0);
    }

    return () => {
      if (timerIdRef.current) clearInterval(timerIdRef.current);
    };
  }, [isPlaying, bpm, timeSig]);

  return (
    <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl p-4 shadow-xl text-white space-y-4 max-w-sm w-full no-print">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-emerald-400" />
          <span className="font-semibold text-sm text-slate-200">Metrónomo Web</span>
        </div>
        <div className="flex gap-1 bg-slate-800 p-1 rounded-lg text-xs">
          {[3, 4, 6].map((ts) => (
            <button
              key={ts}
              onClick={() => setTimeSig(ts)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                timeSig === ts ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {ts}/4
            </button>
          ))}
        </div>
      </div>

      {/* BPM & Visual Beat Indicator */}
      <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-lg border border-slate-800">
        <div>
          <span className="text-3xl font-extrabold text-white font-mono">{bpm}</span>
          <span className="text-xs text-slate-400 ml-1.5 font-medium">BPM</span>
        </div>

        {/* Beat Pulser */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: timeSig }).map((_, i) => {
            const beatNum = i + 1;
            const isActive = isPlaying && beat === beatNum;
            const isFirst = beatNum === 1;

            return (
              <div
                key={i}
                className={`w-3.5 h-7 rounded-full transition-all duration-75 ${
                  isActive
                    ? isFirst
                      ? 'bg-amber-400 scale-110 shadow-lg shadow-amber-400/50'
                      : 'bg-emerald-400 scale-110 shadow-lg shadow-emerald-400/50'
                    : 'bg-slate-800'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* BPM Controls */}
      <div className="space-y-2">
        <input
          type="range"
          min="40"
          max="240"
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />

        <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
          <button
            onClick={() => setBpm((b) => Math.max(40, b - 5))}
            className="hover:text-emerald-400 px-2 py-1 bg-slate-800 rounded border border-slate-700"
          >
            -5
          </button>
          <button
            onClick={() => setBpm((b) => Math.max(40, b - 1))}
            className="hover:text-emerald-400 px-2 py-1 bg-slate-800 rounded border border-slate-700"
          >
            -1
          </button>
          <span>Largo / Moderato / Presto</span>
          <button
            onClick={() => setBpm((b) => Math.min(240, b + 1))}
            className="hover:text-emerald-400 px-2 py-1 bg-slate-800 rounded border border-slate-700"
          >
            +1
          </button>
          <button
            onClick={() => setBpm((b) => Math.min(240, b + 5))}
            className="hover:text-emerald-400 px-2 py-1 bg-slate-800 rounded border border-slate-700"
          >
            +5
          </button>
        </div>
      </div>

      {/* Play Button */}
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className={`w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
          isPlaying
            ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/25'
            : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25'
        }`}
      >
        {isPlaying ? (
          <>
            <Square className="w-4 h-4 fill-current" /> Detener Metrónomo
          </>
        ) : (
          <>
            <Play className="w-4 h-4 fill-current" /> Iniciar Metrónomo
          </>
        )}
      </button>
    </div>
  );
};
