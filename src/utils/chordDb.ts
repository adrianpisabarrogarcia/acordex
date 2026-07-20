// Guitar Chord Database with fret diagram coordinates and finger placement

export interface ChordDefinition {
  name: string;
  frets: number[]; // 6 elements from lowest string (E) to highest (e). -1 = muted (x), 0 = open (o)
  fingers?: number[]; // finger numbers 1=index, 2=middle, 3=ring, 4=pinky
  baseFret?: number; // starting fret if above fret 1
  barre?: { fret: number; startString: number; endString: number };
}

export const CHORD_DATABASE: Record<string, ChordDefinition> = {
  // Major Chords
  'C': { name: 'C', frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0] },
  'D': { name: 'D', frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2] },
  'E': { name: 'E', frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0] },
  'F': { name: 'F', frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 1, startString: 1, endString: 6 } },
  'G': { name: 'G', frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3] },
  'A': { name: 'A', frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0] },
  'B': { name: 'B', frets: [-1, 2, 4, 4, 4, 2], fingers: [0, 1, 2, 3, 4, 1], baseFret: 2, barre: { fret: 2, startString: 1, endString: 5 } },

  // Minor Chords
  'Cm': { name: 'Cm', frets: [-1, 3, 5, 5, 4, 3], fingers: [0, 1, 3, 4, 2, 1], baseFret: 3, barre: { fret: 3, startString: 1, endString: 5 } },
  'Dm': { name: 'Dm', frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1] },
  'Em': { name: 'Em', frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0] },
  'Fm': { name: 'Fm', frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 1, startString: 1, endString: 6 } },
  'Gm': { name: 'Gm', frets: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1], baseFret: 3, barre: { fret: 3, startString: 1, endString: 6 } },
  'Am': { name: 'Am', frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0] },
  'Bm': { name: 'Bm', frets: [-1, 2, 4, 4, 3, 2], fingers: [0, 1, 3, 4, 2, 1], baseFret: 2, barre: { fret: 2, startString: 1, endString: 5 } },

  // Seventh Chords
  'C7': { name: 'C7', frets: [-1, 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0] },
  'D7': { name: 'D7', frets: [-1, -1, 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3] },
  'E7': { name: 'E7', frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0] },
  'G7': { name: 'G7', frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1] },
  'A7': { name: 'A7', frets: [-1, 0, 2, 0, 2, 0], fingers: [0, 0, 2, 0, 3, 0] },
  'B7': { name: 'B7', frets: [-1, 2, 1, 2, 0, 2], fingers: [0, 2, 1, 3, 0, 4] },

  // Minor 7th & Major 7th
  'Am7': { name: 'Am7', frets: [-1, 0, 2, 0, 1, 0], fingers: [0, 0, 2, 0, 1, 0] },
  'Em7': { name: 'Em7', frets: [0, 2, 2, 0, 3, 0], fingers: [0, 1, 2, 0, 3, 0] },
  'Dm7': { name: 'Dm7', frets: [-1, -1, 0, 2, 1, 1], fingers: [0, 0, 0, 2, 1, 1], barre: { fret: 1, startString: 5, endString: 6 } },
  'Cmaj7': { name: 'Cmaj7', frets: [-1, 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0] },
  'Fmaj7': { name: 'Fmaj7', frets: [-1, -1, 3, 2, 1, 0], fingers: [0, 0, 3, 2, 1, 0] },
  'Gmaj7': { name: 'Gmaj7', frets: [3, 2, 0, 0, 0, 2], fingers: [3, 2, 0, 0, 0, 1] },

  // Suspended & Add Chords
  'Dsus4': { name: 'Dsus4', frets: [-1, -1, 0, 2, 3, 3], fingers: [0, 0, 0, 1, 2, 3] },
  'Gsus4': { name: 'Gsus4', frets: [3, 3, 0, 0, 1, 3], fingers: [2, 3, 0, 0, 1, 4] },
  'Asus4': { name: 'Asus4', frets: [-1, 0, 2, 2, 3, 0], fingers: [0, 0, 1, 2, 3, 0] },
  'Cadd9': { name: 'Cadd9', frets: [-1, 3, 2, 0, 3, 3], fingers: [0, 2, 1, 0, 3, 4] },
  'G/B': { name: 'G/B', frets: [-1, 2, 0, 0, 0, 3], fingers: [0, 1, 0, 0, 0, 3] },
};

/**
 * Normalizes a chord name to look up in the database.
 * If not found, falls back to root chord (e.g., "F#m7" -> "Fm7" or "Fm" or "F").
 */
export function getChordDiagram(chordName: string): ChordDefinition {
  const clean = chordName.trim();
  if (CHORD_DATABASE[clean]) return CHORD_DATABASE[clean];

  // Try removing slash bass note (e.g., "G/B" -> "G")
  const baseName = clean.split('/')[0];
  if (CHORD_DATABASE[baseName]) return CHORD_DATABASE[baseName];

  // Try matching root note + minor/major base
  if (baseName.endsWith('m7')) {
    const rootm = baseName.replace('7', '');
    if (CHORD_DATABASE[rootm]) return CHORD_DATABASE[rootm];
  }
  if (baseName.endsWith('7')) {
    const root = baseName.replace('7', '');
    if (CHORD_DATABASE[root]) return CHORD_DATABASE[root];
  }

  // Generic fallback diagram for unlisted chord
  return {
    name: chordName,
    frets: [0, 0, 0, 0, 0, 0],
    fingers: [0, 0, 0, 0, 0, 0],
  };
}
