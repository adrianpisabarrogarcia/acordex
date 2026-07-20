import React from 'react';
import { getChordDiagram } from '../utils/chordDb';
import { X } from 'lucide-react';

interface ChordDiagramModalProps {
  chordName: string | null;
  onClose: () => void;
}

export const ChordDiagramModal: React.FC<ChordDiagramModalProps> = ({ chordName, onClose }) => {
  if (!chordName) return null;

  const chord = getChordDiagram(chordName);
  const strings = [6, 5, 4, 3, 2, 1]; // Low E to High e

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative bg-slate-900 border border-slate-700/80 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
          aria-label="Cerrar diagramas"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold">Diagrama de Acorde</span>
          <h3 className="text-3xl font-bold text-white font-chord">{chordName}</h3>
        </div>

        {/* SVG Guitar Fretboard */}
        <div className="flex justify-center my-4">
          <svg width="200" height="220" viewBox="0 0 200 220" className="select-none">
            {/* Base fret label if > 1 */}
            {chord.baseFret && chord.baseFret > 1 && (
              <text x="15" y="45" fill="#94a3b8" fontSize="12" fontWeight="bold" textAnchor="end">
                {chord.baseFret}fr
              </text>
            )}

            {/* Nut line (top thick line if baseFret is 1 or undefined) */}
            <line
              x1="30"
              y1="35"
              x2="170"
              y2="35"
              stroke={!chord.baseFret || chord.baseFret === 1 ? "#f8fafc" : "#64748b"}
              strokeWidth={!chord.baseFret || chord.baseFret === 1 ? "5" : "2"}
            />

            {/* Fretboard Grid: 5 Frets */}
            {[1, 2, 3, 4, 5].map((fret) => {
              const y = 35 + fret * 32;
              return (
                <line
                  key={`fret-${fret}`}
                  x1="30"
                  y1={y}
                  x2="170"
                  y2={y}
                  stroke="#475569"
                  strokeWidth="1.5"
                />
              );
            })}

            {/* 6 Vertical Strings */}
            {strings.map((strNum, idx) => {
              const x = 30 + idx * 28;
              const fretVal = chord.frets[idx];

              return (
                <g key={`string-${strNum}`}>
                  {/* String Line */}
                  <line
                    x1={x}
                    y1="35"
                    x2={x}
                    y2="195"
                    stroke="#64748b"
                    strokeWidth={1 + (6 - strNum) * 0.4}
                  />

                  {/* Open / Muted Indicator above Nut */}
                  {fretVal === -1 ? (
                    <text x={x} y="25" fill="#ef4444" fontSize="14" fontWeight="bold" textAnchor="middle">
                      ✕
                    </text>
                  ) : fretVal === 0 ? (
                    <circle cx={x} cy="22" r="4.5" fill="none" stroke="#10b981" strokeWidth="2" />
                  ) : null}
                </g>
              );
            })}

            {/* Barre chord indicator */}
            {chord.barre && (
              <rect
                x={30 + (chord.barre.startString - 1) * 28 - 7}
                y={35 + (chord.barre.fret - 0.5) * 32 - 7}
                width={(chord.barre.endString - chord.barre.startString) * 28 + 14}
                height="14"
                rx="7"
                fill="#10b981"
                opacity="0.9"
              />
            )}

            {/* Finger dots */}
            {chord.frets.map((fretVal, idx) => {
              if (fretVal <= 0) return null;
              const x = 30 + idx * 28;
              const y = 35 + (fretVal - 0.5) * 32;
              const fingerNum = chord.fingers ? chord.fingers[idx] : null;

              return (
                <g key={`dot-${idx}`}>
                  <circle cx={x} cy={y} r="10" fill="#10b981" />
                  {fingerNum && fingerNum > 0 && (
                    <text
                      x={x}
                      y={y + 4}
                      fill="#090d16"
                      fontSize="11"
                      fontWeight="extrabold"
                      textAnchor="middle"
                    >
                      {fingerNum}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        <div className="text-xs text-slate-400 bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50 flex justify-between items-center">
          <span>Leyenda:</span>
          <span className="flex items-center gap-1.5"><span className="text-red-400 font-bold">✕</span> Mutear</span>
          <span className="flex items-center gap-1.5"><span className="text-emerald-400 font-bold">◯</span> Aire</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Traste</span>
        </div>
      </div>
    </div>
  );
};
