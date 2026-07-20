import React, { useState, useMemo } from 'react';
import { SongCard, type SongItem } from './SongCard';
import { Search, Music, Tag, X, RotateCcw } from 'lucide-react';

interface SongFilterSearchProps {
  songs: SongItem[];
}

/**
 * Normalizes strings by removing accents/diacritics and converting to lowercase
 * e.g. "Canción" -> "cancion", "Fácil" -> "facil"
 */
function normalizeString(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export const SongFilterSearch: React.FC<SongFilterSearchProps> = ({ songs = [] }) => {
  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    songs.forEach((s) => s.tags?.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [songs]);

  // Robust search and filtering logic
  const filteredSongs = useMemo(() => {
    const normQuery = normalizeString(query.trim());

    return songs.filter((song) => {
      // 1. Search Query Matching (title, artist, key, tags, difficulty)
      const matchesQuery =
        normQuery === '' ||
        normalizeString(song.title).includes(normQuery) ||
        normalizeString(song.artist).includes(normQuery) ||
        normalizeString(song.key).includes(normQuery) ||
        song.tags.some((t) => normalizeString(t).includes(normQuery)) ||
        (song.difficulty && normalizeString(song.difficulty).includes(normQuery));

      // 2. Tag Filter
      const matchesTag = selectedTag === null || song.tags.includes(selectedTag);

      // 3. Difficulty Filter
      const matchesDifficulty =
        selectedDifficulty === null || song.difficulty === selectedDifficulty;

      return matchesQuery && matchesTag && matchesDifficulty;
    });
  }, [songs, query, selectedTag, selectedDifficulty]);

  const hasActiveFilters = query !== '' || selectedTag !== null || selectedDifficulty !== null;

  const resetAllFilters = () => {
    setQuery('');
    setSelectedTag(null);
    setSelectedDifficulty(null);
  };

  return (
    <div className="space-y-8">
      {/* Search Input & Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-2xl space-y-4">
        
        {/* Search Bar Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
          <input
            type="text"
            placeholder="Buscar por canción, artista, tono o tag (ej. 'La Flaca', 'Fito', 'Sol', 'rock')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-12 pr-10 py-3.5 text-white placeholder-slate-500 outline-none transition text-sm shadow-inner"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition"
              title="Limpiar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tags & Difficulty Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
          
          {/* Tag Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 font-semibold flex items-center gap-1 mr-1">
              <Tag className="w-3.5 h-3.5 text-emerald-400" /> Tags:
            </span>
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-2.5 py-1 rounded-lg border transition ${
                selectedTag === null
                  ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              Todos
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-2.5 py-1 rounded-lg border transition ${
                  selectedTag === tag
                    ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>

          {/* Difficulty Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-xs px-2">Dificultad:</span>
            {['fácil', 'intermedio', 'avanzado'].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(selectedDifficulty === diff ? null : diff)}
                className={`px-2.5 py-1 rounded text-xs capitalize transition ${
                  selectedDifficulty === diff
                    ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Reset All Filters button if active */}
        {hasActiveFilters && (
          <div className="pt-2 flex justify-end">
            <button
              onClick={resetAllFilters}
              className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1.5 underline"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Restablecer filtros
            </button>
          </div>
        )}
      </div>

      {/* Results Header & Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-400">
            Mostrando <span className="font-bold text-white">{filteredSongs.length}</span> {filteredSongs.length === 1 ? 'canción' : 'canciones'}
          </p>
        </div>

        {filteredSongs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSongs.map((song) => (
              <SongCard key={song.slug} song={song} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800 space-y-4">
            <Music className="w-12 h-12 text-slate-600 mx-auto animate-bounce" />
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">
                {songs.length === 0 ? 'Tu cancionero está vacío' : 'No se encontraron canciones'}
              </h3>
              <p className="text-sm text-slate-400">
                {songs.length === 0
                  ? 'Añade tus archivos Markdown en src/content/songs/ o genera canciones usando la IA.'
                  : query
                  ? `No hay ninguna canción que coincida con "${query}".`
                  : 'No hay ninguna canción con los filtros seleccionados.'}
              </p>
            </div>
            {songs.length === 0 ? (
              <a
                href="/importar-ia"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition"
              >
                <span>Importar mi primera canción con IA</span> ✨
              </a>
            ) : (
              <button
                onClick={resetAllFilters}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition"
              >
                Ver todas las canciones
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
