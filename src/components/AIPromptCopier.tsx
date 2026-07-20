import React, { useState } from 'react';
import { Copy, Check, Sparkles, Code, Play, FileText, ArrowRight } from 'lucide-react';
import { parseSongText } from '../utils/chordTransposer';

const SYSTEM_PROMPT_TEMPLATE = `Actúa como un experto transcriptor musical para la aplicación Acordex.
Convierte la siguiente canción al formato Markdown estructurado con acordes entre corchetes [Acorde] justo antes de la sílaba exacta donde deben sonar.

REGLAS DE FORMATO (OBLIGATORIO):
1. Devuelve ÚNICAMENTE el bloque Markdown válido. No agregues saludos ni comentarios explicativos fuera del bloque.
2. El encabezado YAML (frontmatter) debe contener:
   - title: Título exacto
   - artist: Nombre del artista o grupo
   - key: Tonalidad principal (ej. "G", "Am", "C#m", "Eb")
   - capo: Número de traste de la cejilla (0 si no lleva)
   - tempo: BPM aproximado (ej. 104)
   - timeSignature: Compás (ej. "4/4", "3/4")
   - strumming: Patrón de rasgueo sugerido con flechas (ej. "↓  ↓ ↑  ↑ ↓ ↑")
   - tags: Lista de etiquetas (ej. ["rock", "pop", "español"])
   - difficulty: "fácil", "intermedio" o "avanzado"
   - youtubeUrl: URL de YouTube del tema oficial (opcional)

3. Formato de la letra:
   - Coloca etiquetas de sección entre corchetes: [Intro], [Verso 1], [Estribillo], [Solo], [Puente], [Outro].
   - Coloca los acordes entre corchetes pegados a la letra: "[G]Esta es la [D]letra".

---
CANCIÓN A CONVERTIR:
`;

export const AIPromptCopier: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [songName, setSongName] = useState('');
  const [artistName, setArtistName] = useState('');
  
  // Playground preview state
  const [rawMarkdown, setRawMarkdown] = useState(`---
title: "Ejemplo con IA"
artist: "Banda de Prueba"
key: "G"
capo: 0
tempo: 120
timeSignature: "4/4"
strumming: "↓  ↓ ↑  ↑ ↓ ↑"
tags: ["pop", "acústico"]
difficulty: "fácil"
---

[Intro]
[G] [D] [Em] [C]

[Verso 1]
[G]Esta es una prueba de [D]importación con IA
[Em]Los acordes se colocan [C]justo encima de la letra`);

  const fullPrompt = `${SYSTEM_PROMPT_TEMPLATE}${
    songName || artistName ? `Título: ${songName} | Artista: ${artistName}\n` : ''
  }La canción está adjuntada como imagen o archivo PDF a este chat.`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Preview parser
  const linesWithoutFrontmatter = rawMarkdown.replace(/^---[\s\S]*?---\n?/, '');
  const parsedPreview = parseSongText(linesWithoutFrontmatter, 0);

  return (
    <div className="space-y-10">
      
      {/* Step 1: Prompt Generator Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
        
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-emerald-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Prompt Maestro para IA</h3>
              <p className="text-xs text-slate-400">Copia este prompt y pégalo en ChatGPT, Gemini o Claude</p>
            </div>
          </div>

          <button
            onClick={copyToClipboard}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-lg transform hover:scale-105 ${
              copied
                ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" /> ¡Prompt Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copiar Prompt Maestro
              </>
            )}
          </button>
        </div>

        {/* Optional inputs to pre-fill */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Título de la canción (opcional):</label>
            <input
              type="text"
              placeholder="Ej. 'Lamento Boliviano'"
              value={songName}
              onChange={(e) => setSongName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white text-xs outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Artista o Banda (opcional):</label>
            <input
              type="text"
              placeholder="Ej. 'Enanitos Verdes'"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white text-xs outline-none"
            />
          </div>
        </div>

        {/* Prompt Box */}
        <div className="relative bg-slate-950 border border-slate-800/80 rounded-2xl p-4 font-mono text-xs text-slate-300 leading-relaxed max-h-60 overflow-y-auto">
          <pre className="whitespace-pre-wrap">{fullPrompt}</pre>
        </div>
      </div>

      {/* Step 2 & 3: Interactive Sandbox Tester */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
        
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
            <Code className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Probador de Formato (Sandbox)</h3>
            <p className="text-xs text-slate-400">Pega aquí lo que te devuelva la IA para previsualizar cómo se verá en Acordex</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column: Markdown Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5"><FileText className="w-4 h-4 text-emerald-400" /> Contenido Markdown devuelto por IA:</span>
            </div>
            <textarea
              rows={12}
              value={rawMarkdown}
              onChange={(e) => setRawMarkdown(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-2xl p-4 font-mono text-xs text-slate-200 outline-none leading-relaxed resize-none shadow-inner"
              placeholder="Pega aquí el resultado Markdown de la IA..."
            />
          </div>

          {/* Right Column: Live Acordex Renderer Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5"><Play className="w-4 h-4 text-amber-400" /> Previsualización en Acordex:</span>
              <span className="text-[11px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60 font-mono">Render en vivo</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 min-h-[300px] font-chord space-y-2 overflow-y-auto">
              {parsedPreview.map((line, idx) => {
                if (line.isSectionHeader) {
                  return (
                    <div key={idx} className="pt-3 pb-1 text-emerald-400 font-bold text-xs uppercase tracking-widest border-b border-slate-800/80 font-sans flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                      {line.segments[0]?.text}
                    </div>
                  );
                }

                return (
                  <div key={idx} className="line-row flex flex-wrap items-end my-1">
                    {line.segments.map((seg, sIdx) => (
                      <div key={sIdx} className="inline-flex flex-col items-start leading-tight">
                        <div className="h-6 flex items-center mb-0.5">
                          {seg.chord ? (
                            <span className="px-1.5 py-0.5 rounded font-extrabold text-emerald-400 bg-emerald-950/80 border border-emerald-500/50 text-[0.8em]">
                              {seg.chord}
                            </span>
                          ) : null}
                        </div>
                        <span className="whitespace-pre-wrap text-slate-200 text-sm font-chord pr-0.5">
                          {seg.text}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
