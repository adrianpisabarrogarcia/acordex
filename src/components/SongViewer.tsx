import React, { useState, useEffect, useRef } from 'react';
import { 
  parseSongText, 
  transposeNote, 
  type SongLine 
} from '../utils/chordTransposer';
import { ChordDiagramModal } from './ChordDiagramModal';
import { Metronome } from './Metronome';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Printer, 
  Volume2, 
  Music, 
  Maximize2, 
  Info,
  Sparkles
} from 'lucide-react';

interface SongViewerProps {
  title: string;
  artist: string;
  originalKey: string;
  originalCapo?: number;
  tempo?: number;
  timeSignature?: string;
  strumming?: string;
  rawContent: string;
  youtubeUrl?: string;
}

const FLAT_KEYS = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm'];

export const SongViewer: React.FC<SongViewerProps> = ({
  title,
  artist,
  originalKey,
  originalCapo = 0,
  tempo = 100,
  timeSignature = '4/4',
  strumming,
  rawContent,
  youtubeUrl,
}) => {
  // Transposition & Capo state
  const [semitones, setSemitones] = useState(0);
  const [capo, setCapo] = useState(originalCapo);

  // Auto-scroll state
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(2); // 1-5 speed scale

  // UI Customization
  const [fontSize, setFontSize] = useState(18); // px
  const [stageMode, setStageMode] = useState(false);
  const [showMetronome, setShowMetronome] = useState(false);
  const [selectedChord, setSelectedChord] = useState<string | null>(null);

  // 1. Sounding key calculation (the real audio pitch coming out of the guitar)
  const preferFlats = FLAT_KEYS.includes(originalKey);
  const soundingKey = transposeNote(originalKey, semitones, preferFlats);

  // 2. Net chord shape transposition:
  // When a capo is placed on fret N, the finger shapes transpose down by N semitones relative to key transposition
  const netShapeTransposition = semitones - (capo - originalCapo);

  // 3. Parse lines with net shape transposition and flat preference
  const parsedLines: SongLine[] = parseSongText(rawContent, netShapeTransposition, preferFlats);

  // Extract unique chords used in this song for the top chord bar
  const uniqueChords = Array.from(
    new Set(
      parsedLines
        .flatMap((line) => line.segments)
        .filter((seg) => seg.chord)
        .map((seg) => seg.chord!)
    )
  );

  const isCustomized = semitones !== 0 || capo !== originalCapo;
  const resetKeyAndCapo = () => {
    setSemitones(0);
    setCapo(originalCapo);
  };

  // Auto-scroll animation loop
  const scrollRef = useRef<number | null>(null);
  useEffect(() => {
    if (isScrolling) {
      scrollRef.current = window.setInterval(() => {
        window.scrollBy({ top: scrollSpeed, behavior: 'smooth' });
      }, 50);
    } else {
      if (scrollRef.current) clearInterval(scrollRef.current);
    }
    return () => {
      if (scrollRef.current) clearInterval(scrollRef.current);
    };
  }, [isScrolling, scrollSpeed]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${stageMode ? 'bg-black text-amber-100' : 'bg-slate-950 text-slate-100'}`}>
      
      {/* Top Floating Control Toolbar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-2xl px-4 py-3 no-print">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Song Info summary */}
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
              {title}
              <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                Tono real: {soundingKey}
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">{artist}</p>
          </div>

          {/* Interactive Toolbars */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Transposer Group */}
            <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700/60 shadow-inner">
              <span className="text-xs text-slate-400 font-medium px-2 flex items-center gap-1">
                <Music className="w-3.5 h-3.5 text-emerald-400" /> Tono
              </span>
              <button
                onClick={() => setSemitones((s) => s - 1)}
                className="px-2.5 py-1 text-xs font-bold bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition active:scale-95"
                title="Bajar 1 semitono"
              >
                -1
              </button>
              <span className="w-8 text-center font-mono font-bold text-sm text-emerald-400">
                {semitones > 0 ? `+${semitones}` : semitones}
              </span>
              <button
                onClick={() => setSemitones((s) => s + 1)}
                className="px-2.5 py-1 text-xs font-bold bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition active:scale-95"
                title="Subir 1 semitono"
              >
                +1
              </button>
            </div>

            {/* Capo Selector */}
            <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700/60">
              <span className="text-xs text-slate-400 font-medium px-2">Cejilla</span>
              <select
                value={capo}
                onChange={(e) => setCapo(Number(e.target.value))}
                className="bg-slate-900 text-amber-400 font-bold text-xs rounded-lg px-2 py-1 border border-slate-700 outline-none cursor-pointer"
              >
                <option value={0}>Sin cejilla</option>
                <option value={1}>Traste 1</option>
                <option value={2}>Traste 2</option>
                <option value={3}>Traste 3</option>
                <option value={4}>Traste 4</option>
                <option value={5}>Traste 5</option>
                <option value={6}>Traste 6</option>
                <option value={7}>Traste 7</option>
              </select>
            </div>

            {/* Reset button if modified */}
            {isCustomized && (
              <button
                onClick={resetKeyAndCapo}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 text-xs font-bold flex items-center gap-1 transition"
                title="Restablecer tono y cejilla originales"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Restablecer
              </button>
            )}

            {/* Auto-scroll controls */}
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700/60">
              <button
                onClick={() => setIsScrolling(!isScrolling)}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                  isScrolling
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 animate-pulse'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                }`}
              >
                {isScrolling ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" /> Pausar
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" /> Autoscroll
                  </>
                )}
              </button>

              <select
                value={scrollSpeed}
                onChange={(e) => setScrollSpeed(Number(e.target.value))}
                className="bg-slate-900 text-slate-200 text-xs rounded-lg px-2 py-1 border border-slate-700 outline-none cursor-pointer font-mono"
                title="Velocidad de desplazamiento"
              >
                <option value={1}>Vel. 1x</option>
                <option value={2}>Vel. 2x</option>
                <option value={3}>Vel. 3x</option>
                <option value={5}>Vel. 5x</option>
              </select>
            </div>

            {/* Font Size controls */}
            <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700/60">
              <button
                onClick={() => setFontSize((f) => Math.max(14, f - 2))}
                className="p-1 text-slate-400 hover:text-white rounded text-xs font-bold"
                title="Disminuir texto"
              >
                A-
              </button>
              <span className="text-xs font-mono text-slate-300 px-1">{fontSize}px</span>
              <button
                onClick={() => setFontSize((f) => Math.min(28, f + 2))}
                className="p-1 text-slate-400 hover:text-white rounded text-xs font-bold"
                title="Aumentar texto"
              >
                A+
              </button>
            </div>

            {/* Metronome Drawer Toggle */}
            <button
              onClick={() => setShowMetronome(!showMetronome)}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 border transition ${
                showMetronome
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title="Metrónomo"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            {/* Stage Mode Toggle */}
            <button
              onClick={() => setStageMode(!stageMode)}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 border transition ${
                stageMode
                  ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title="Modo Escenario (Alto contraste)"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Print Button */}
            <button
              onClick={() => window.print()}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition"
              title="Imprimir o exportar PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* Metronome Floating Box if opened */}
        {showMetronome && (
          <div className="flex justify-center mb-6 animate-in slide-in-from-top duration-300">
            <Metronome initialBpm={tempo} />
          </div>
        )}

        {/* Metadata Banner: Key, Capo, Rhythm, Tempo */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 no-print shadow-xl">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="text-slate-500 font-semibold">Tono que suena:</span>
              <span className="font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-800/60 font-mono">
                {soundingKey}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="text-slate-500 font-semibold">Cejilla:</span>
              <span className="font-bold text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-800/60">
                {capo > 0 ? `Traste ${capo}` : 'Sin cejilla'}
              </span>
            </div>

            {tempo && (
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="text-slate-500 font-semibold">Tempo:</span>
                <span className="font-bold text-indigo-400 bg-indigo-950/60 px-2.5 py-0.5 rounded border border-indigo-800/60 font-mono">
                  {tempo} BPM ({timeSignature})
                </span>
              </div>
            )}

            {strumming && (
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="text-slate-500 font-semibold">Rasgueo:</span>
                <span className="font-bold text-slate-200 bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700 font-mono">
                  {strumming}
                </span>
              </div>
            )}
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-emerald-400" />
            <span>Haz clic en cualquier acorde para ver los trastes</span>
          </div>
        </div>

        {/* Chords Bar (Clickable chords chips for quick reference) */}
        {uniqueChords.length > 0 && (
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3 flex flex-wrap items-center gap-2 no-print">
            <span className="text-xs font-semibold text-slate-400 mr-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Acordes a poner en la guitarra:
            </span>
            {uniqueChords.map((chord) => (
              <button
                key={chord}
                onClick={() => setSelectedChord(chord)}
                className="px-3 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 font-chord font-bold text-xs transition transform hover:scale-105"
              >
                {chord}
              </button>
            ))}
          </div>
        )}

        {/* Printable Header (Visible only in print / PDF export) */}
        <div className="hidden print-only mb-4 text-black border-b border-black pb-3 font-sans">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black text-black tracking-tight">{title}</h1>
              <p className="text-sm font-semibold text-slate-800">{artist}</p>
            </div>
            <div className="text-right text-xs font-mono text-slate-900 space-y-0.5">
              <p><span className="font-bold">Tono real:</span> {soundingKey} {capo > 0 ? `| Capo: ${capo}` : ''}</p>
              {tempo && <p><span className="font-bold">Tempo:</span> {tempo} BPM ({timeSignature})</p>}
              {strumming && <p><span className="font-bold">Rasgueo:</span> {strumming}</p>}
            </div>
          </div>
        </div>

        {/* Lyric Sheet with Chords Positioned ABOVE Lyrics */}
        <div 
          className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 md:p-10 shadow-2xl font-chord leading-relaxed space-y-3 select-text print-container"
          style={{ fontSize: `${fontSize}px` }}
        >
          {parsedLines.map((line, idx) => {
            if (line.isSectionHeader) {
              return (
                <div
                  key={idx}
                  className="pt-6 pb-2 text-emerald-400 font-bold text-xs uppercase tracking-widest border-b border-slate-800/80 font-sans flex items-center gap-2 print-section-header"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block shadow-sm shadow-emerald-400/50 no-print" />
                  {line.segments[0]?.text}
                </div>
              );
            }

            // Detect if line is purely an instrumental / chord sequence line (like Intro / Solo / Outro)
            const isInstrumental = line.segments.length > 0 && line.segments.every((s) => s.chord && s.text.trim() === '');

            if (isInstrumental) {
              return (
                <div key={idx} className="flex flex-wrap items-center gap-3 sm:gap-4 py-2.5 my-1 line-row">
                  {line.segments.map((seg, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => setSelectedChord(seg.chord!)}
                      className="px-3.5 py-1.5 rounded-xl font-extrabold text-emerald-400 hover:text-slate-950 bg-emerald-950/90 hover:bg-emerald-400 border border-emerald-500/50 transition-all cursor-pointer font-chord text-sm shadow-md chord-chip-print"
                      title={`Ver acorde ${seg.chord}`}
                    >
                      {seg.chord}
                    </button>
                  ))}
                </div>
              );
            }

            return (
              <div key={idx} className="line-row flex flex-wrap items-end my-2">
                {line.segments.map((seg, sIdx) => (
                  <div key={sIdx} className="inline-flex flex-col items-start leading-tight mr-1.5">
                    {/* Chord row above lyrics */}
                    <div className="h-7 flex items-center mb-1">
                      {seg.chord ? (
                        <button
                          onClick={() => setSelectedChord(seg.chord!)}
                          className="px-1.5 py-0.5 rounded font-extrabold text-emerald-400 hover:text-white bg-emerald-950/80 hover:bg-emerald-500 border border-emerald-500/50 transition-all cursor-pointer font-chord text-[0.85em] shadow-sm chord-chip-print"
                          title={`Ver acorde ${seg.chord}`}
                        >
                          {seg.chord}
                        </button>
                      ) : null}
                    </div>

                    {/* Lyrics text below chord */}
                    <span className="whitespace-pre-wrap text-slate-200 font-chord pr-0.5 lyric-text-print">
                      {seg.text}
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Optional YouTube Video Embed */}
        {youtubeUrl && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 no-print space-y-3">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Play className="w-4 h-4 text-red-500 fill-current" /> Vídeo / Audio original de referencia
            </h3>
            <div className="aspect-video w-full rounded-xl overflow-hidden border border-slate-800">
              <iframe
                src={youtubeUrl.replace('watch?v=', 'embed/')}
                title={`Vídeo original de ${title}`}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          </div>
        )}

      </main>

      {/* Chord Diagram Modal when chord clicked */}
      <ChordDiagramModal
        chordName={selectedChord}
        onClose={() => setSelectedChord(null)}
      />
    </div>
  );
};
