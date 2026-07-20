import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  Sparkles,
  Tv,
  ChevronLeft,
  ChevronRight,
  X
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

interface Slide {
  title: string;
  lines: string[];
}

const getSlideFontClass = (count: number) => {
  if (count <= 3) return 'text-3xl sm:text-5xl md:text-6xl space-y-4 sm:space-y-6';
  if (count <= 5) return 'text-2xl sm:text-4xl md:text-5xl space-y-3 sm:space-y-5';
  if (count <= 7) return 'text-xl sm:text-3xl md:text-4xl space-y-2 sm:space-y-4';
  if (count <= 9) return 'text-lg sm:text-2xl md:text-3xl space-y-2 sm:space-y-3';
  return 'text-base sm:text-xl md:text-2xl space-y-1.5 sm:space-y-2';
};

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
  const [fontSize, setFontSize] = useState(17); // px default for mobile readability
  const [stageMode, setStageMode] = useState(false);
  const [projectorMode, setProjectorMode] = useState(false);
  const [showChordsInTvMode, setShowChordsInTvMode] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [fadeState, setFadeState] = useState<'in' | 'out'>('in');
  const [fontScale, setFontScale] = useState(1);
  const [showMetronome, setShowMetronome] = useState(false);
  const [selectedChord, setSelectedChord] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const slideContainerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Smooth slide cross-fade transition
  useEffect(() => {
    if (slideIndex === activeSlideIndex) return;
    setFadeState('out');

    const timer = setTimeout(() => {
      setActiveSlideIndex(slideIndex);
      setFadeState('in');
    }, 160);

    return () => clearTimeout(timer);
  }, [slideIndex, activeSlideIndex]);

  // Reset font scale on slide change
  useEffect(() => {
    if (!projectorMode) return;
    setFontScale(1);
  }, [slideIndex, projectorMode]);

  // Auto-fit overflow check
  useEffect(() => {
    if (!projectorMode || !slideContainerRef.current) return;
    const container = slideContainerRef.current;
    if (container.scrollHeight > container.clientHeight && fontScale > 0.5) {
      setFontScale((prev) => Math.max(0.5, prev - 0.08));
    }
  }, [slideIndex, projectorMode, fontScale]);

  // Parse pure lyrics & raw lines grouped into slides for TV Presentation Mode
  const slides: { title: string; lines: string[]; rawLines: string[] }[] = React.useMemo(() => {
    const rawLines = rawContent.split('\n');
    const result: { title: string; lines: string[]; rawLines: string[] }[] = [];
    let currentTitle = 'Letra';
    let currentLines: string[] = [];
    let currentRawLines: string[] = [];

    rawLines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        if (currentLines.length > 0 || currentRawLines.length > 0) {
          result.push({ title: currentTitle, lines: currentLines, rawLines: currentRawLines });
          currentLines = [];
          currentRawLines = [];
        }
        return;
      }

      // Detect section headers like [Verso 1], [Estribillo], [Versos 2, 3, 4] [x4]
      const isHeaderLine = /^\[\s*(verso|estribillo|intro|coro|puente|outro|solo|sólo|letra|estrofa|pre-coro|pre-estribillo|versos)/i.test(trimmed);

      if (isHeaderLine) {
        if (currentLines.length > 0 || currentRawLines.length > 0) {
          result.push({ title: currentTitle, lines: currentLines, rawLines: currentRawLines });
          currentLines = [];
          currentRawLines = [];
        }
        currentTitle = trimmed.replace(/^\[/, '').replace(/\]$/, '').replace(/\]\s*\[/g, ' ');
        return;
      }

      currentRawLines.push(line);
      const pureLyrics = trimmed.replace(/\[[^\]]+\]/g, '').replace(/\s+/g, ' ').trim();
      if (pureLyrics || /^(\[[A-G][#b]?[^\]]*\]\s*)+$/i.test(trimmed)) {
        currentLines.push(pureLyrics);
      }
    });

    if (currentLines.length > 0 || currentRawLines.length > 0) {
      result.push({ title: currentTitle, lines: currentLines, rawLines: currentRawLines });
    }

    return result.filter((s) => s.lines.length > 0 || s.rawLines.length > 0);
  }, [rawContent]);

  const toggleProjectorMode = () => {
    if (!projectorMode) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
      setSlideIndex(0);
      setProjectorMode(true);
    } else {
      if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      setProjectorMode(false);
    }
  };

  // Keyboard navigation for TV Slide Presentation mode (ArrowLeft, ArrowRight, Space, PageUp, PageDown)
  useEffect(() => {
    if (!projectorMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        setSlideIndex((prev) => Math.min(slides.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setSlideIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'Escape') {
        if (document.exitFullscreen && document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
        setProjectorMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [projectorMode, slides.length]);

  // 1. Sounding key calculation (the real audio pitch coming out of the guitar)
  const preferFlats = FLAT_KEYS.includes(originalKey);
  const soundingKey = transposeNote(originalKey, semitones, preferFlats);

  // 2. Net chord shape transposition:
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
      
      {/* Fullscreen TV Slide Presentation Mode (Pure Lyrics or Chords, Portal to document.body) */}
      {projectorMode && mounted ? (
        createPortal(
          <div
            className="fixed inset-0 z-[99999] bg-black text-white flex flex-col p-3 sm:p-12 select-none animate-in fade-in duration-300"
            onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
            onTouchEnd={(e) => {
              if (touchStartX.current === null) return;
              const delta = touchStartX.current - e.changedTouches[0].clientX;
              touchStartX.current = null;
              if (Math.abs(delta) < 50) return; // ignore small movements / taps
              if (delta > 0) {
                // swipe left → siguiente
                setSlideIndex((prev) => Math.min(slides.length - 1, prev + 1));
              } else {
                // swipe right → anterior
                setSlideIndex((prev) => Math.max(0, prev - 1));
              }
            }}
          >
            
            {/* Top Bar — compact 2-row on mobile, single row on desktop */}
            <div className="border-b border-slate-800/80 pb-3 sm:pb-4 mb-3 sm:mb-0">
              {/* Row 1: title + section pill + close */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <h2 className="text-sm sm:text-2xl font-black tracking-tight text-white truncate">
                    {title}
                  </h2>
                  {(() => {
                    const fullTitle = slides[activeSlideIndex]?.title || 'Letra';
                    const match = fullTitle.match(/^(.*?)\s*(x\d+|\(x\d+\))$/i);
                    const mainTitle = match ? match[1] : fullTitle;
                    const repeatTag = match ? match[2].replace(/[()]/g, '') : null;
                    return (
                      <span className="inline-flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-widest font-mono">
                          {mainTitle}
                        </span>
                        {repeatTag && (
                          <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-widest font-mono animate-pulse">
                            {repeatTag}
                          </span>
                        )}
                      </span>
                    );
                  })()}
                </div>

                <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                  {/* Toggle Chords Button — icon-only on mobile */}
                  <button
                    onClick={() => setShowChordsInTvMode(!showChordsInTvMode)}
                    className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl font-bold text-xs transition border cursor-pointer ${
                      showChordsInTvMode
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
                    }`}
                    title="Mostrar u ocultar acordes en Modo TV"
                  >
                    <Music className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline">{showChordsInTvMode ? 'Acordes ON' : 'Solo Letra'}</span>
                  </button>

                  {/* Slide counter */}
                  <span className="text-xs font-mono font-bold text-slate-300 bg-slate-900 px-2 sm:px-3 py-1 rounded-xl border border-slate-800 shrink-0">
                    {activeSlideIndex + 1}/{slides.length}
                  </span>

                  {/* Close */}
                  <button
                    onClick={toggleProjectorMode}
                    className="p-1.5 sm:p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
                    title="Salir del Modo TV (Esc)"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Main Slide Display (Pure Lyrics OR Lyrics with Chords) */}
            <div 
              ref={slideContainerRef}
              className="my-auto max-w-6xl mx-auto w-full text-center py-4 sm:py-8 overflow-hidden flex flex-col justify-center items-center flex-grow"
            >
              <div 
                className={`w-full transition-all duration-300 ease-out transform ${
                  fadeState === 'in'
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-3 scale-[0.98]'
                } ${getSlideFontClass(slides[activeSlideIndex]?.lines.length || 0)}`}
                style={{ zoom: fontScale }}
              >
                {showChordsInTvMode ? (
                  /* TV Mode WITH Transposed Chords */
                  <div className="space-y-4 sm:space-y-6">
                    {parseSongText(
                      (slides[activeSlideIndex]?.rawLines || []).join('\n'),
                      semitones,
                      preferFlats
                    ).map((line, lIdx) => {
                      if (line.isSectionHeader) return null;

                      const isInstrumental = line.segments.length > 0 && line.segments.every((s) => s.chord && s.text.trim() === '');

                      if (isInstrumental) {
                        return (
                          <div key={lIdx} className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 py-2">
                            {line.segments.map((seg, sIdx) => (
                              <span
                                key={sIdx}
                                className="px-3.5 py-1.5 rounded-xl font-extrabold text-emerald-400 bg-emerald-950/90 border border-emerald-500/50 font-chord text-lg sm:text-2xl shadow-lg"
                              >
                                {seg.chord}
                              </span>
                            ))}
                          </div>
                        );
                      }

                      return (
                        <div key={lIdx} className="flex flex-wrap items-end justify-center my-1 sm:my-2">
                          {line.segments.map((seg, sIdx) => {
                            const hasTrailingSpace = /\s$/.test(seg.text) || seg.text === '' || seg.text === ' ';
                            const marginClass = hasTrailingSpace ? 'mr-2 sm:mr-3' : 'mr-0.5';

                            return (
                              <div key={sIdx} className={`inline-flex flex-col items-start leading-tight min-w-max ${marginClass}`}>
                                {/* Chord above lyric in TV mode */}
                                <div className="h-7 sm:h-9 flex items-center mb-1 min-w-full justify-start">
                                  {seg.chord ? (
                                    <span className="px-2 py-0.5 rounded-lg font-extrabold text-emerald-400 bg-emerald-950/90 border border-emerald-500/50 font-chord text-[0.75em] sm:text-[0.85em] shadow-md whitespace-nowrap">
                                      {seg.chord}
                                    </span>
                                  ) : null}
                                </div>

                                {/* Lyric text below chord */}
                                <span className="whitespace-pre-wrap text-slate-100 font-extrabold font-sans tracking-wide">
                                  {seg.text}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* TV Mode PURE LYRICS (Without Chords) */
                  slides[activeSlideIndex]?.lines.map((lyricLine, lIdx) => (
                    <p 
                      key={lIdx} 
                      className="font-extrabold tracking-wide text-slate-100 font-sans text-balance drop-shadow-md my-2"
                    >
                      {lyricLine}
                    </p>
                  ))
                )}

                {/* Repeat Multiplier Badge below lyrics if section has x2, x4 etc. */}
                {(() => {
                  const fullTitle = slides[activeSlideIndex]?.title || '';
                  const match = fullTitle.match(/x\d+/i);
                  if (!match) return null;
                  const multiplier = match[0].toLowerCase();

                  return (
                    <div className="mt-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm sm:text-base font-bold tracking-wider font-mono shadow-lg">
                      <span className="opacity-80">🔁 Repetir</span>
                      <span className="text-amber-400 text-lg font-black">{multiplier}</span>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Bottom Bar: Touch & Keyboard Navigation Controls */}
            <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 sm:pt-4 mt-3 sm:mt-0">
              <button
                disabled={slideIndex === 0}
                onClick={() => setSlideIndex((prev) => Math.max(0, prev - 1))}
                className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-3 sm:py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-emerald-400 font-bold border border-slate-800 transition active:scale-95 text-sm"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Anterior</span>
              </button>

              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-mono">
                <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800">←</span>
                <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800">→</span>
                <span>o Espacio para cambiar diapositiva</span>
              </div>

              {/* Mobile: swipe hint */}
              <p className="sm:hidden text-[10px] text-slate-600 font-mono">desliza o usa los botones</p>

              <button
                disabled={slideIndex === slides.length - 1}
                onClick={() => setSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
                className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:opacity-30 disabled:pointer-events-none font-extrabold border border-emerald-400 transition active:scale-95 shadow-lg shadow-emerald-500/20 text-sm"
              >
                <span className="hidden sm:inline">Siguiente</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

          </div>,
          document.body
        )
      ) : (
        <>
          {/* Top Floating Control Toolbar (Responsive & Swipeable on Mobile) */}
          <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-2xl px-3 sm:px-4 py-2.5 no-print">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5">
              
              {/* Song Info summary */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                    <span className="truncate max-w-[200px] sm:max-w-none">{title}</span>
                    <span className="shrink-0 text-[11px] sm:text-xs font-normal px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                      Tono: {soundingKey}
                    </span>
                  </h1>
                  <p className="text-xs text-slate-400 font-medium truncate">{artist}</p>
                </div>
              </div>

              {/* Interactive Toolbars (Horizontal Touch Scroll on Mobile) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs">
                
                {/* Transposer Group */}
                <div className="flex items-center shrink-0 bg-slate-800 rounded-xl p-1 border border-slate-700/60 shadow-inner">
                  <span className="text-[11px] text-slate-400 font-medium px-1.5 flex items-center gap-1">
                    <Music className="w-3.5 h-3.5 text-emerald-400" /> Tono
                  </span>
                  <button
                    onClick={() => setSemitones((s) => s - 1)}
                    className="px-2.5 py-1 font-bold bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition active:scale-95"
                    title="Bajar 1 semitono"
                  >
                    -1
                  </button>
                  <span className="w-7 text-center font-mono font-bold text-emerald-400">
                    {semitones > 0 ? `+${semitones}` : semitones}
                  </span>
                  <button
                    onClick={() => setSemitones((s) => s + 1)}
                    className="px-2.5 py-1 font-bold bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition active:scale-95"
                    title="Subir 1 semitono"
                  >
                    +1
                  </button>
                </div>

                {/* Capo Selector */}
                <div className="flex items-center shrink-0 bg-slate-800 rounded-xl p-1 border border-slate-700/60">
                  <span className="text-[11px] text-slate-400 font-medium px-1.5">Cejilla</span>
                  <select
                    value={capo}
                    onChange={(e) => setCapo(Number(e.target.value))}
                    className="bg-slate-900 text-amber-400 font-bold rounded-lg px-2 py-1 border border-slate-700 outline-none cursor-pointer"
                  >
                    <option value={0}>Sin capo</option>
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
                    className="shrink-0 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-bold flex items-center gap-1 transition"
                    title="Restablecer tono y cejilla originales"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Auto-scroll controls */}
                <div className="flex items-center shrink-0 gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700/60">
                  <button
                    onClick={() => setIsScrolling(!isScrolling)}
                    className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition ${
                      isScrolling
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 animate-pulse'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                    }`}
                  >
                    {isScrolling ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" /> Pausa
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" /> Scroll
                      </>
                    )}
                  </button>

                  <select
                    value={scrollSpeed}
                    onChange={(e) => setScrollSpeed(Number(e.target.value))}
                    className="bg-slate-900 text-slate-200 rounded-lg px-1.5 py-1 border border-slate-700 outline-none cursor-pointer font-mono"
                  >
                    <option value={1}>1x</option>
                    <option value={2}>2x</option>
                    <option value={3}>3x</option>
                    <option value={5}>5x</option>
                  </select>
                </div>

                {/* Font Size controls */}
                <div className="flex items-center shrink-0 bg-slate-800 rounded-xl p-1 border border-slate-700/60">
                  <button
                    onClick={() => setFontSize((f) => Math.max(13, f - 1))}
                    className="px-2 py-0.5 text-slate-300 hover:text-white rounded font-bold"
                    title="Disminuir texto"
                  >
                    A-
                  </button>
                  <span className="font-mono text-slate-300 px-1">{fontSize}</span>
                  <button
                    onClick={() => setFontSize((f) => Math.min(26, f + 1))}
                    className="px-2 py-0.5 text-slate-300 hover:text-white rounded font-bold"
                    title="Aumentar texto"
                  >
                    A+
                  </button>
                </div>

                {/* Metronome Toggle */}
                <button
                  onClick={() => setShowMetronome(!showMetronome)}
                  className={`p-2 rounded-xl shrink-0 border transition ${
                    showMetronome
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                  title="Metrónomo"
                >
                  <Volume2 className="w-4 h-4" />
                </button>

                {/* Stage Mode Toggle */}
                <button
                  onClick={() => setStageMode(!stageMode)}
                  className={`p-2 rounded-xl shrink-0 border transition ${
                    stageMode
                      ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                  title="Modo Escenario"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                {/* Proyectar / Chromecast TV Button */}
                <button
                  onClick={toggleProjectorMode}
                  className="px-3 py-2 rounded-xl shrink-0 bg-emerald-500 hover:bg-emerald-400 text-slate-950 border border-emerald-400 shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5 font-bold"
                  title="Modo Proyector TV (Diapositivas sin acordes)"
                >
                  <Tv className="w-4 h-4 shrink-0" />
                  <span className="text-xs">Modo TV</span>
                </button>

                {/* Print Button */}
                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-xl shrink-0 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                  title="Imprimir o exportar PDF"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-6">

            {/* Metronome Floating Box if opened */}
            {showMetronome && (
              <div className="flex justify-center mb-4 animate-in slide-in-from-top duration-300">
                <Metronome initialBpm={tempo} />
              </div>
            )}

            {/* Metadata Banner: Key, Capo, Rhythm, Tempo */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 no-print shadow-xl">
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-xs">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="text-slate-500 font-semibold">Tono:</span>
                  <span className="font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60 font-mono">
                    {soundingKey}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="text-slate-500 font-semibold">Cejilla:</span>
                  <span className="font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                    {capo > 0 ? `Traste ${capo}` : 'Sin cejilla'}
                  </span>
                </div>

                {tempo && (
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="text-slate-500 font-semibold">Tempo:</span>
                    <span className="font-bold text-indigo-400 bg-indigo-950/60 px-2.5 py-0.5 rounded border border-indigo-800/60 font-mono">
                      {tempo} BPM
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

              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Pulsa cualquier acorde para ver los trastes</span>
              </div>
            </div>

            {/* Chords Bar (Clickable chords chips for quick reference) */}
            {uniqueChords.length > 0 && (
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3 flex flex-wrap items-center gap-2 no-print">
                <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" /> Acordes:
                </span>
                {uniqueChords.map((chord) => (
                  <button
                    key={chord}
                    onClick={() => setSelectedChord(chord)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 font-chord font-bold text-xs transition active:scale-95 cursor-pointer"
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
              className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 sm:p-8 md:p-10 shadow-2xl font-chord leading-relaxed space-y-3 select-text print-container overflow-x-auto"
              style={{ fontSize: `${fontSize}px` }}
            >
              {parsedLines.map((line, idx) => {
                if (line.isSectionHeader) {
                  return (
                    <div
                      key={idx}
                      className="pt-4 sm:pt-6 pb-1.5 sm:pb-2 text-emerald-400 font-bold text-xs uppercase tracking-widest border-b border-slate-800/80 font-sans flex items-center gap-2 print-section-header"
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
                    <div key={idx} className="flex flex-wrap items-center gap-2 sm:gap-4 py-2 my-1 line-row">
                      {line.segments.map((seg, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => setSelectedChord(seg.chord!)}
                          className="px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl font-extrabold text-emerald-400 hover:text-slate-950 bg-emerald-950/90 hover:bg-emerald-400 border border-emerald-500/50 transition-all cursor-pointer font-chord text-xs sm:text-sm shadow-md chord-chip-print active:scale-95"
                          title={`Ver acorde ${seg.chord}`}
                        >
                          {seg.chord}
                        </button>
                      ))}
                    </div>
                  );
                }

                return (
                  <div key={idx} className="line-row flex flex-wrap items-end my-1 sm:my-2">
                    {line.segments.map((seg, sIdx) => {
                      const hasTrailingSpace = /\s$/.test(seg.text) || seg.text === '' || seg.text === ' ';
                      const marginClass = hasTrailingSpace ? 'mr-1 sm:mr-1.5' : 'mr-0';

                      return (
                        <div key={sIdx} className={`inline-flex flex-col items-start leading-tight min-w-max ${marginClass}`}>
                          {/* Chord row above lyrics */}
                          <div className="h-6 sm:h-7 flex items-center mb-0.5 sm:mb-1 min-w-full">
                            {seg.chord ? (
                              <button
                                onClick={() => setSelectedChord(seg.chord!)}
                                className="px-1.5 py-0.5 rounded font-extrabold text-emerald-400 hover:text-white bg-emerald-950/80 hover:bg-emerald-500 border border-emerald-500/50 transition-all cursor-pointer font-chord text-[0.82em] sm:text-[0.85em] shadow-sm chord-chip-print active:scale-95 whitespace-nowrap shrink-0"
                                title={`Ver acorde ${seg.chord}`}
                              >
                                {seg.chord}
                              </button>
                            ) : null}
                          </div>

                          {/* Lyrics text below chord */}
                          <span className="whitespace-pre-wrap text-slate-200 font-chord lyric-text-print">
                            {seg.text}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Optional YouTube Video Embed */}
            {youtubeUrl && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-3.5 sm:p-4 no-print space-y-3">
                <h3 className="text-xs sm:text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Play className="w-4 h-4 text-red-500 fill-current shrink-0" /> Vídeo / Audio original de referencia
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
        </>
      )}

      {/* Chord Diagram Modal when chord clicked */}
      <ChordDiagramModal
        chordName={selectedChord}
        onClose={() => setSelectedChord(null)}
      />
    </div>
  );
};
