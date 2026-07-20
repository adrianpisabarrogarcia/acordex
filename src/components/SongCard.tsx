import React from 'react';
import { Music, Tag, Flame, Disc } from 'lucide-react';

export interface SongItem {
  slug: string;
  title: string;
  artist: string;
  key: string;
  capo?: number;
  tags: string[];
  difficulty?: 'fácil' | 'intermedio' | 'avanzado';
}

export const SongCard: React.FC<{ song: SongItem }> = ({ song }) => {
  const getDifficultyColor = (diff?: string) => {
    switch (diff) {
      case 'fácil':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'intermedio':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'avanzado':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <a
      href={`/canciones/${song.slug}`}
      className="group relative bg-slate-900/70 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 transition-all duration-300 shadow-lg hover:shadow-emerald-500/10 flex flex-col justify-between"
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
              {song.title}
            </h3>
            <p className="text-sm text-slate-400 font-medium flex items-center gap-1.5">
              <Disc className="w-3.5 h-3.5 text-indigo-400" />
              {song.artist}
            </p>
          </div>
          <span className="shrink-0 px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 font-mono font-bold text-xs">
            Tono: {song.key}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
          {song.capo ? (
            <span className="px-2 py-0.5 rounded-md bg-amber-950/60 text-amber-400 border border-amber-800/50 font-medium">
              Cejilla {song.capo}
            </span>
          ) : null}

          {song.difficulty && (
            <span className={`px-2 py-0.5 rounded-md border text-xs font-semibold capitalize flex items-center gap-1 ${getDifficultyColor(song.difficulty)}`}>
              <Flame className="w-3 h-3" />
              {song.difficulty}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 pt-4 border-t border-slate-800/60 text-xs text-slate-500">
        <Tag className="w-3.5 h-3.5 text-slate-400" />
        <div className="flex flex-wrap gap-1">
          {song.tags.map((tag) => (
            <span key={tag} className="text-slate-400 hover:text-slate-200">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </a>
  );
};
